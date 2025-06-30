/**
 * Authentication API Client
 * Handles all auth-related API calls
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResult,
  LoginDto,
  CreateUserDto,
  TokenPair,
  AuthError,
  AuthErrorCode,
} from '@doctor-dok/shared-auth';
import { InputSanitizer } from '@doctor-dok/shared-auth';

export class AuthApiClient {
  private axios: AxiosInstance;
  private authToken: string | null = null;
  private csrfToken: string | null = null;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and CSRF token
    this.axios.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      if (this.csrfToken) {
        config.headers['X-CSRF-Token'] = this.csrfToken;
      }
      return config;
    });

    // Response interceptor for error handling and CSRF token updates
    this.axios.interceptors.response.use(
      (response) => {
        // Update CSRF token from response headers
        const newCsrfToken = response.headers['x-csrf-token'];
        if (newCsrfToken) {
          this.csrfToken = newCsrfToken;
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.authToken = null;
        }
        if (error.response?.status === 403) {
          // CSRF token invalid - clear it
          this.csrfToken = null;
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Set CSRF token (T219_phase2.6_cp1)
   */
  setCsrfToken(token: string) {
    this.csrfToken = token;
  }

  /**
   * Get CSRF token from server (T219_phase2.6_cp1)
   */
  async getCsrfToken(): Promise<string> {
    const response = await this.axios.get('/api/auth/login');
    const token = response.data.csrfToken || response.headers['x-csrf-token'];
    if (token) {
      this.csrfToken = token;
    }
    return token;
  }

  /**
   * Login with credentials (T219_phase2.6_cp1: Enhanced with CSRF protection)
   */
  async login(credentials: LoginDto): Promise<AuthResult> {
    // Get CSRF token if we don't have one
    if (!this.csrfToken) {
      await this.getCsrfToken();
    }

    // Sanitize login credentials to prevent XSS attacks (T215_phase2.6_cp1)
    const sanitizedCredentials = InputSanitizer.sanitizeLoginData({
      email: credentials.email,
      password: credentials.password,
      masterKey: credentials.encryptionKey
    });

    const response = await this.axios.post<AuthResult>('/api/auth/login', {
      ...credentials,
      email: sanitizedCredentials.email,
      password: sanitizedCredentials.password,
      encryptionKey: sanitizedCredentials.masterKey
    });
    return response.data;
  }

  /**
   * Register new user (T219_phase2.6_cp1: Enhanced with CSRF protection)
   */
  async register(data: CreateUserDto): Promise<AuthResult> {
    // Get CSRF token if we don't have one
    if (!this.csrfToken) {
      await this.getCsrfToken();
    }

    // Sanitize registration data to prevent XSS attacks (T215_phase2.6_cp1)
    const sanitizedData = InputSanitizer.sanitizeRegistrationData({
      email: data.email,
      password: data.password,
      masterKey: data.encryptionKey,
      databaseId: data.databaseId
    });

    const response = await this.axios.post<AuthResult>('/api/auth/register', {
      ...data,
      email: sanitizedData.email,
      password: sanitizedData.password,
      encryptionKey: sanitizedData.masterKey,
      databaseId: sanitizedData.databaseId,
      username: data.username ? InputSanitizer.sanitizeForDatabase(data.username, 50) : undefined
    });
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const response = await this.axios.post<TokenPair>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    await this.axios.post('/api/auth/logout', { userId });
  }

  /**
   * Get authentication challenge (for database creation)
   */
  async getChallenge(databaseId: string): Promise<{ challenge: string }> {
    const response = await this.axios.post<{ challenge: string }>('/api/db/challenge', {
      databaseId,
    });
    return response.data;
  }

  /**
   * Create database (Doctor-Dok specific)
   */
  async createDatabase(data: {
    databaseId: string;
    challenge: string;
    keyHash: string;
    encryptedKey?: string;
    hashParams: any;
  }): Promise<AuthResult> {
    const response = await this.axios.post<AuthResult>('/api/db/create', data);
    return response.data;
  }

  /**
   * Transform axios error to AuthError
   */
  private transformError(error: AxiosError): AuthError {
    const response = error.response;
    const data = response?.data as any;

    // Extract error details from response
    const message = data?.error || data?.message || error.message;
    const code = data?.code || this.getErrorCode(response?.status);
    const statusCode = response?.status || 500;

    return {
      name: 'AuthError',
      message,
      code,
      statusCode,
    } as AuthError;
  }

  /**
   * Map HTTP status to error code
   */
  private getErrorCode(status?: number): AuthErrorCode {
    switch (status) {
      case 401:
        return AuthErrorCode.TOKEN_INVALID;
      case 403:
        return AuthErrorCode.PERMISSION_DENIED;
      case 404:
        return AuthErrorCode.USER_NOT_FOUND;
      case 400:
        return AuthErrorCode.INVALID_CREDENTIALS;
      default:
        return AuthErrorCode.CONFIGURATION_ERROR;
    }
  }
}