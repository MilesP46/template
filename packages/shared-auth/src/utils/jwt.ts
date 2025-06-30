/**
 * JWT utilities for token generation and verification
 * Extracted from Doctor-Dok authentication system
 */

import * as jose from 'jose';

export interface TokenPayload {
  userId: string;
  databaseId: string;
  keyId: string;
  role?: string;
  [key: string]: any;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  issuer?: string;
  audience?: string;
}

const DEFAULT_ACCESS_TOKEN_EXPIRY = '15m';
const DEFAULT_REFRESH_TOKEN_EXPIRY = '8h';

export class JWTService {
  private config: JWTConfig;

  constructor(config: JWTConfig) {
    this.config = {
      ...config,
      accessTokenExpiry: config.accessTokenExpiry || DEFAULT_ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiry: config.refreshTokenExpiry || DEFAULT_REFRESH_TOKEN_EXPIRY,
    };
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Generate access token
   */
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(this.config.accessTokenSecret);
    const alg = 'HS256';

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(this.config.issuer || 'doctor-dok')
      .setAudience(this.config.audience || 'doctor-dok-app')
      .setExpirationTime(this.config.accessTokenExpiry!)
      .sign(secret);

    return jwt;
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(this.config.refreshTokenSecret);
    const alg = 'HS256';

    const jwt = await new jose.SignJWT({ userId: payload.userId, keyId: payload.keyId })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(this.config.issuer || 'doctor-dok')
      .setAudience(this.config.audience || 'doctor-dok-app')
      .setExpirationTime(this.config.refreshTokenExpiry!)
      .sign(secret);

    return jwt;
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const secret = new TextEncoder().encode(this.config.accessTokenSecret);
    
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: this.config.issuer || 'doctor-dok',
      audience: this.config.audience || 'doctor-dok-app',
    });

    return payload as unknown as TokenPayload;
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<{ userId: string; keyId: string }> {
    const secret = new TextEncoder().encode(this.config.refreshTokenSecret);
    
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: this.config.issuer || 'doctor-dok',
      audience: this.config.audience || 'doctor-dok-app',
    });

    return payload as { userId: string; keyId: string };
  }

  /**
   * Decode token without verification (for client-side use)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const claims = jose.decodeJwt(token);
      return claims as unknown as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const claims = jose.decodeJwt(token);
      if (!claims.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return now >= claims.exp;
    } catch {
      return true;
    }
  }
}