import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { useClaims } from '@/lib/auth/providers';
import type { ExtendedClaims } from '@/lib/auth/core/extended-claims';
import type { ClientSecretRes, CreateCustomerRes, PaymentConsentRes } from '@/clients/alcohol/zinc/api';
import { loadAirwallex, redirectToCheckout } from 'airwallex-payment-elements';

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
 */
export function usePaymentConsent(): UsePaymentConsentReturn {
  const api = useSwaggerClients();
  const claimsResult = useClaims();
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const getUserId = useCallback((): string | null => {
    const [resultType, content] = claimsResult;
    if (resultType !== 'ok') return null;

    const [hasData, authStateRaw] = content;
    if (!hasData || !authStateRaw) return null;

    const authState = authStateRaw as unknown as { __kind: string; value: { data: ExtendedClaims } };
    if (authState.__kind !== 'authed') return null;

    return authState.value.data.sub;
  }, [claimsResult]);

  const hasPaymentConsent = useCallback((): boolean => {
    const [resultType, content] = claimsResult;
    if (resultType !== 'ok') return false;

    const [hasData, authStateRaw] = content;
    if (!hasData || !authStateRaw) return false;

    const authState = authStateRaw as unknown as { __kind: string; value: { data: ExtendedClaims } };
    if (authState.__kind !== 'authed') return false;

    const claims = authState.value.data;
    // has_payment_consent can be boolean or string "true"
    return claims.has_payment_consent === 'true' || claims.has_payment_consent === true;
  }, [claimsResult]);

  const checkAndInitiatePayment = useCallback(
    async (onSuccess: () => void, returnUrl: string) => {
      // Check if user already has consent
      if (hasPaymentConsent()) {
        onSuccess();
        return;
      }

      setChecking(true);

      try {
        // Get userId from claims (no API call needed)
        const userId = getUserId();
        if (!userId) {
          throw new Error('User ID not available');
        }

        // Create customer (idempotent)
        const customerResult = await api.alcohol.zinc.api.vPaymentCustomersUpdate({ version: '1.0', userId });
        const customerData: CreateCustomerRes = await customerResult.unwrap();

        if (!customerData.customerId) {
          throw new Error('Failed to create customer');
        }

        // Get client secret (uses the customer we just created/verified)
        const clientSecretResult = await api.alcohol.zinc.api.vPaymentClientSecretList({ version: '1.0', userId });
        const clientSecretData: ClientSecretRes = await clientSecretResult.unwrap();

        if (!clientSecretData.clientSecret) {
          throw new Error('Failed to obtain client secret');
        }

        // Use customerId from customer creation (more reliable)
        const customerId = customerData.customerId;

        // Initialize Airwallex
        await loadAirwallex({
          env: 'prod', // TODO: Make this configurable based on environment
          origin: window.location.origin,
        });

        // Redirect to Airwallex HPP
        redirectToCheckout({
          env: 'prod',
          client_secret: clientSecretData.clientSecret,
          currency: 'USD',
          customer_id: customerId,
          appearance: {
            mode: 'dark',
          },
          mode: 'recurring',
          recurringOptions: {
            next_triggered_by: 'merchant',
            currency: 'USD',
            merchant_trigger_reason: 'unscheduled',
          },
          successUrl: `${window.location.origin}${returnUrl}?payment_status=success`,
          failUrl: `${window.location.origin}${returnUrl}?payment_status=failed`,
        });
      } catch (error) {
        console.error('Payment consent initiation error:', error);
        setChecking(false);
        throw error;
      }
    },
    [api, hasPaymentConsent, getUserId],
  );

  const pollPaymentConsent = useCallback(
    async (onSuccess: () => void, onError: () => void) => {
      try {
        // Get userId from claims (no API call needed)
        const userId = getUserId();
        if (!userId) {
          onError();
          return;
        }

        // Poll for up to 1 minute (60 seconds)
        const maxAttempts = 60;
        const pollInterval = 1000; // 1 second
        let attempts = 0;

        const poll = async (): Promise<void> => {
          attempts++;

          const consentResult = await api.alcohol.zinc.api.vPaymentConsentList({ version: '1.0', userId });
          const consentData: PaymentConsentRes = await consentResult.unwrap();

          if (consentData.hasPaymentConsent) {
            // Success! Refresh tokens and call onSuccess
            await fetch('/api/auth/force_tokens', { method: 'POST' });
            onSuccess();
            return;
          }

          if (attempts >= maxAttempts) {
            // Timeout
            onError();
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        };

        await poll();
      } catch (error) {
        console.error('Payment consent polling error:', error);
        onError();
      }
    },
    [api, getUserId],
  );

  return {
    checking,
    checkAndInitiatePayment,
    pollPaymentConsent,
  };
}
