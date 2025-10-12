import { useState, useCallback } from 'react';
import StakeSheet from '@/components/app/StakeSheet';
import { amountToCents, formatCentsToAmount } from '@/lib/utility/habit-utils';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { useHasPaymentConsent } from '@/lib/auth/use-user';

interface StakeButtonProps {
  /**
   * Current stake amount (as a decimal string like "5.50")
   */
  amount: string;
  /**
   * Callback when stake amount is updated
   */
  onAmountChange: (amount: string) => void;
  /**
   * Current form state to preserve in URL when redirecting to payment flow
   */
  formState: Record<string, string>;
  /**
   * Return URL path (without query params) to redirect back to after payment
   * e.g., "/app/new" or "/app/edit/123"
   */
  returnPath: string;
  /**
   * Children to render (typically the button that opens the stake sheet)
   */
  children: (props: { onClick: () => void }) => React.ReactNode;
}

/**
 * Encapsulates stake button logic including payment consent flow
 *
 * This component:
 * 1. Opens a stake sheet for entering amount
 * 2. Checks if user has payment consent claim when confirming non-zero amount
 * 3. If no consent, initiates payment flow:
 *    - Creates customer and gets client secret
 *    - Redirects to Airwallex payment page
 *    - After payment, redirects to callback handler
 *    - Callback polls for consent (5x 1s, then exponential backoff up to 2min)
 *    - Forces token refresh to get updated claims
 *    - Redirects back with all form state preserved
 * 4. If consent exists or amount is zero, immediately updates amount
 */
export function StakeButton({ amount, onAmountChange, formState, returnPath, children }: StakeButtonProps) {
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const { checkAndInitiatePayment, checking } = usePaymentConsent();
  const [showConsentConfirm, setShowConsentConfirm] = useState(false);
  const hasConsent = useHasPaymentConsent();

  const openStakeModal = useCallback(() => {
    setStakeBuffer(amountToCents(amount || ''));
    setStakeModalOpen(true);
  }, [amount]);

  const keypadAppend = useCallback((k: string) => {
    setStakeBuffer(prev => {
      if (k === 'C') return '';
      if (k === '⌫') return prev.slice(0, -1);
      if (/^\d$/.test(k)) return (prev + k).replace(/^0+(?=\d)/, '');
      return prev;
    });
  }, []);

  const confirmStakeModal = useCallback(async () => {
    const val = formatCentsToAmount(stakeBuffer);

    // Check if amount is non-zero and if user needs payment consent
    if (Number(val) > 0) {
      if (hasConsent) {
        // Already has consent — just update amount, no modal, no redirect
        onAmountChange(val);
        setStakeModalOpen(false);
      } else {
        // Missing consent — ask permission BEFORE redirecting to HPP
        setShowConsentConfirm(true);
      }
    } else {
      // Zero amount - no consent needed
      onAmountChange(val);
      setStakeModalOpen(false);
    }
  }, [stakeBuffer, hasConsent, onAmountChange]);

  const startConsentFlow = useCallback(async () => {
    const val = formatCentsToAmount(stakeBuffer);
    try {
      const returnParams = new URLSearchParams(formState);
      returnParams.set('amount', val);
      const returnUrl = `${returnPath}?${returnParams.toString()}`;

      await checkAndInitiatePayment(() => {
        onAmountChange(val);
        setStakeModalOpen(false);
      }, returnUrl);
    } catch (error) {
      console.error('Payment consent error:', error);
      alert('Failed to initiate payment consent. Please try again.');
    }
  }, [stakeBuffer, formState, returnPath, checkAndInitiatePayment, onAmountChange]);

  return (
    <>
      {children({ onClick: openStakeModal })}

      <StakeSheet
        open={stakeModalOpen}
        amountCents={stakeBuffer}
        onAppend={keypadAppend}
        onQuick={v => setStakeBuffer(String(v * 100))}
        onClear={() => setStakeBuffer('')}
        onClose={() => setStakeModalOpen(false)}
        onConfirm={confirmStakeModal}
      />

      {showConsentConfirm ? (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50"
            role="button"
            aria-label="Close consent dialog"
            tabIndex={0}
            onClick={() => setShowConsentConfirm(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setShowConsentConfirm(false);
              if (e.key === 'Escape') setShowConsentConfirm(false);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Set up payment consent?</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You’ll be redirected to our payment partner to securely add a payment method. This lets you stake and
                  be charged only when you miss a day.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setShowConsentConfirm(false)}
                    type="button"
                  >
                    Not now
                  </button>
                  <button
                    className="relative text-sm px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    onClick={startConsentFlow}
                    disabled={checking}
                    type="button"
                  >
                    <span className={checking ? 'opacity-0' : 'opacity-100'}>Continue</span>
                    {checking ? (
                      <span className="absolute inset-y-0 right-3 my-auto inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : null}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default StakeButton;
