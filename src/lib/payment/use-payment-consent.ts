import { useCallback, useState } from 'react';
import { useClientConfig, useCommonConfig, useSwaggerClients } from '@/adapters/external/Provider';
import type { ClientSecretRes, CreateCustomerRes, PaymentConsentRes } from '@/clients/alcohol/zinc/api';
import { init } from '@airwallex/components-sdk';
import { useTheme } from '@/lib/theme/provider';
import { useHasPaymentConsent, useUserId } from '@/lib/auth/use-user';

/**
 * Which charging relationship the consent authorizes, mirroring zinc's
 * purpose-scoped consents (card-network MIT classification):
 *  - 'penalty'      → unscheduled merchant-initiated (stakes/donations)
 *  - 'subscription' → recurring merchant-initiated (plan renewals)
 */
export type ConsentPurpose = 'penalty' | 'subscription';

interface UsePaymentConsentOptions {
  purpose?: ConsentPurpose;
}

interface UsePaymentConsentReturn {
  /**
   * Whether payment consent check is in progress
   */
  checking: boolean;
  /**
   * Check if user has payment consent, and if not, initiate payment flow
   * @param onSuccess - Called when consent is obtained
   * @param returnUrl - URL to return to after payment (with all form state)
   */
  checkAndInitiatePayment: (onSuccess: () => void, returnUrl: string) => Promise<void>;
  /**
   * Poll for payment consent completion (call this after HPP redirect back)
   * @param onSuccess - Called when consent is confirmed
   * @param onError - Called when polling times out or fails
   */
  pollPaymentConsent: (onSuccess: () => void, onError: () => void) => Promise<void>;
}

/**
 * Hook to handle payment consent flow with Airwallex
 *
 * Defaults to the penalty (unscheduled) consent, preserving the original
 * behavior for stakes/donations. Pass `{ purpose: 'subscription' }` for the
 * recurring consent used by plan billing — that variant never consults the
 * Logto `has_payment_consent` claim (the claim tracks the penalty consent
 * only) and always checks zinc directly.
 */
export function usePaymentConsent(options?: UsePaymentConsentOptions): UsePaymentConsentReturn {
  const purpose: ConsentPurpose = options?.purpose ?? 'penalty';
  const api = useSwaggerClients();
  const [checking, setChecking] = useState(false);
  const clientConfig = useClientConfig();
  const commonConfig = useCommonConfig();
  const theme = useTheme();
  const userId = useUserId();
  const hasConsent = useHasPaymentConsent();

  const checkAndInitiatePayment = useCallback(
    async (onSuccess: () => void, returnUrl: string) => {
      // The Logto claim shortcut only reflects the penalty consent.
      if (purpose === 'penalty' && hasConsent) {
        onSuccess();
        return;
      }
      setChecking(true);

      try {
        // Get userId from claims (no API call needed)
        if (!userId) {
          throw new Error('User ID not available');
        }

        if (purpose === 'subscription') {
          // No claim tracks the subscription consent — ask zinc directly. A
          // fresh user has no payment customer yet, so an error here (404
          // included) just means "no consent" and we proceed to setup.
          const consentResult = await api.alcohol.zinc.api.vPaymentConsentList({ version: '1.0', userId, purpose });
          const hasSubscriptionConsent = await consentResult.match({
            ok: (data: PaymentConsentRes) => data.hasPaymentConsent === true,
            err: () => false,
          });
          if (hasSubscriptionConsent) {
            setChecking(false);
            onSuccess();
            return;
          }
        }

        // Create customer (idempotent)
        const customerResult = await api.alcohol.zinc.api.vPaymentCustomersUpdate({ version: '1.0', userId });
        const customerData: CreateCustomerRes = await customerResult.unwrap();

        if (!customerData.customerId) {
          throw new Error('Failed to create customer');
        }

        // Get clientConfig secret (uses the customer we just created/verified)
        const clientSecretResult = await api.alcohol.zinc.api.vPaymentClientSecretList({ version: '1.0', userId });
        const clientSecretData: ClientSecretRes = await clientSecretResult.unwrap();

        if (!clientSecretData.clientSecret) {
          throw new Error('Failed to obtain clientConfig secret');
        }

        // Use customerId from customer creation (more reliable)
        const customerId = customerData.customerId;

        const { payments } = await init({
          env: clientConfig.payment.airwallex.env,
          enabledElements: ['payments'],
        });

        if (!payments) {
          throw new Error('Failed to initialize airwallex clientConfig');
        }
        // Redirect to Airwallex HPP
        // After payment, user will be redirected to callback page which handles polling and token refresh
        const encodedReturnUrl = encodeURIComponent(returnUrl);
        const callbackUrl = `${window.location.origin}/app/payment/callback?payment_status=success&purpose=${purpose}&return_url=${encodedReturnUrl}`;

        payments?.redirectToCheckout({
          env: clientConfig.payment.airwallex.env,
          client_secret: clientSecretData.clientSecret,
          currency: 'USD',
          customer_id: customerId,
          appearance: {
            mode: theme.theme === 'dark' ? 'dark' : 'light',
            variables: {
              colorBrand: commonConfig.pwa.themeColor,
            },
          },
          mode: 'recurring',
          recurringOptions: {
            next_triggered_by: 'merchant',
            currency: 'USD',
            // Airwallex MIT reasons: scheduled | unscheduled | installments.
            // zinc's webhook classifies the consent's purpose from this reason:
            // 'scheduled' → subscription consent, anything else → penalty consent.
            merchant_trigger_reason: purpose === 'subscription' ? 'scheduled' : 'unscheduled',
          },
          logoUrl: 'https://lazytax.club/logo-source.svg',
          successUrl: callbackUrl,
        });
      } catch (error) {
        console.error('Payment consent initiation error:', error);
        setChecking(false);
        throw error;
      }
    },
    [api, purpose, hasConsent, userId, clientConfig.payment.airwallex.env, theme.theme, commonConfig.pwa.themeColor],
  );

  const pollPaymentConsent = useCallback(
    async (onSuccess: () => void, onError: () => void) => {
      try {
        // Get userId from claims (no API call needed)
        if (!userId) {
          onError();
          return;
        }

        // Polling strategy: 5 attempts at 1s intervals, then exponential backoff up to 2 minutes total
        const MAX_DURATION = 120000; // 2 minutes
        const INITIAL_ATTEMPTS = 5;
        const INITIAL_INTERVAL = 1000; // 1 second
        const startTime = Date.now();
        let attempts = 0;
        let currentInterval = INITIAL_INTERVAL;

        const poll = async (): Promise<void> => {
          attempts++;

          try {
            const consentResult = await api.alcohol.zinc.api.vPaymentConsentList({ version: '1.0', userId, purpose });
            const consentData: PaymentConsentRes = await consentResult.unwrap();

            if (consentData.hasPaymentConsent) {
              if (purpose === 'penalty') {
                // Success! Refresh tokens to get updated claims (penalty consent only —
                // no Logto claim tracks the subscription consent).
                await fetch('/api/auth/force_tokens');
              }
              onSuccess();
              return;
            }
          } catch (pollError) {
            console.error('Error checking payment consent:', pollError);
            // Continue polling even if individual check fails
          }

          // Check if we've exceeded the maximum duration
          const elapsed = Date.now() - startTime;
          if (elapsed >= MAX_DURATION) {
            onError();
            return;
          }

          // Calculate next interval
          if (attempts >= INITIAL_ATTEMPTS) {
            // Exponential backoff: double the interval each time, capped at 30 seconds
            currentInterval = Math.min(currentInterval * 2, 30000);
          }

          // Schedule next poll
          setTimeout(poll, currentInterval);
        };

        await poll();
      } catch (error) {
        console.error('Payment consent polling error:', error);
        onError();
      }
    },
    [api, userId, purpose],
  );

  return {
    checking,
    checkAndInitiatePayment,
    pollPaymentConsent,
  };
}
