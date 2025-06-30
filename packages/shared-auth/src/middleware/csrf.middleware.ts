/**
 * CSRF Protection Middleware
 * T219_phase2.6_cp1: Implement CSRF protection for auth endpoints
 */

import * as crypto from 'crypto';

export interface CSRFConfig {
  secret?: string;
  cookieName?: string;
  headerName?: string;
  tokenExpiry?: number; // in milliseconds
}

export interface CSRFTokenData {
  token: string;
  timestamp: number;
  sessionId?: string;
}

export class CSRFProtection {
  private config: Required<CSRFConfig>;
  private tokenStore: Map<string, CSRFTokenData> = new Map();

  constructor(config: CSRFConfig = {}) {
    this.config = {
      secret: config.secret || process.env.CSRF_SECRET || this.generateSecret(),
      cookieName: config.cookieName || 'csrf-token',
      headerName: config.headerName || 'x-csrf-token',
      tokenExpiry: config.tokenExpiry || 1000 * 60 * 60 // 1 hour
    };
  }

  /**
   * Generate a new CSRF token for a session
   */
  generateToken(sessionId?: string): string {
    const tokenData = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    
    // Create HMAC to prevent token tampering
    const hmac = crypto.createHmac('sha256', this.config.secret);
    hmac.update(`${tokenData}:${timestamp}:${sessionId || ''}`);
    const signature = hmac.digest('hex');
    
    const token = `${tokenData}:${timestamp}:${signature}`;
    
    // Store token data for validation
    this.tokenStore.set(tokenData, {
      token: tokenData,
      timestamp,
      sessionId
    });
    
    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();
    
    return token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string, sessionId?: string): boolean {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) {
        return false;
      }

      const [tokenData, timestampStr, signature] = parts;
      const timestamp = parseInt(timestampStr, 10);

      // Check if token is expired
      if (Date.now() - timestamp > this.config.tokenExpiry) {
        this.tokenStore.delete(tokenData);
        return false;
      }

      // Verify signature
      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(`${tokenData}:${timestamp}:${sessionId || ''}`);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        return false;
      }

      // Check if token exists in store
      const storedToken = this.tokenStore.get(tokenData);
      if (!storedToken) {
        return false;
      }

      // Validate session ID match
      if (sessionId && storedToken.sessionId !== sessionId) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Consume a CSRF token (use once)
   */
  consumeToken(token: string, sessionId?: string): boolean {
    if (!this.validateToken(token, sessionId)) {
      return false;
    }

    // Remove token to prevent reuse
    const tokenData = token.split(':')[0];
    this.tokenStore.delete(tokenData);
    
    return true;
  }

  /**
   * Create CSRF middleware for Express/Next.js
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const method = req.method?.toUpperCase();
      
      // Skip CSRF for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return next();
      }

      // Generate token for safe requests
      if (method === 'GET') {
        const sessionId = this.getSessionId(req);
        const csrfToken = this.generateToken(sessionId);
        
        // Set token in cookie and header
        res.setHeader('X-CSRF-Token', csrfToken);
        this.setCookie(res, csrfToken);
        
        return next();
      }

      // Validate token for unsafe methods
      const sessionId = this.getSessionId(req);
      const token = this.getTokenFromRequest(req);

      if (!token) {
        return res.status(403).json({
          error: 'CSRF token missing',
          code: 'CSRF_TOKEN_MISSING'
        });
      }

      if (!this.consumeToken(token, sessionId)) {
        return res.status(403).json({
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID'
        });
      }

      // Generate new token for response
      const newToken = this.generateToken(sessionId);
      res.setHeader('X-CSRF-Token', newToken);
      this.setCookie(res, newToken);

      next();
    };
  }

  /**
   * Get CSRF token from request (header or body)
   */
  private getTokenFromRequest(req: any): string | null {
    // Check header first
    const headerToken = req.headers[this.config.headerName.toLowerCase()];
    if (headerToken) {
      return headerToken;
    }

    // Check body
    const bodyToken = req.body?.csrfToken || req.body?._csrf;
    if (bodyToken) {
      return bodyToken;
    }

    // Check cookie as fallback
    const cookieToken = req.cookies?.[this.config.cookieName];
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  /**
   * Extract session ID from request
   */
  private getSessionId(req: any): string | undefined {
    // Try to get from session
    if (req.session?.id) {
      return req.session.id;
    }

    // Try to get from JWT token
    if (req.user?.id) {
      return req.user.id;
    }

    // Fallback to IP + User-Agent hash
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    if (ip && userAgent) {
      const hash = crypto.createHash('sha256');
      hash.update(`${ip}:${userAgent}`);
      return hash.digest('hex').substring(0, 16);
    }

    return undefined;
  }

  /**
   * Set CSRF token cookie
   */
  private setCookie(res: any, token: string): void {
    const cookieOptions = {
      httpOnly: false, // Frontend needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: this.config.tokenExpiry
    };

    res.cookie(this.config.cookieName, token, cookieOptions);
  }

  /**
   * Clean up expired tokens from memory store
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    
    for (const [tokenData, data] of this.tokenStore.entries()) {
      if (now - data.timestamp > this.config.tokenExpiry) {
        this.tokenStore.delete(tokenData);
      }
    }
  }

  /**
   * Generate a secure secret for CSRF tokens
   */
  private generateSecret(): string {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CSRF_SECRET must be set in production environment');
    }
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get token statistics (for debugging)
   */
  getStats(): { activeTokens: number; config: CSRFConfig } {
    return {
      activeTokens: this.tokenStore.size,
      config: {
        cookieName: this.config.cookieName,
        headerName: this.config.headerName,
        tokenExpiry: this.config.tokenExpiry
      }
    };
  }
}

// Default instance for easy use
export const csrfProtection = new CSRFProtection();