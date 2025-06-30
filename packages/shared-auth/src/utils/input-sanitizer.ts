/**
 * Input sanitization utilities for XSS prevention
 * T215_phase2.6_cp1: Implement XSS prevention with input sanitization
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export interface SanitizeOptions {
  allowHtml?: boolean;
  maxLength?: number;
  trimWhitespace?: boolean;
  normalizeEmail?: boolean;
}

export class InputSanitizer {
  /**
   * Sanitize text input to prevent XSS attacks
   */
  static sanitizeText(input: string, options: SanitizeOptions = {}): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    let sanitized = input;

    // Trim whitespace if requested
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Sanitize HTML/XSS
    if (options.allowHtml) {
      // Allow safe HTML tags but remove dangerous content
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
      });
    } else {
      // Escape all HTML completely
      sanitized = validator.escape(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize and validate email input (T217_phase2.6_cp1)
   * Enhanced with comprehensive email validation
   */
  static sanitizeEmail(email: string, options: SanitizeOptions = {}): string {
    if (typeof email !== 'string') {
      throw new Error('Email must be a string');
    }

    let sanitized = email.trim().toLowerCase();

    // Check for basic length limits
    if (sanitized.length < 5) {
      throw new Error('Email is too short (minimum 5 characters)');
    }

    if (sanitized.length > 254) {
      throw new Error('Email is too long (maximum 254 characters)');
    }

    // Normalize email if requested
    if (options.normalizeEmail !== false) {
      sanitized = validator.normalizeEmail(sanitized) || sanitized;
    }

    // Escape any HTML
    sanitized = validator.escape(sanitized);

    // Enhanced email format validation (T217_phase2.6_cp1)
    if (!validator.isEmail(sanitized)) {
      throw new Error('Invalid email format');
    }

    // Additional security checks
    const emailParts = sanitized.split('@');
    if (emailParts.length !== 2) {
      throw new Error('Invalid email format');
    }

    const [localPart, domain] = emailParts;

    // Validate local part (before @)
    if (!localPart || localPart.length === 0 || localPart.length > 64) {
      throw new Error('Email local part length is invalid');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\./,     // Double dots
      /\s/,       // Whitespace
      /[<>]/,     // Angle brackets
      /javascript:/i, // Script injection attempts
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        throw new Error('Email contains invalid characters or patterns');
      }
    }

    // Basic domain validation
    if (!domain || domain.length === 0 || domain.length > 253) {
      throw new Error('Email domain length is invalid');
    }

    if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
      throw new Error('Invalid email domain format');
    }

    return sanitized;
  }

  /**
   * Sanitize and validate password input (T217_phase2.6_cp1)
   * Enhanced with comprehensive password strength validation
   */
  static sanitizePassword(password: string): string {
    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }

    // Basic length validation
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password is too long (max 128 characters)');
    }

    // Password strength validation (T217_phase2.6_cp1)
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLowerCase) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!hasUpperCase) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!hasNumbers) {
      throw new Error('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      throw new Error('Password must contain at least one special character');
    }

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Same character repeated 3+ times
      /12345/, // Sequential numbers
      /password/i, // Contains "password"
      /qwerty/i, // Keyboard patterns
      /admin/i, // Common words
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        throw new Error('Password contains weak patterns and is not secure');
      }
    }

    return password;
  }

  /**
   * Sanitize general string input for database storage
   */
  static sanitizeForDatabase(input: string, maxLength = 255): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Remove null bytes and control characters that could cause issues
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Apply length limit
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);

    return sanitized;
  }

  /**
   * Sanitize object with multiple string fields
   * T218_phase2.6_cp1: Fixed TypeScript generic constraints
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    fieldRules: Record<keyof T, SanitizeOptions>
  ): T {
    const sanitized = { ...obj };

    for (const [field, options] of Object.entries(fieldRules)) {
      const fieldKey = field as keyof T;
      if (sanitized[fieldKey] && typeof sanitized[fieldKey] === 'string') {
        if (field.toLowerCase().includes('email')) {
          (sanitized as any)[fieldKey] = this.sanitizeEmail(sanitized[fieldKey] as string, options);
        } else if (field.toLowerCase().includes('password')) {
          (sanitized as any)[fieldKey] = this.sanitizePassword(sanitized[fieldKey] as string);
        } else {
          (sanitized as any)[fieldKey] = this.sanitizeText(sanitized[fieldKey] as string, options);
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate and sanitize user registration data
   */
  static sanitizeRegistrationData(data: {
    email: string;
    password: string;
    masterKey?: string;
    databaseId?: string;
  }) {
    return {
      email: this.sanitizeEmail(data.email),
      password: this.sanitizePassword(data.password),
      masterKey: data.masterKey ? this.sanitizePassword(data.masterKey) : undefined,
      databaseId: data.databaseId ? this.sanitizeForDatabase(data.databaseId, 50) : undefined
    };
  }

  /**
   * Validate and sanitize login credentials
   */
  static sanitizeLoginData(data: {
    email: string;
    password: string;
    masterKey?: string;
  }) {
    return {
      email: this.sanitizeEmail(data.email),
      password: this.sanitizePassword(data.password),
      masterKey: data.masterKey ? this.sanitizePassword(data.masterKey) : undefined
    };
  }

  /**
   * Validate password strength and return score (T217_phase2.6_cp1)
   * Returns a score from 0-100 based on password complexity
   */
  static validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isValid: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (!password || typeof password !== 'string') {
      return { score: 0, feedback: ['Password is required'], isValid: false };
    }

    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 10;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 10;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 10;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else feedback.push('Add special characters');

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('Avoid repeating characters');
    }

    if (/12345|abcde|qwerty/i.test(password)) {
      score -= 15;
      feedback.push('Avoid common patterns');
    }

    if (/password|admin|user/i.test(password)) {
      score -= 20;
      feedback.push('Avoid common words');
    }

    // Ensure minimum score
    score = Math.max(0, Math.min(100, score));

    const isValid = score >= 60 && password.length >= 8;

    if (score < 40) feedback.unshift('Very weak password');
    else if (score < 60) feedback.unshift('Weak password');
    else if (score < 80) feedback.unshift('Good password');
    else feedback.unshift('Strong password');

    return { score, feedback, isValid };
  }

  /**
   * Validate email domain against common disposable email providers (T217_phase2.6_cp1)
   */
  static validateEmailDomain(email: string): {
    isValid: boolean;
    isDisposable: boolean;
    feedback: string[];
  } {
    const feedback: string[] = [];
    
    try {
      const sanitizedEmail = this.sanitizeEmail(email);
      const domain = sanitizedEmail.split('@')[1]?.toLowerCase();
      
      if (!domain) {
        return { isValid: false, isDisposable: false, feedback: ['Invalid email format'] };
      }

      // Common disposable email domains (basic list)
      const disposableDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'sharklasers.com', 'trashmail.com'
      ];

      const isDisposable = disposableDomains.includes(domain);
      
      if (isDisposable) {
        feedback.push('Disposable email addresses are not allowed');
      }

      // Check for suspicious domain patterns
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf'];
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        feedback.push('Suspicious email domain detected');
      }

      return {
        isValid: !isDisposable && feedback.length === 0,
        isDisposable,
        feedback
      };
    } catch (error) {
      return { isValid: false, isDisposable: false, feedback: [String(error)] };
    }
  }
}