/**
 * Storage service for authentication data
 * Handles secure storage of session data
 */

import type { AuthSession } from '@doctor-dok/shared-auth';
import { EncryptionUtils } from '@doctor-dok/shared-auth';

export class StorageService {
  private prefix: string;
  private encryption?: EncryptionUtils;

  constructor(prefix: string = 'auth', encryptionKey?: string) {
    this.prefix = prefix;
    if (encryptionKey) {
      this.encryption = new EncryptionUtils(encryptionKey);
    }
  }

  /**
   * Save session to storage
   */
  async saveSession(session: AuthSession): Promise<void> {
    try {
      const key = `${this.prefix}:session`;
      const data = JSON.stringify(session);
      
      if (this.encryption && session.keepLoggedIn) {
        // Encrypt sensitive session data
        const encrypted = await this.encryption.encryptString(data);
        localStorage.setItem(key, encrypted);
      } else {
        // Store in session storage for temporary sessions
        sessionStorage.setItem(key, data);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Get session from storage
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const key = `${this.prefix}:session`;
      
      // Check localStorage first (for keepLoggedIn sessions)
      let data = localStorage.getItem(key);
      if (data && this.encryption) {
        try {
          data = await this.encryption.decryptString(data);
        } catch {
          // If decryption fails, clear invalid data
          localStorage.removeItem(key);
          return null;
        }
      }
      
      // Check sessionStorage if not in localStorage
      if (!data) {
        data = sessionStorage.getItem(key);
      }
      
      if (!data) return null;
      
      const session = JSON.parse(data) as AuthSession;
      
      // Convert date strings back to Date objects
      session.expiresAt = new Date(session.expiresAt);
      session.user.createdAt = new Date(session.user.createdAt);
      session.user.updatedAt = new Date(session.user.updatedAt);
      
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Clear session from storage
   */
  async clearSession(): Promise<void> {
    const key = `${this.prefix}:session`;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  /**
   * Save encrypted credentials (for Doctor-Dok compatibility)
   */
  async saveCredentials(databaseId: string, encryptedPassword: string): Promise<void> {
    if (!this.encryption) return;
    
    try {
      const key = `${this.prefix}:creds:${databaseId}`;
      const data = JSON.stringify({ databaseId, encryptedPassword });
      const encrypted = await this.encryption.encryptString(data);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }

  /**
   * Get encrypted credentials
   */
  async getCredentials(databaseId: string): Promise<{ databaseId: string; encryptedPassword: string } | null> {
    if (!this.encryption) return null;
    
    try {
      const key = `${this.prefix}:creds:${databaseId}`;
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const data = await this.encryption.decryptString(encrypted);
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  }

  /**
   * Clear encrypted credentials
   */
  async clearCredentials(databaseId: string): Promise<void> {
    const key = `${this.prefix}:creds:${databaseId}`;
    localStorage.removeItem(key);
  }

  /**
   * Store user preferences
   */
  setPreference(key: string, value: any): void {
    const prefKey = `${this.prefix}:pref:${key}`;
    localStorage.setItem(prefKey, JSON.stringify(value));
  }

  /**
   * Get user preference
   */
  getPreference<T>(key: string, defaultValue?: T): T | undefined {
    const prefKey = `${this.prefix}:pref:${key}`;
    const value = localStorage.getItem(prefKey);
    if (!value) return defaultValue;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }
}