/**
 * Encryption utilities extracted from Doctor-Dok
 * Provides AES-GCM encryption, key derivation, and hashing functions
 */

export interface EncryptionSettings {
  algorithm: string;
  keyLength: number;
  iterations: number;
  tagLength: number;
}

export class EncryptionUtils {
  private key: CryptoKey = {} as CryptoKey;
  private secretKey: string;
  private keyGenerated: boolean = false;
  
  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async generateKey(secretKey: string): Promise<void> {
    if (this.keyGenerated && this.secretKey !== secretKey) {
      this.keyGenerated = false; // key changed
    }

    if (this.keyGenerated) {
      return;
    }
    this.secretKey = secretKey;
    const keyData = await this.deriveKey(secretKey);
    this.key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    this.keyGenerated = true;
  }

  private async deriveKey(secretKey: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const salt = encoder.encode('doctor-dok-salt'); // TODO: Make configurable
    const iterations = 100000;
    const keyLength = 256; // 256 bits (32 bytes)
    const derivedKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    return crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      derivedKey,
      keyLength
    );
  }

  async encryptString(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const encryptedBuffer = await this.encryptArrayBuffer(data.buffer);
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  }

  async decryptString(encryptedText: string): Promise<string> {
    const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const decryptedBuffer = await this.decryptArrayBuffer(encryptedData.buffer);
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(decryptedBuffer));
  }

  async encryptArrayBuffer(data: ArrayBuffer): Promise<ArrayBuffer> {
    await this.generateKey(this.secretKey);

    const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialization vector
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.key,
      data
    );
    return new Blob([iv, new Uint8Array(encryptedData)]).arrayBuffer(); // Prepend IV to the ciphertext
  }

  async decryptArrayBuffer(encryptedData: ArrayBuffer | Blob): Promise<ArrayBuffer> {
    await this.generateKey(this.secretKey);

    let encryptedArrayBuffer: ArrayBuffer;
    if (encryptedData instanceof Blob) {
      encryptedArrayBuffer = await this.blobToArrayBuffer(encryptedData);
    } else {
      encryptedArrayBuffer = encryptedData;
    }

    const iv = new Uint8Array(encryptedArrayBuffer.slice(0, 16)); // Extract the IV
    const cipherText = encryptedArrayBuffer.slice(16);

    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.key,
      cipherText
    );
  }

  private async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }
}

/**
 * Generate SHA-256 hash of input string
 */
export async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate random string for IDs and tokens
 */
export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}