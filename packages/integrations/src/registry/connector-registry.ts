import type { IPartnerConnector } from '../connectors/types.js';
import { DirectAutonomousAIConnector } from '../connectors/direct-ai-connector.js';
import { ExternalPartnerConnector } from '../connectors/external-partner-connector.js';

export class PartnerConnectorRegistry {
  private static instance: PartnerConnectorRegistry | undefined;
  private connectors: Map<string, IPartnerConnector> = new Map();

  constructor() {
    this.seedDefaultConnectors();
  }

  public static getInstance(): PartnerConnectorRegistry {
    if (!PartnerConnectorRegistry.instance) {
      PartnerConnectorRegistry.instance = new PartnerConnectorRegistry();
    }
    return PartnerConnectorRegistry.instance;
  }

  public registerConnector(connector: IPartnerConnector): void {
    this.connectors.set(connector.partnerId, connector);
  }

  public getConnector(partnerId: string): IPartnerConnector | undefined {
    return this.connectors.get(partnerId);
  }

  public listConnectors(): IPartnerConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Resolves the appropriate fulfillment connector for a given case.
   * Prioritizes specialized licensed partner law firms for complex jurisdictions (e.g. UK, Germany),
   * and routes to Direct Autonomous AI Fulfillment when standard e-visa processing is supported.
   */
  public resolveConnectorForCase(countryCode: string, serviceType?: string): IPartnerConnector {
    const normalizedCountry = countryCode.toUpperCase();
    const normalizedService = serviceType ? serviceType.toLowerCase() : '';

    // 1. Check for registered external partner connector matching country and service
    for (const connector of this.connectors.values()) {
      if (connector.connectorType === 'partner_agency') {
        const countryMatch = connector.supportedCountryCodes.includes(normalizedCountry);
        const serviceMatch =
          !normalizedService ||
          connector.supportedServiceTypes.some((s) => s.toLowerCase() === normalizedService);

        if (countryMatch && serviceMatch) {
          return connector;
        }
      }
    }

    // 2. Direct Autonomous AI Connector for supported direct e-visa jurisdictions
    const directAi = this.connectors.get('DIRECT-AI-DEFAULT');
    if (directAi && directAi.supportedCountryCodes.includes(normalizedCountry)) {
      return directAi;
    }

    // 3. Fallback to Direct Autonomous AI default connector
    if (directAi) {
      return directAi;
    }

    // Fallback to first available
    const first = this.connectors.values().next().value;
    if (!first) {
      throw new Error('No partner connectors configured in registry.');
    }
    return first;
  }

  /**
   * Masks sensitive credentials in partner configs for secure Super Admin UI inspection.
   */
  public maskCredentials(credentials: Record<string, string>): Record<string, string> {
    const sensitiveKeys = [
      'apikey',
      'clientsecret',
      'webhooksecret',
      'token',
      'secret',
      'password',
    ];
    const masked: Record<string, string> = {};

    for (const [key, val] of Object.entries(credentials)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((s) => lowerKey.includes(s));

      if (isSensitive && typeof val === 'string' && val.length > 4) {
        masked[key] = `sec_***${val.slice(-4)}`;
      } else {
        masked[key] = val;
      }
    }

    return masked;
  }

  public clear(): void {
    this.connectors.clear();
    this.seedDefaultConnectors();
  }

  private seedDefaultConnectors(): void {
    // 1. Direct Autonomous AI Processor
    this.registerConnector(new DirectAutonomousAIConnector());

    // 2. UK Partner: British Immigration Law Associates LLP
    this.registerConnector(
      new ExternalPartnerConnector({
        partnerId: 'PARTNER-UK-LEGAL',
        partnerName: 'British Immigration Law Associates LLP',
        endpointUrl: 'https://api.ukimmigrationsolicitors.internal/v1',
        apiKey: 'uk_sec_live_9893948194821',
        webhookSecret: 'whsec_uk_live_555888222111',
        supportedCountryCodes: ['GB', 'UK'],
        supportedServiceTypes: ['skilled_worker', 'student', 'visitor', 'business'],
      }),
    );

    // 3. Germany Partner: EuroVisa Consulting GmbH
    this.registerConnector(
      new ExternalPartnerConnector({
        partnerId: 'PARTNER-DE-DESK',
        partnerName: 'EuroVisa Consulting GmbH (Frankfurt)',
        endpointUrl: 'https://api.eurovisadesk.de/v1',
        apiKey: 'de_sec_live_77721894124',
        webhookSecret: 'whsec_de_live_999444111333',
        supportedCountryCodes: ['DE', 'AT', 'CH'],
        supportedServiceTypes: ['chancenkarte', 'blue_card', 'jobseeker', 'tourist'],
      }),
    );

    // 4. UAE Partner: Gulf Express Business Immigration
    this.registerConnector(
      new ExternalPartnerConnector({
        partnerId: 'PARTNER-AE-DESK',
        partnerName: 'Gulf Express Business & Tourist Visa Desk',
        endpointUrl: 'https://api.gulfexpress.ae/v1',
        apiKey: 'ae_sec_live_33389412481',
        webhookSecret: 'whsec_ae_live_888333111444',
        supportedCountryCodes: ['AE', 'SA', 'QA'],
        supportedServiceTypes: ['golden_visa', 'tourist_30', 'tourist_60', 'business'],
      }),
    );
  }
}
