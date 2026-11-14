'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardFooter,
  GlassCard,
  Button,
  Badge,
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

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeAssessmentResult | null>(null);

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

  // Pre-fill destination from URL search params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const countryParam = params.get('country');
      if (countryParam) {
        const titleCase = countryParam.charAt(0).toUpperCase() + countryParam.slice(1);
        setFormData((prev) => ({ ...prev, destinationCountry: titleCase }));
      }
    }
  }, []);

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
    <div className="w-full flex flex-col font-sans py-8 sm:py-12 bg-[#F8FAFC]">
      <Container size="xl">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 flex flex-col items-center gap-3">
          <Badge variant="glass" size="md" dot dotPulse>
            AI Assessment Engine v2.0
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0D3B2E]">
            Visa Eligibility & Intake Wizard
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Answer a few quick questions to receive an instant, consular-calibrated eligibility
            score and personalized document checklist.
          </p>
        </div>

        {/* Results Screen */}
        {result ? (
          <GlassCard
            intensity="elevated"
            className="max-w-3xl mx-auto p-6 sm:p-10 shadow-glassElevated"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex items-center gap-3">
                <Badge variant="brand" size="md">
                  Reference ID: {result.referenceId}
                </Badge>
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
                <p className="text-xs font-semibold tracking-wider uppercase text-[#145342]">
                  Consular Probability Index
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#0F172A] font-medium max-w-lg leading-relaxed">
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
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Access Client Portal to Upload Documents →
                  </Button>
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
          /* Multi-Step Wizard Card */
          <Card variant="default" className="max-w-3xl mx-auto shadow-sm border-[#E2E8F0]">
            {/* Step Progress Bar */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#E2E8F0] bg-[#FDFDFD]">
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
                  className="bg-[#0D3B2E] h-full transition-all duration-300 rounded-full"
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
                      onChange={(e) =>
                        setFormData({ ...formData, destinationCountry: e.target.value })
                      }
                      options={[
                        { value: 'Singapore', label: 'Singapore (MOM / ICA)' },
                        { value: 'Germany', label: 'Germany / Schengen Area' },
                        { value: 'United Kingdom', label: 'United Kingdom (UKVI)' },
                        { value: 'Canada', label: 'Canada (IRCC)' },
                        { value: 'Australia', label: 'Australia (Home Affairs)' },
                        { value: 'United Arab Emirates', label: 'United Arab Emirates (GDRFA)' },
                        { value: 'Japan', label: 'Japan (Immigration Services Agency)' },
                      ]}
                      required
                    />

                    <Select
                      id="visaCategory"
                      label="Intended Visa Category"
                      value={formData.visaCategory}
                      onChange={(e) => setFormData({ ...formData, visaCategory: e.target.value })}
                      options={[
                        { value: 'Skilled Work', label: 'Skilled Work & Employment Permit' },
                        { value: 'Student Visa', label: 'Higher Education & Student Visa' },
                        { value: 'Permanent Residency', label: 'Permanent Residency / PR Stream' },
                        { value: 'Investor / Business', label: 'Business Founder & Investor' },
                      ]}
                      required
                    />

                    <Select
                      id="nationality"
                      label="Citizenship / Passport Country"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      options={[
                        { value: 'Doctorate / PhD', label: 'Doctorate / PhD' },
                        { value: 'Master Degree', label: 'Master’s Degree (Postgraduate)' },
                        { value: 'Bachelor Degree', label: 'Bachelor’s Degree (Undergraduate)' },
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
                      onChange={(e) =>
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
                      onChange={(e) =>
                        setFormData({ ...formData, englishProficiency: e.target.value })
                      }
                      options={[
                        { value: 'ielts_7_plus', label: 'Fluent / IELTS 7.0+ / PTE 65+ / Native' },
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
                      <label className="text-xs font-semibold text-[#0F172A]">
                        Readiness Checkpoints
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasValidPassport}
                          onChange={(e) =>
                            setFormData({ ...formData, hasValidPassport: e.target.checked })
                          }
                          className="h-4 w-4 rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                        />
                        <div className="flex flex-col text-xs sm:text-sm">
                          <span className="font-semibold text-[#0F172A]">
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
                          onChange={(e) =>
                            setFormData({ ...formData, hasProofOfFunds: e.target.checked })
                          }
                          className="h-4 w-4 rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                        />
                        <div className="flex flex-col text-xs sm:text-sm">
                          <span className="font-semibold text-[#0F172A]">
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
                          onChange={(e) =>
                            setFormData({ ...formData, hasJobOffer: e.target.checked })
                          }
                          className="h-4 w-4 rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                        />
                        <div className="flex flex-col text-xs sm:text-sm">
                          <span className="font-semibold text-[#0F172A]">
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
                      <strong>Privacy Assurance:</strong> Your contact credentials are used strictly
                      to send your confidential eligibility breakdown and will never be shared with
                      third parties or unvetted brokers.
                    </div>

                    <Input
                      id="fullName"
                      label="Full Legal Name (as shown on passport)"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Shakil Hossain"
                      autoComplete="name"
                      required
                    />

                    <Input
                      id="email"
                      type="email"
                      label="Official Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                    />

                    <Input
                      id="phone"
                      type="tel"
                      label="Mobile Phone / WhatsApp Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    <Button variant="ghost" size="sm" onClick={handleBack} disabled={isSubmitting}>
                      ← Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 4 ? (
                    <Button variant="primary" size="md" onClick={handleNext}>
                      Continue →
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Evaluating Dossier..."
                    >
                      Calculate Visa Eligibility
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </Container>
    </div>
  );
}
