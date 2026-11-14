export interface IntakePayload {
  destinationCountry: string;
  visaCategory: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  educationLevel: string;
  yearsOfExperience: number;
  hasJobOffer?: boolean | undefined;
  hasProofOfFunds?: boolean | undefined;
  hasValidPassport?: boolean | undefined;
  englishProficiency?: string | undefined;
}

export interface IntakeAssessmentResult {
  success: boolean;
  referenceId: string;
  score: number;
  tier: 'High Probability' | 'Moderate Probability' | 'Requires Supplemental Documentation';
  destinationCountry: string;
  visaCategory: string;
  summary: string;
  nextSteps: string[];
}

export function calculateEligibilityScore(data: IntakePayload): {
  score: number;
  tier: 'High Probability' | 'Moderate Probability' | 'Requires Supplemental Documentation';
  nextSteps: string[];
} {
  let score = 20; // Baseline points for valid applicant submission

  // Education scoring
  const edu = data.educationLevel.toLowerCase();
  if (edu.includes('doctor') || edu.includes('phd')) {
    score += 25;
  } else if (edu.includes('master') || edu.includes('postgrad')) {
    score += 20;
  } else if (edu.includes('bachelor') || edu.includes('degree')) {
    score += 15;
  } else {
    score += 8;
  }

  // Work experience
  const exp = Number(data.yearsOfExperience) || 0;
  if (exp >= 5) {
    score += 20;
  } else if (exp >= 3) {
    score += 15;
  } else if (exp >= 1) {
    score += 10;
  } else {
    score += 5;
  }

  // Job offer
  if (data.hasJobOffer) {
    score += 15;
  }

  // Proof of funds
  if (data.hasProofOfFunds) {
    score += 10;
  }

  // Valid Passport
  if (data.hasValidPassport) {
    score += 10;
  }

  // English Proficiency
  const eng = (data.englishProficiency || '').toLowerCase();
  if (eng === 'fluent' || eng === 'native' || eng === 'ielts_7_plus') {
    score += 10;
  } else if (eng === 'intermediate' || eng === 'ielts_6') {
    score += 5;
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let tier: 'High Probability' | 'Moderate Probability' | 'Requires Supplemental Documentation';
  const nextSteps: string[] = [];

  if (finalScore >= 80) {
    tier = 'High Probability';
    nextSteps.push(
      'Prepare certified copies of academic degree certificates and transcripts.',
      'Request current employer reference letters matching consular occupation classifications.',
      'Log into the VisaHobe client portal to commence automated OCR document verification.',
    );
  } else if (finalScore >= 60) {
    tier = 'Moderate Probability';
    nextSteps.push(
      'Obtain formal credential evaluation (e.g., WES, VETASSESS, or ECCTIS equivalent).',
      'Boost language proficiency scores (IELTS / PTE / TOEFL) to gain supplemental points.',
      'Review regional sponsorship or provincial nominee streams for lower qualifying thresholds.',
    );
  } else {
    tier = 'Requires Supplemental Documentation';
    nextSteps.push(
      'Book a 1-on-1 consultation with a licensed immigration counsel via VisaHobe.',
      'Explore alternative visa subclasses such as graduate trainee, seasonal work, or pathway study programs.',
      'Ensure proof of financial solvency meets the minimum statutory threshold.',
    );
  }

  return { score: finalScore, tier, nextSteps };
}
