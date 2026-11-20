import type { ConsularFormField, ConsularPortalConfig } from '../types.js';

export interface ApplicantProfileInput {
  passportNumber?: string | undefined;
  fullName?: string | undefined;
  nationality?: string | undefined;
  birthDate?: string | undefined;
  gender?: string | undefined;
  expiryDate?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  arrivalDate?: string | undefined;
  flightNumber?: string | undefined;
  accommodationType?: string | undefined;
  addressInDestination?: string | undefined;
  [key: string]: unknown;
}

export class ConsularFieldMapper {
  private static readonly PORTAL_CONFIGS: Record<string, ConsularPortalConfig> = {
    SG: {
      countryCode: 'SG',
      portalName: 'Singapore Immigration & Checkpoints Authority (ICA) - SGAC',
      portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
      isEvisaSupported: true,
      requiresPaymentGate: false,
      requiresBiometrics: false,
      allowedDomains: ['ica.gov.sg', 'eservices.ica.gov.sg'],
    },
    AE: {
      countryCode: 'AE',
      portalName: 'Federal Authority for Identity and Citizenship (ICP) Smart Services',
      portalUrl: 'https://smartservices.icp.gov.ae/echannels/web/client/default.html',
      isEvisaSupported: true,
      requiresPaymentGate: true,
      requiresBiometrics: false,
      allowedDomains: ['icp.gov.ae', 'smartservices.icp.gov.ae', 'gdrfad.gov.ae'],
    },
    TR: {
      countryCode: 'TR',
      portalName: 'Republic of Turkey Electronic Visa Application System',
      portalUrl: 'https://www.evisa.gov.tr/en/',
      isEvisaSupported: true,
      requiresPaymentGate: true,
      requiresBiometrics: false,
      allowedDomains: ['evisa.gov.tr', 'www.evisa.gov.tr'],
    },
    MY: {
      countryCode: 'MY',
      portalName: 'Malaysia Digital Arrival Card (MDAC) Portal',
      portalUrl: 'https://imigresen-online.imi.gov.my/mdac/main',
      isEvisaSupported: true,
      requiresPaymentGate: false,
      requiresBiometrics: false,
      allowedDomains: ['imi.gov.my', 'imigresen-online.imi.gov.my'],
    },
    VN: {
      countryCode: 'VN',
      portalName: 'Vietnam National Portal on Immigration',
      portalUrl: 'https://evisa.xuatnhapcanh.gov.vn/',
      isEvisaSupported: true,
      requiresPaymentGate: true,
      requiresBiometrics: false,
      allowedDomains: ['xuatnhapcanh.gov.vn', 'evisa.xuatnhapcanh.gov.vn'],
    },
    GB: {
      countryCode: 'GB',
      portalName: 'UK Visas and Immigration (Access UK)',
      portalUrl: 'https://www.gov.uk/apply-to-come-to-the-uk',
      isEvisaSupported: false,
      requiresPaymentGate: true,
      requiresBiometrics: true,
      allowedDomains: ['gov.uk', 'visas-immigration.service.gov.uk'],
    },
  };

  /**
   * Retrieves portal configuration for a given country code.
   */
  public static getPortalConfig(countryCode: string): ConsularPortalConfig {
    const code = countryCode.trim().toUpperCase();
    const config = ConsularFieldMapper.PORTAL_CONFIGS[code];
    if (!config) {
      return {
        countryCode: code,
        portalName: `Government Portal (${code})`,
        portalUrl: `https://consular.${code.toLowerCase()}.gov/visa`,
        isEvisaSupported: false,
        requiresPaymentGate: true,
        requiresBiometrics: true,
        allowedDomains: [`${code.toLowerCase()}.gov`],
      };
    }
    return config;
  }

  /**
   * Maps applicant profile to deterministic form fields for a destination country portal.
   */
  public static mapApplicantToFields(
    countryCode: string,
    data: ApplicantProfileInput,
  ): ConsularFormField[] {
    const code = countryCode.trim().toUpperCase();

    // Common identity fields mapped across all jurisdictions
    const fields: ConsularFormField[] = [
      {
        fieldId: 'applicant_full_name',
        selector: 'input[name="full_name"], input[name="fullName"], #applicantName',
        fieldType: 'text',
        label: 'Full Name (as on Passport)',
        value: data.fullName ?? '',
        isSensitive: false,
        required: true,
      },
      {
        fieldId: 'passport_number',
        selector: 'input[name="passport_number"], input[name="passportNo"], #docNumber',
        fieldType: 'text',
        label: 'Passport Number',
        value: data.passportNumber ?? '',
        isSensitive: true,
        required: true,
      },
      {
        fieldId: 'nationality',
        selector: 'select[name="nationality"], select[name="citizenCountry"], #nationalityCode',
        fieldType: 'select',
        label: 'Nationality / Citizenship',
        value: data.nationality ?? '',
        isSensitive: false,
        required: true,
      },
      {
        fieldId: 'date_of_birth',
        selector: 'input[name="date_of_birth"], input[name="dob"], #birthDate',
        fieldType: 'date',
        label: 'Date of Birth',
        value: data.birthDate ?? '',
        isSensitive: true,
        required: true,
      },
      {
        fieldId: 'passport_expiry_date',
        selector: 'input[name="passport_expiry"], input[name="expiryDate"], #docExpiry',
        fieldType: 'date',
        label: 'Passport Expiry Date',
        value: data.expiryDate ?? '',
        isSensitive: false,
        required: true,
      },
      {
        fieldId: 'email_address',
        selector: 'input[name="email"], input[name="applicantEmail"], #contactEmail',
        fieldType: 'text',
        label: 'Contact Email Address',
        value: data.email ?? '',
        isSensitive: true,
        required: true,
      },
    ];

    // Country-specific field additions
    if (code === 'SG') {
      fields.push(
        {
          fieldId: 'sg_arrival_date',
          selector: 'input[name="arrivalDate"], #arrivalDate',
          fieldType: 'date',
          label: 'Date of Arrival in Singapore',
          value: data.arrivalDate ?? '',
          isSensitive: false,
          required: true,
        },
        {
          fieldId: 'sg_mode_of_travel',
          selector: 'select[name="modeOfTravel"], #travelMode',
          fieldType: 'select',
          label: 'Mode of Travel',
          value: 'AIR',
          isSensitive: false,
          required: true,
        },
        {
          fieldId: 'sg_flight_number',
          selector: 'input[name="flightNumber"], #flightNo',
          fieldType: 'text',
          label: 'Flight Number / Commercial Conveyance',
          value: data.flightNumber ?? 'SQ446',
          isSensitive: false,
          required: true,
        },
        {
          fieldId: 'sg_accommodation_type',
          selector: 'select[name="accommodationType"], #stayType',
          fieldType: 'select',
          label: 'Accommodation Type in Singapore',
          value: data.accommodationType ?? 'HOTEL',
          isSensitive: false,
          required: true,
        },
      );
    } else if (code === 'AE') {
      fields.push(
        {
          fieldId: 'ae_visa_category',
          selector: 'select[name="visaCategory"], #visaServiceType',
          fieldType: 'select',
          label: 'Visa Category',
          value: 'TOURIST_30_DAYS',
          isSensitive: false,
          required: true,
        },
        {
          fieldId: 'ae_mother_name',
          selector: 'input[name="motherName"], #motherFullName',
          fieldType: 'text',
          label: "Mother's Full Name",
          value: (data.motherName as string) ?? '',
          isSensitive: false,
          required: false,
        },
      );
    }

    return fields;
  }
}
