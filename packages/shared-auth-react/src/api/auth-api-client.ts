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

export class AuthApiClient {
  private axios: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axios.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.authToken = null;
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
   * Login with credentials
   */
  async login(credentials: LoginDto): Promise<AuthResult> {
    const response = await this.axios.post<AuthResult>('/api/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: CreateUserDto): Promise<AuthResult> {
    const response = await this.axios.post<AuthResult>('/api/auth/register', data);
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