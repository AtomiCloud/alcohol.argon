import type { IdTokenClaims } from '@logto/next';

/**
 * Extended IdTokenClaims with custom application-specific claims
 */
export interface ExtendedClaims extends IdTokenClaims {
  /**
   * Whether the user has consented to payment processing via Airwallex
   * Can be either boolean or string "true"/"false"
   */
  has_payment_consent?: boolean | string;
}
