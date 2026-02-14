declare module '@airwallex/components-sdk' {
  interface RedirectOptions {
    env: string;
    client_secret: string;
    currency: string;
    customer_id: string;
    appearance?: Record<string, unknown>;
    mode?: string;
    recurringOptions?: Record<string, unknown>;
    logoUrl?: string;
    successUrl?: string;
  }

  interface PaymentsClient {
    redirectToCheckout(options: RedirectOptions): Promise<void> | void;
  }

  interface InitOptions {
    env: string;
    enabledElements?: string[];
  }

  interface InitResult {
    payments?: PaymentsClient;
  }

  export function init(options: InitOptions): Promise<InitResult>;
}
