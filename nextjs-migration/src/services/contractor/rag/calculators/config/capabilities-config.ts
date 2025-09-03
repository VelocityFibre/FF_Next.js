/**
 * Configuration constants for capabilities scoring
 */

// Score weights for different capability factors
export const CAPABILITIES_WEIGHTS = {
  TECHNICAL_SKILLS: 0.30,
  EQUIPMENT_CAPACITY: 0.25,
  TEAM_CAPACITY: 0.20,
  SPECIALIZATION: 0.15,
  SCALABILITY: 0.10
} as const;

// Base scoring constants
export const CAPABILITIES_CONFIG = {
  DEFAULT_SCORE: 70,
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  THRESHOLD: 70,
  
  // Equipment scoring
  EQUIPMENT_SCORES: {
    NO_EQUIPMENT: 50,
    BASE_SCORE: 70,
    AGE_BONUSES: [
      { threshold: 2, bonus: 15 }, // Very new
      { threshold: 5, bonus: 10 }, // Relatively new
      { threshold: 10, bonus: 5 }, // Moderate age
      { penalty: 10 } // Old equipment (else case)
    ],
    CONDITION_BONUSES: {
      excellent: 15,
      good: 10,
      fair: 5,
      poor: -10
    },
    MAINTENANCE_BONUSES: [
      { days: 90, bonus: 10 }, // Recently serviced
      { days: 180, bonus: 5 }, // Moderately recent
      { days: 365, penalty: -10 } // Overdue service
    ]
  },
  
  // Team capacity scoring
  TEAM_CAPACITY: {
    BASE_SCORE: 70,
    SIZE_BONUSES: [
      { threshold: 10, bonus: 20 },
      { threshold: 5, bonus: 15 },
      { threshold: 3, bonus: 10 },
      { threshold: 2, bonus: 5 },
      { threshold: 1, penalty: -10 }
    ] as const,
    ACTIVE_RATIO_BONUSES: [
      { threshold: 0.9, bonus: 10 },
      { threshold: 0.8, bonus: 5 },
      { threshold: 0.6, penalty: -10 }
    ] as const,
    WORKLOAD_BONUSES: [
      { threshold: 70, bonus: 10 }, // Good availability
      { threshold: 85, bonus: 5 },  // Moderate availability
      { threshold: 100, penalty: -15 } // Overloaded
    ] as const
  },
  
  // Technical skills scoring
  TECHNICAL_SKILLS: {
    CERT_SCORES: [
      { threshold: 5, score: 95 },
      { threshold: 3, score: 85 },
      { threshold: 2, score: 75 },
      { threshold: 1, score: 65 },
      { fallback: 70 }
    ] as const,
    MEMBER_EXPERIENCE: [
      { threshold: 10, bonus: 30 },
      { threshold: 5, bonus: 25 },
      { threshold: 3, bonus: 20 },
      { threshold: 1, bonus: 15 }
    ] as const,
    MEMBER_CERTS: [
      { threshold: 5, bonus: 20 },
      { threshold: 3, bonus: 15 },
      { threshold: 2, bonus: 10 },
      { threshold: 1, bonus: 5 }
    ] as const
  },
  
  // Specialization scoring
  SPECIALIZATION: {
    BASE_SCORE: 70,
    SWEET_SPOT_BONUS: 15, // 3-5 specializations
    GOOD_BONUS: 10, // 2 specializations
    FOCUS_BONUS: 5,  // 1 specialization
    NO_SPEC_PENALTY: -10,
    
    SERVICE_AREA_BONUSES: [
      { threshold: 5, bonus: 10 },
      { threshold: 3, bonus: 5 },
      { threshold: 0, penalty: -5 }
    ] as const,
    
    EXPERIENCE_BONUSES: [
      { threshold: 10, bonus: 15 },
      { threshold: 5, bonus: 10 },
      { threshold: 2, bonus: 5 },
      { threshold: 1, penalty: -10 }
    ] as const
  },
  
  // Scalability scoring
  SCALABILITY: {
    BASE_SCORE: 70,
    TEAM_COUNT_BONUSES: [
      { threshold: 3, bonus: 20 }, // Multiple teams suggest scalability
      { threshold: 2, bonus: 10 },
      { threshold: 0, penalty: -10 }
    ] as const,
    
    WORKLOAD_BONUSES: [
      { threshold: 60, bonus: 15 }, // Lots of spare capacity
      { threshold: 75, bonus: 10 }, // Good spare capacity
      { threshold: 85, bonus: 5 },  // Some spare capacity
      { threshold: 100, penalty: -15 } // No spare capacity
    ] as const
  }
} as const;

// Gap analysis messages
export const CAPABILITY_GAP_MESSAGES = {
  TECHNICAL_SKILLS: 'Technical skills need enhancement - consider additional training and certifications',
  EQUIPMENT_CAPACITY: 'Equipment needs upgrade or expansion to meet industry standards',
  TEAM_CAPACITY: 'Team capacity is insufficient - consider hiring or restructuring',
  SPECIALIZATION: 'Specialization focus needs improvement - develop core competencies',
  SCALABILITY: 'Scalability constraints - develop systems and processes for growth',
  NO_GAPS: 'No significant capability gaps identified'
} as const;

// Recommendation messages
export const CAPABILITY_RECOMMENDATION_MESSAGES = {
  TECHNICAL_SKILLS: 'Invest in ongoing technical training and industry certifications',
  EQUIPMENT_CAPACITY: 'Develop equipment modernization and maintenance schedule',
  TEAM_CAPACITY: 'Optimize team structure and workload distribution',
  SPECIALIZATION: 'Focus on developing core specializations and market positioning',
  SCALABILITY: 'Build scalable processes and systems to support growth'
} as const;
