import type { PaymentCurrency, PaymentGatewayAdapter, PaymentProvider } from './types.js';
import { PaymentGatewayError } from './types.js';
import { PayStationAdapter } from './pay-station-adapter.js';
import { StripeAdapter } from './stripe-adapter.js';

export class PaymentGatewayRegistry {
  private static adapters: Map<PaymentProvider, PaymentGatewayAdapter> = new Map();

  static {
    // Register default concrete adapters
    PaymentGatewayRegistry.registerAdapter(new PayStationAdapter());
    PaymentGatewayRegistry.registerAdapter(new StripeAdapter());
  }

  public static registerAdapter(adapter: PaymentGatewayAdapter): void {
    PaymentGatewayRegistry.adapters.set(adapter.providerId, adapter);
  }

  public static getAdapter(provider: PaymentProvider): PaymentGatewayAdapter {
    const adapter = PaymentGatewayRegistry.adapters.get(provider);
    if (!adapter) {
      throw new PaymentGatewayError(
        `No payment adapter registered for provider '${provider}'.`,
        'ADAPTER_NOT_FOUND',
        404,
      );
    }
    return adapter;
  }

  /**
   * Resolves the appropriate gateway adapter based on transaction currency and jurisdiction.
   */
  public static resolveAdapterForCurrency(currency: PaymentCurrency): PaymentGatewayAdapter {
    switch (currency) {
      case 'BDT':
        return PaymentGatewayRegistry.getAdapter('pay_station');
      case 'USD':
      case 'SGD':
      case 'EUR':
      default:
        return PaymentGatewayRegistry.getAdapter('stripe');
    }
  }

  public static listRegisteredProviders(): PaymentProvider[] {
    return Array.from(PaymentGatewayRegistry.adapters.keys());
  }
}
