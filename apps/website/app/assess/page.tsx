'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardFooter,
  GlassCard,
  Button,
  LuxuryButton,
  Badge,
  EmeraldBadge,
  Input,
  Select,
} from '@visahobe/ui';
import type { IntakeAssessmentResult } from '../../lib/intake.js';

interface FormData {
  destinationCountry: string;
  visaCategory: string;
  nationality: string;
  educationLevel: string;
  yearsOfExperience: number;
  englishProficiency: string;
  hasJobOffer: boolean;
  hasProofOfFunds: boolean;
  hasValidPassport: boolean;
  fullName: string;
  email: string;
  phone: string;
}

interface CountryFeeSchedule {
  govFeeUsd: number;
  biometricsAndHealthUsd: number;
  retailServiceFeeUsd: number;
  partnerWholesaleFeeUsd: number;
  processingTime: string;
  authority: string;
}

const FEE_SCHEDULES: Record<string, CountryFeeSchedule> = {
  Singapore: {
    govFeeUsd: 270,
    biometricsAndHealthUsd: 65,
    retailServiceFeeUsd: 290,
    partnerWholesaleFeeUsd: 195,
    processingTime: '3-8 Weeks',
    authority: 'Ministry of Manpower (MOM) / ICA',
  },
  Germany: {
    govFeeUsd: 110,
    biometricsAndHealthUsd: 90,
    retailServiceFeeUsd: 340,
    partnerWholesaleFeeUsd: 230,
    processingTime: '6-12 Weeks',
    authority: 'German Federal Foreign Office / ZAB',
  },
  'United Kingdom': {
    govFeeUsd: 910,
    biometricsAndHealthUsd: 1310,
    retailServiceFeeUsd: 320,
    partnerWholesaleFeeUsd: 215,
    processingTime: '4-8 Weeks',
    authority: 'UK Visas and Immigration (UKVI)',
  },
  Canada: {
    govFeeUsd: 1120,
    biometricsAndHealthUsd: 185,
    retailServiceFeeUsd: 450,
    partnerWholesaleFeeUsd: 310,
    processingTime: '12-24 Weeks',
    authority: 'IRCC Canada',
  },
  Australia: {
    govFeeUsd: 3150,
    biometricsAndHealthUsd: 320,
    retailServiceFeeUsd: 420,
    partnerWholesaleFeeUsd: 290,
    processingTime: '8-20 Weeks',
    authority: 'Department of Home Affairs (DHA)',
  },
  'United Arab Emirates': {
    govFeeUsd: 1010,
    biometricsAndHealthUsd: 190,
    retailServiceFeeUsd: 260,
    partnerWholesaleFeeUsd: 175,
    processingTime: '2-4 Weeks',
    authority: 'ICP / GDRFA Dubai',
  },
  Japan: {
    govFeeUsd: 85,
    biometricsAndHealthUsd: 45,
    retailServiceFeeUsd: 280,
    partnerWholesaleFeeUsd: 185,
    processingTime: '4-10 Weeks',
    authority: 'Immigration Services Agency of Japan',
  },
};

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeAssessmentResult | null>(null);
  const [pricingMode, setPricingMode] = useState<'b2c' | 'b2b'>('b2c');

  const [formData, setFormData] = useState<FormData>({
    destinationCountry: 'Singapore',
    visaCategory: 'Skilled Work',
    nationality: 'Bangladesh',
    educationLevel: 'Bachelor Degree',
    yearsOfExperience: 4,
    englishProficiency: 'ielts_7_plus',
    hasJobOffer: true,
    hasProofOfFunds: true,
    hasValidPassport: true,
    fullName: '',
    email: '',
    phone: '',
  });

  // Pre-fill destination and category from URL search params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const countryParam = params.get('country');
      const categoryParam = params.get('category');
      if (countryParam) {
        const normalized = countryParam.toLowerCase();
        const match = Object.keys(FEE_SCHEDULES).find((k) => k.toLowerCase().includes(normalized));
        const titleCase = match || countryParam.charAt(0).toUpperCase() + countryParam.slice(1);
        setFormData((prev) => ({
          ...prev,
          destinationCountry: titleCase,
          ...(categoryParam ? { visaCategory: categoryParam } : {}),
        }));
      }
    }
  }, []);

  // Real-time consular eligibility score & dynamic checklist preview
  const liveEstimate = useMemo(() => {
    let score = 48;

    if (formData.educationLevel === 'Doctorate / PhD') score += 20;
    else if (formData.educationLevel === 'Master Degree') score += 17;
    else if (formData.educationLevel === 'Bachelor Degree') score += 14;
    else if (formData.educationLevel === 'Diploma / Certificate') score += 8;
    else score += 4;

    score += Math.min(formData.yearsOfExperience * 2, 14);

    if (formData.englishProficiency === 'ielts_7_plus') score += 10;
    else if (formData.englishProficiency === 'ielts_6') score += 6;
    else score += 2;

    if (formData.hasValidPassport) score += 4;
    if (formData.hasProofOfFunds) score += 3;
    if (formData.hasJobOffer) score += 4;

    const boundedScore = Math.max(35, Math.min(98, score));
    const tier =
      boundedScore >= 80
        ? 'High Probability'
        : boundedScore >= 65
          ? 'Moderate Probability'
          : 'Requires Specialist Structuring';

    const schedule = FEE_SCHEDULES[formData.destinationCountry] ?? FEE_SCHEDULES.Singapore!;
    const serviceFee =
      pricingMode === 'b2c' ? schedule.retailServiceFeeUsd : schedule.partnerWholesaleFeeUsd;
    const totalEstimateUsd = schedule.govFeeUsd + schedule.biometricsAndHealthUsd + serviceFee;

    const checklist = [
      {
        id: 'passport',
        title: 'Machine-Readable Passport (6+ Months Validity)',
        mandatory: true,
        ready: formData.hasValidPassport,
        category: 'Identity',
      },
      {
        id: 'academic',
        title: `Attested ${formData.educationLevel} Transcripts & Certificate`,
        mandatory: true,
        ready: formData.educationLevel !== 'High School',
        category: 'Qualifications',
      },
      {
        id: 'solvency',
        title: '6-Month Certified Bank Solvency & Maintenance Ledger',
        mandatory: true,
        ready: formData.hasProofOfFunds,
        category: 'Financials',
      },
      {
        id: 'sponsor',
        title:
          formData.visaCategory === 'Student Visa'
            ? 'University CAS / Unconditional Offer Letter'
            : formData.visaCategory === 'Investor / Business'
              ? 'Corporate Registration & Capital Investment Escrow'
              : 'Employer Sponsorship Contract / Job Offer',
        mandatory: formData.visaCategory !== 'Permanent Residency',
        ready: formData.hasJobOffer,
        category: 'Sponsorship',
      },
    ];

    return {
      score: boundedScore,
      tier,
      schedule,
      serviceFee,
      totalEstimateUsd,
      checklist,
    };
  }, [formData, pricingMode]);

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!formData.destinationCountry || !formData.visaCategory || !formData.nationality) {
        setErrorMsg('Please select your destination, category, and citizenship.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.educationLevel) {
        setErrorMsg('Please specify your highest level of completed education.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.hasValidPassport) {
        setErrorMsg('A valid international passport is required for visa lodgment.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please complete all contact details to receive your eligibility dossier.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate eligibility evaluation.');
      }

      setResult(data as IntakeAssessmentResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Evaluation failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans py-8 sm:py-12 bg-[#F8FAFC] text-[#111827]">
      <Container size="2xl">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 flex flex-col items-center gap-3">
          <Badge variant="glass" size="md" dot dotPulse className="border-[#C8A951]/50">
            AI Assessment Engine v2.0
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0D3B2E]">
            Visa Eligibility & Intake Wizard
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Answer a few quick questions to receive an instant, consular-calibrated eligibility
            score, transparent fee breakdown, and personalized document checklist.
          </p>
        </div>

        {/* Results Screen */}
        {result ? (
          <GlassCard
            intensity="luxury"
            goldAccent
            className="max-w-4xl mx-auto p-6 sm:p-10 shadow-glassElevated"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <EmeraldBadge variant="luxury" size="md">
                  Reference ID: {result.referenceId}
                </EmeraldBadge>
                <Badge
                  variant={
                    result.tier === 'High Probability'
                      ? 'success'
                      : result.tier === 'Moderate Probability'
                        ? 'warning'
                        : 'danger'
                  }
                  size="md"
                >
                  {result.tier}
                </Badge>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-baseline justify-center gap-1 font-display">
                  <span className="text-6xl font-black text-[#0D3B2E]">{result.score}</span>
                  <span className="text-2xl font-bold text-[#64748B]">/ 100</span>
                </div>
                <p className="text-xs font-semibold tracking-wider uppercase text-[#0D3B2E]">
                  Consular Probability Index • {formData.destinationCountry} (
                  {formData.visaCategory})
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#111827] font-medium max-w-lg leading-relaxed">
                {result.summary}
              </p>

              <div className="w-full text-left p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#0D3B2E] mb-3">
                  Recommended Next Steps:
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {result.nextSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#475569]"
                    >
                      <span className="h-5 w-5 rounded-full bg-[#E3EFEA] text-[#0D3B2E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
                <a href="/login" className="w-full sm:w-auto">
                  <LuxuryButton size="lg" className="w-full sm:w-auto shadow-md">
                    Access Client Portal to Upload Documents →
                  </LuxuryButton>
                </a>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setResult(null);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto"
                >
                  Start New Assessment
                </Button>
              </div>
            </div>
          </GlassCard>
        ) : (
          /* Interactive Two-Column Layout: Multi-Step Wizard + Live Score, Fee & Checklist Preview */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Solid High-Contrast Multi-Step Intake Form (ADR-009) */}
            <div className="lg:col-span-7">
              <Card variant="luxury" goldDivider className="shadow-sm bg-white">
                {/* Step Progress Bar */}
                <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#E2E8F0] bg-white">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0D3B2E] mb-2">
                    <span>Step {currentStep} of 4</span>
                    <span>
                      {currentStep === 1 && 'Destination & Visa Stream'}
                      {currentStep === 2 && 'Qualifications & Experience'}
                      {currentStep === 3 && 'Document Readiness & Proofs'}
                      {currentStep === 4 && 'Contact Information'}
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0D3B2E] to-[#C8A951] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
                    {errorMsg && (
                      <div
                        role="alert"
                        className="p-4 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs sm:text-sm font-medium text-[#B91C1C]"
                      >
                        {errorMsg}
                      </div>
                    )}

                    {/* STEP 1: Destination & Stream */}
                    {currentStep === 1 && (
                      <div className="flex flex-col gap-5">
                        <Select
                          id="destinationCountry"
                          label="Target Destination Country"
                          value={formData.destinationCountry}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFormData({ ...formData, destinationCountry: e.target.value })
                          }
                          options={[
                            { value: 'Singapore', label: 'Singapore (MOM / ICA)' },
                            { value: 'Germany', label: 'Germany / Schengen Area' },
                            { value: 'United Kingdom', label: 'United Kingdom (UKVI)' },
                            { value: 'Canada', label: 'Canada (IRCC)' },
                            { value: 'Australia', label: 'Australia (Home Affairs)' },
                            {
                              value: 'United Arab Emirates',
                              label: 'United Arab Emirates (GDRFA)',
                            },
                            { value: 'Japan', label: 'Japan (Immigration Services Agency)' },
                          ]}
                          required
                        />

                        <Select
                          id="visaCategory"
                          label="Intended Visa Category"
                          value={formData.visaCategory}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFormData({ ...formData, visaCategory: e.target.value })
                          }
                          options={[
                            { value: 'Skilled Work', label: 'Skilled Work & Employment Permit' },
                            { value: 'Student Visa', label: 'Higher Education & Student Visa' },
                            {
                              value: 'Permanent Residency',
                              label: 'Permanent Residency / PR Stream',
                            },
                            {
                              value: 'Investor / Business',
                              label: 'Business Founder & Investor',
                            },
                          ]}
                          required
                        />

                        <Select
                          id="nationality"
                          label="Citizenship / Passport Country"
                          value={formData.nationality}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFormData({ ...formData, nationality: e.target.value })
                          }
                          options={[
                            { value: 'Bangladesh', label: 'Bangladesh' },
                            { value: 'India', label: 'India' },
                            { value: 'Pakistan', label: 'Pakistan' },
                            { value: 'Philippines', label: 'Philippines' },
                            { value: 'Nepal', label: 'Nepal' },
                            { value: 'Sri Lanka', label: 'Sri Lanka' },
                            { value: 'Other', label: 'Other Country' },
                          ]}
                          required
                        />
                      </div>
                    )}

                    {/* STEP 2: Qualifications & Experience */}
                    {currentStep === 2 && (
                      <div className="flex flex-col gap-5">
                        <Select
                          id="educationLevel"
                          label="Highest Completed Education Level"
                          value={formData.educationLevel}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFormData({ ...formData, educationLevel: e.target.value })
                          }
                          options={[
                            { value: 'Doctorate / PhD', label: 'Doctorate / PhD' },
                            { value: 'Master Degree', label: 'Master’s Degree (Postgraduate)' },
                            {
                              value: 'Bachelor Degree',
                              label: 'Bachelor’s Degree (Undergraduate)',
                            },
                            {
                              value: 'Diploma / Certificate',
                              label: 'Technical Diploma / Vocational Certificate',
                            },
                            { value: 'High School', label: 'Secondary / High School' },
                          ]}
                          required
                        />

                        <Input
                          id="yearsOfExperience"
                          type="number"
                          min={0}
                          max={40}
                          label="Years of Relevant Professional Experience"
                          value={formData.yearsOfExperience}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                              ...formData,
                              yearsOfExperience: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          helperText="Count only post-graduation professional work experience."
                          required
                        />

                        <Select
                          id="englishProficiency"
                          label="Official English Proficiency Level"
                          value={formData.englishProficiency}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFormData({ ...formData, englishProficiency: e.target.value })
                          }
                          options={[
                            {
                              value: 'ielts_7_plus',
                              label: 'Fluent / IELTS 7.0+ / PTE 65+ / Native',
                            },
                            { value: 'ielts_6', label: 'Competent / IELTS 6.0-6.5 / PTE 50-64' },
                            { value: 'basic', label: 'Basic / Under IELTS 6.0 / Not Yet Tested' },
                          ]}
                        />
                      </div>
                    )}

                    {/* STEP 3: Document Readiness & Solvency */}
                    {currentStep === 3 && (
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3">
                          <label className="text-xs font-semibold text-[#111827]">
                            Readiness Checkpoints
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.hasValidPassport}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData({ ...formData, hasValidPassport: e.target.checked })
                              }
                              className="h-4 w-4 rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                            />
                            <div className="flex flex-col text-xs sm:text-sm">
                              <span className="font-semibold text-[#111827]">
                                Valid International Passport (6+ Months Validity)
                              </span>
                              <span className="text-[#64748B]">
                                Required for international visa lodgment.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.hasProofOfFunds}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData({ ...formData, hasProofOfFunds: e.target.checked })
                              }
                              className="h-4 w-4 rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                            />
                            <div className="flex flex-col text-xs sm:text-sm">
                              <span className="font-semibold text-[#111827]">
                                Proof of Financial Solvency (Bank Statements / Sponsorship)
                              </span>
                              <span className="text-[#64748B]">
                                Meets minimum living expense requirements.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.hasJobOffer}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData({ ...formData, hasJobOffer: e.target.checked })
                              }
                              className="h-4 w-4 rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                            />
                            <div className="flex flex-col text-xs sm:text-sm">
                              <span className="font-semibold text-[#111827]">
                                Offer Letter or Sponsoring Employer in Hand
                              </span>
                              <span className="text-[#64748B]">
                                Optional for study or talent PR streams.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Contact Information */}
                    {currentStep === 4 && (
                      <div className="flex flex-col gap-5">
                        <div className="p-3.5 rounded-xl bg-[#E3EFEA] border border-[rgba(13,59,46,0.15)] text-xs text-[#0D3B2E] leading-relaxed">
                          <strong>Privacy Assurance:</strong> Your contact credentials are used
                          strictly to send your confidential eligibility breakdown and will never be
                          shared with third parties or unvetted brokers.
                        </div>

                        <Input
                          id="fullName"
                          label="Full Legal Name (as shown on passport)"
                          value={formData.fullName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          placeholder="e.g. Shakil Hossain"
                          autoComplete="name"
                          required
                        />

                        <Input
                          id="email"
                          type="email"
                          label="Official Email Address"
                          value={formData.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="name@example.com"
                          autoComplete="email"
                          required
                        />

                        <Input
                          id="phone"
                          type="tel"
                          label="Mobile Phone / WhatsApp Number"
                          value={formData.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+880 1700 000000"
                          autoComplete="tel"
                          helperText="Include country calling code for instant eligibility SMS / WhatsApp alerts."
                          required
                        />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t border-[#E2E8F0] px-6 sm:px-8 py-4 bg-[#FDFDFD]">
                    <div>
                      {currentStep > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBack}
                          disabled={isSubmitting}
                        >
                          ← Back
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {currentStep < 4 ? (
                        <LuxuryButton size="md" onClick={handleNext}>
                          Continue →
                        </LuxuryButton>
                      ) : (
                        <LuxuryButton
                          size="md"
                          type="submit"
                          isLoading={isSubmitting}
                          loadingText="Evaluating Dossier..."
                        >
                          Calculate Visa Eligibility
                        </LuxuryButton>
                      )}
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>

            {/* Right 5 Columns: Real-Time Eligibility & Fee Estimator + Dynamic Document Checklist Preview */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Liquid Glass Real-Time Score & Fee Estimator Card */}
              <GlassCard intensity="luxury" goldAccent className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                    Real-Time Eligibility & Fee Estimator
                  </span>
                  <EmeraldBadge variant="gold" size="sm" dot={false}>
                    Live Calibration
                  </EmeraldBadge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D3B2E] text-white border border-[#C8A951]/50 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#E3EFEA]/80 font-semibold">
                      Live Consular Score
                    </p>
                    <p className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
                      {liveEstimate.score}{' '}
                      <span className="text-sm font-normal text-[#C8A951]">/ 100</span>
                    </p>
                    <p className="text-xs text-[#C8A951] font-medium mt-0.5">{liveEstimate.tier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-[#E3EFEA]/80 font-semibold">
                      Est. Processing
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {liveEstimate.schedule.processingTime}
                    </p>
                    <p className="text-[11px] text-[#E3EFEA]/80 mt-0.5">
                      {liveEstimate.schedule.authority}
                    </p>
                  </div>
                </div>

                {/* B2C vs B2B Tariff Mode Toggle */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-[#111827]">
                    Transparent Fee Breakdown
                  </span>
                  <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
                    <button
                      type="button"
                      onClick={() => setPricingMode('b2c')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        pricingMode === 'b2c'
                          ? 'bg-[#0D3B2E] text-white'
                          : 'text-[#475569] hover:text-[#111827]'
                      }`}
                    >
                      B2C Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingMode('b2b')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        pricingMode === 'b2b'
                          ? 'bg-[#0D3B2E] text-white'
                          : 'text-[#475569] hover:text-[#111827]'
                      }`}
                    >
                      B2B Agency Rate
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between text-[#475569]">
                    <span>Official Government Lodging Fee</span>
                    <span className="font-mono font-semibold text-[#111827]">
                      ${liveEstimate.schedule.govFeeUsd} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#475569]">
                    <span>Biometrics & Statutory Surcharge</span>
                    <span className="font-mono font-semibold text-[#111827]">
                      ${liveEstimate.schedule.biometricsAndHealthUsd} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#475569]">
                    <span>
                      {pricingMode === 'b2c'
                        ? 'VisaHobe Licensed Concierge Fee'
                        : 'B2B Partner Agency Wholesale Fee'}
                    </span>
                    <span className="font-mono font-semibold text-[#0D3B2E]">
                      ${liveEstimate.serviceFee} USD
                    </span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-[#E2E8F0] flex items-center justify-between font-bold text-sm text-[#0D3B2E]">
                    <span>Total Transparent Estimate</span>
                    <span className="font-mono">${liveEstimate.totalEstimateUsd} USD</span>
                  </div>
                </div>
              </GlassCard>

              {/* Dynamic Document Checklist Preview (Crisp Solid White per ADR-009) */}
              <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0D3B2E]">
                      Dynamic Document Checklist Preview
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Tailored for {formData.destinationCountry} • {formData.visaCategory}
                    </p>
                  </div>
                  <Badge variant="brand" size="sm">
                    {liveEstimate.checklist.filter((c) => c.ready).length}/
                    {liveEstimate.checklist.length} Ready
                  </Badge>
                </div>

                <ul className="divide-y divide-[#F1F5F9] text-xs">
                  {liveEstimate.checklist.map((item) => (
                    <li key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#111827]">{item.title}</p>
                        <p className="text-[11px] text-[#64748B]">
                          {item.category} • {item.mandatory ? 'Mandatory' : 'Conditional'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          item.ready ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
                        }`}
                      >
                        {item.ready ? '✓ Ready' : 'Pending'}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                  <a href="/login" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Open Client Dashboard Document Vault →
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
