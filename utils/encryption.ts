import * as crypto from 'crypto';

/**
 * Password encryption utility for secure credential storage
 * Uses AES-256-GCM encryption with a derived key from environment variable
 */

// Default encryption key - should be overridden by environment variable
const DEFAULT_KEY = 'playwright-test-key-change-in-production';

/**
 * Derives a 32-byte key from the provided string using PBKDF2
 */
function deriveKey(password: string): Buffer {
  const salt = 'playwright-salt'; // In production, use random salt stored separately
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
}

/**
 * Encrypts a password using AES-256-GCM
 * @param password - Plain text password to encrypt
 * @param encryptionKey - Optional encryption key (defaults to env var or default)
 * @returns Encrypted password with IV prepended (base64 encoded)
 */
export function encryptPassword(password: string, encryptionKey?: string): string {
  const key = encryptionKey || process.env.PLAYWRIGHT_ENCRYPTION_KEY || DEFAULT_KEY;
  const derivedKey = deriveKey(key);
  
  // Generate random IV
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  cipher.setAAD(Buffer.from('playwright-test', 'utf8'));
  
  // Encrypt password
  let encrypted = cipher.update(password, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine IV + authTag + encrypted data
  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]);
  
  return combined.toString('base64');
}

/**
 * Decrypts a password using AES-256-GCM
 * @param encryptedPassword - Encrypted password (base64 encoded with IV prepended)
 * @param encryptionKey - Optional encryption key (defaults to env var or default)
 * @returns Decrypted plain text password
 */
export function decryptPassword(encryptedPassword: string, encryptionKey?: string): string {
  const key = encryptionKey || process.env.PLAYWRIGHT_ENCRYPTION_KEY || DEFAULT_KEY;
  const derivedKey = deriveKey(key);
  
  // Parse the combined data
  const combined = Buffer.from(encryptedPassword, 'base64');
  
  // Extract components
  const iv = combined.subarray(0, 16);
  const authTag = combined.subarray(16, 32);
  const encrypted = combined.subarray(32);
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
  decipher.setAAD(Buffer.from('playwright-test', 'utf8'));
  decipher.setAuthTag(authTag);
  
  // Decrypt password
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Utility function to encrypt passwords for initial setup
 * Usage: node -e "console.log(require('./utils/encryption').generateEncryptedPassword('yourpassword'))"
 */
export function generateEncryptedPassword(plainPassword: string): string {
  console.log(`Original: ${plainPassword}`);
  const encrypted = encryptPassword(plainPassword);
  console.log(`Encrypted: ${encrypted}`);
  
  // Verify decryption works
  const decrypted = decryptPassword(encrypted);
  console.log(`Decrypted: ${decrypted}`);
  console.log(`Verification: ${plainPassword === decrypted ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  return encrypted;
}
