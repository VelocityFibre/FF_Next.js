/**
 * Security Configuration
 * Centralized security settings and policies
 */

// Content Security Policy
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite dev server
    'https://apis.google.com',
    'https://www.gstatic.com',
    'https://www.googleapis.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'connect-src': [
    "'self'",
    'https://api.neon.tech',
    'https://firestore.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://www.googleapis.com',
    'wss:'
  ],
  'frame-src': [
    "'self'",
    'https://accounts.google.com'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Security Headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'geolocation=(self)',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', ')
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[\d\s\-()]{10,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SAFE_TEXT: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi,
  XSS_BASIC: /<script[^>]*>.*?<\/script>/gi,
  HTML_TAGS: /<[^>]*>/g
};

// File upload security
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    ARCHIVES: ['application/zip']
  },
  DANGEROUS_EXTENSIONS: [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'sh', 'ps1'
  ]
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  LOGIN_ATTEMPTS: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  API_REQUESTS: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  FILE_UPLOADS: {
    maxUploads: 10,
    windowMs: 60 * 60 * 1000 // 1 hour
  }
};

// Password policy
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  commonPasswords: [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', '12345678'
  ]
};

// Session configuration
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  renewalThreshold: 30 * 60 * 1000, // 30 minutes
  absoluteTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: 'strict' as const,
  secure: true,
  httpOnly: true
};

// Security utility functions
export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(VALIDATION_PATTERNS.HTML_TAGS, '') // Remove HTML tags
      .replace(/[<>"']/g, '') // Remove dangerous characters
      .trim()
      .slice(0, 1000); // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }

  /**
   * Check if input contains potential SQL injection
   */
  static hasSQLInjection(input: string): boolean {
    return VALIDATION_PATTERNS.SQL_INJECTION.test(input);
  }

  /**
   * Check if input contains XSS patterns
   */
  static hasXSS(input: string): boolean {
    return VALIDATION_PATTERNS.XSS_BASIC.test(input);
  }

  /**
   * Validate password against security policy
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < PASSWORD_POLICY.minLength) {
      errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
    }
    
    if (password.length > PASSWORD_POLICY.maxLength) {
      errors.push(`Password must be less than ${PASSWORD_POLICY.maxLength} characters long`);
    }
    
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (PASSWORD_POLICY.commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a different password');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if file type is allowed
   */
  static isAllowedFileType(mimeType: string, category: keyof typeof FILE_UPLOAD_CONFIG.ALLOWED_TYPES): boolean {
    return FILE_UPLOAD_CONFIG.ALLOWED_TYPES[category].includes(mimeType);
  }

  /**
   * Check if file extension is dangerous
   */
  static isDangerousFileExtension(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return FILE_UPLOAD_CONFIG.DANGEROUS_EXTENSIONS.includes(extension);
  }

  /**
   * Generate CSP header value
   */
  static generateCSPHeader(): string {
    return Object.entries(CSP_DIRECTIVES)
      .map(([directive, sources]) => {
        if (sources.length === 0) return directive;
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }
}

export default SecurityUtils;