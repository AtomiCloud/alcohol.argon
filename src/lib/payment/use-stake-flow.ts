import { useState, useCallback } from 'react';
import { usePaymentConsent } from '@/lib/payment/use-payment-consent';
import { amountToCents, formatCentsToAmount } from '@/lib/utility/habit-utils';
import { useHasPaymentConsent } from '@/lib/auth/use-user';

interface UseStakeFlowParams {
  /**
   * Current stake amount (as a decimal string like "5.50")
   */
  currentAmount: string;
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
}

interface UseStakeFlowReturn {
  /**
   * Whether the stake modal is open
   */
  stakeModalOpen: boolean;
  /**
   * Current value in the keypad buffer (in cents as string)
   */
  stakeBuffer: string;
  /**
   * Open the stake modal
   */
  openStakeModal: () => void;
  /**
   * Close the stake modal
   */
  closeStakeModal: () => void;
  /**
   * Handle keypad input
   */
  keypadAppend: (key: string) => void;
  /**
   * Set quick amount (in dollars)
   */
  setQuickAmount: (dollars: number) => void;
  /**
   * Clear the buffer
   */
  clearBuffer: () => void;
  /**
   * Confirm the stake amount (handles payment consent flow if needed)
   */
  confirmStake: () => Promise<void>;
  /**
   * Whether payment consent check is in progress
   */
  checking: boolean;
  /**
   * Whether the consent confirmation modal should be shown
   */
  showConsentConfirm: boolean;
  /**
   * Begin the consent flow after user confirms in the modal
   */
  startConsentFlow: () => Promise<void>;
  /**
   * Dismiss the consent confirmation modal (keep stake sheet open)
   */
  cancelConsent: () => void;
}

/**
 * Hook that encapsulates all stake flow logic including payment consent
 *
 * This hook:
 * 1. Manages stake sheet modal state
 * 2. Handles keypad input
 * 3. Checks if user has payment consent claim when confirming non-zero amount
 * 4. If no consent, initiates payment flow:
 *    - Creates customer and gets client secret
 *    - Redirects to Airwallex payment page
 *    - After payment, redirects to callback handler
 *    - Callback polls for consent (5x 1s, then exponential backoff up to 2min)
 *    - Forces token refresh to get updated claims
 *    - Redirects back with all form state preserved
 * 5. If consent exists or amount is zero, immediately updates amount
 */
export function useStakeFlow({
  currentAmount,
  onAmountChange,
  formState,
  returnPath,
}: UseStakeFlowParams): UseStakeFlowReturn {
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeBuffer, setStakeBuffer] = useState('');
  const { checkAndInitiatePayment, checking } = usePaymentConsent();
  const hasConsent = useHasPaymentConsent();
  const [showConsentConfirm, setShowConsentConfirm] = useState(false);

  const openStakeModal = useCallback(() => {
    setStakeBuffer(amountToCents(currentAmount || ''));
    setStakeModalOpen(true);
  }, [currentAmount]);

  const closeStakeModal = useCallback(() => {
    setStakeModalOpen(false);
  }, []);

  const keypadAppend = useCallback((k: string) => {
    setStakeBuffer(prev => {
      if (k === 'C') return '';
      if (k === '⌫') return prev.slice(0, -1);
      if (/^\d$/.test(k)) return (prev + k).replace(/^0+(?=\d)/, '');
      return prev;
    });
  }, []);

  const setQuickAmount = useCallback((dollars: number) => {
    setStakeBuffer(String(dollars * 100));
  }, []);

  const clearBuffer = useCallback(() => {
    setStakeBuffer('');
  }, []);

  const confirmStake = useCallback(async () => {
    const val = formatCentsToAmount(stakeBuffer);

    if (Number(val) > 0) {
      if (hasConsent) {
        onAmountChange(val);
        setStakeModalOpen(false);
      } else {
        // Ask for confirmation before initiating payment consent flow
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
        setShowConsentConfirm(false);
      }, returnUrl);
    } catch (error) {
      console.error('Payment consent error:', error);
      alert('Failed to initiate payment consent. Please try again.');
    }
  }, [stakeBuffer, formState, returnPath, checkAndInitiatePayment, onAmountChange]);

  const cancelConsent = useCallback(() => {
    setShowConsentConfirm(false);
  }, []);

  return {
    stakeModalOpen,
    stakeBuffer,
    openStakeModal,
    closeStakeModal,
    keypadAppend,
    setQuickAmount,
    clearBuffer,
    confirmStake,
    checking,
    showConsentConfirm,
    startConsentFlow,
    cancelConsent,
  };
}
