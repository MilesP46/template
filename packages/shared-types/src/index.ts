// Shared authentication types
export interface AuthCredentials {
  databaseId: string
  key: string
  password?: string
}

// Note: AuthResult is now exported from auth module with enhanced structure
// Keeping this for backward compatibility, will be deprecated
export interface LegacyAuthResult {
  token: string
  expiresIn: number
  permissions: string[]
  databaseIdHash: string
}

export interface UserInfo {
  databaseId: string
  permissions: string[]
  lastAccess: Date
}

// Shared database types
export interface DatabaseManifest {
  version: string
  createdAt: string
  databaseId: string
  schema: string
}

// Shared API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Shared medical record types
export interface MedicalRecord {
  id: string
  folderId?: string
  title: string
  description?: string
  type: RecordType
  tags?: string[]
  json?: any
  text?: string
  transcription?: string
  checksum: string
  eventDate?: string
  createdAt: Date
  updatedAt: Date
}

export enum RecordType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  OTHER = 'other'
}

// Shared folder types
export interface Folder {
  id: string
  name: string
  description?: string
  parentId?: string
  color?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}

// Shared encryption types
export interface EncryptionKey {
  keyLocatorHash: string
  databaseIdHash: string
  keyHash: string
  encryptedMasterKey: string
  acl: string
  expiryDate?: Date
}

// Shared audit types
export interface AuditLog {
  id: string
  ip?: string
  ua?: string
  keyLocatorHash?: string
  databaseIdHash: string
  recordLocator?: string
  encryptedDiff?: string
  eventName: string
  createdAt: Date
}

// Shared configuration types
export interface AppConfig {
  key: string
  value: string
  encrypted: boolean
}

// Re-export pattern for future modularization
// When splitting into separate files, uncomment these:
// export * from './auth'
// export * from './database'
// export * from './records'
// export * from './audit'

// Export new auth module
export * from './auth';