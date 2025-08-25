/**
 * Configuration constants for reliability scoring
 */

// Score weights for different reliability factors
export const RELIABILITY_WEIGHTS = {
  PROJECT_HISTORY: 0.25,
  TEAM_STABILITY: 0.20,
  CERTIFICATION_STATUS: 0.20,
  COMPLIANCE_RECORD: 0.20,
  COMMUNICATION_RATING: 0.15
} as const;

// Scoring thresholds and bonuses
export const SCORING_CONFIG = {
  DEFAULT_SCORE: 70,
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  THRESHOLD: 70,
  
  // Success rate scoring
  SUCCESS_RATE_BONUSES: [
    { threshold: 0.95, bonus: 20 },
    { threshold: 0.90, bonus: 15 },
    { threshold: 0.85, bonus: 10 },
    { threshold: 0.80, bonus: 5 },
    { threshold: 0.70, penalty: -15 }
  ] as const,
  
  // Performance rating bonuses
  PERFORMANCE_BONUSES: [
    { threshold: 9, bonus: 10 },
    { threshold: 8, bonus: 5 },
    { threshold: 6, penalty: -10 }
  ] as const,
  
  // Feedback scoring thresholds
  FEEDBACK_SCORES: [
    { threshold: 9, score: 95 },
    { threshold: 8, score: 85 },
    { threshold: 7, score: 75 },
    { threshold: 6, score: 65 },
    { fallback: 50 }
  ] as const,
  
  // Team tenure bonuses
  TENURE_BONUSES: [
    { threshold: 3, bonus: 20 },
    { threshold: 2, bonus: 15 },
    { threshold: 1, bonus: 10 },
    { threshold: 0.5, penalty: -10 }
  ] as const,
  
  // On-time delivery scores
  ON_TIME_SCORES: [
    { threshold: 0.95, score: 95 },
    { threshold: 0.90, score: 85 },
    { threshold: 0.80, score: 75 },
    { threshold: 0.70, score: 65 },
    { fallback: 50 }
  ] as const
} as const;

// Compliance scoring constants
export const COMPLIANCE_CONFIG = {
  DEFAULT_SCORE: 75,
  NO_ISSUES_BONUS: 10,
  ISSUE_PENALTIES: [
    { threshold: 5, penalty: 20 },
    { threshold: 3, penalty: 10 },
    { threshold: 1, penalty: 5 }
  ] as const
} as const;

// Gap analysis messages
export const GAP_MESSAGES = {
  PROJECT_HISTORY: 'Project history indicates room for improvement in delivery consistency',
  TEAM_STABILITY: 'Team stability concerns - consider retention strategies',
  CERTIFICATION_STATUS: 'Certification status needs attention - update or acquire new certifications',
  COMPLIANCE_RECORD: 'Compliance record shows issues - implement corrective measures',
  COMMUNICATION_RATING: 'Communication effectiveness needs improvement',
  NO_GAPS: 'No significant reliability gaps identified'
} as const;

// Recommendation messages
export const RECOMMENDATION_MESSAGES = {
  PROJECT_HISTORY: 'Focus on project delivery excellence and completion rates',
  TEAM_STABILITY: 'Implement team retention and stability programs',
  CERTIFICATION_STATUS: 'Maintain current certifications and pursue additional qualifications',
  COMPLIANCE_RECORD: 'Strengthen compliance processes and monitoring systems',
  COMMUNICATION_RATING: 'Enhance client communication protocols and feedback systems'
} as const;