#!/usr/bin/env node

/**
 * Password Encryption Utility
 * 
 * This script helps encrypt passwords for secure storage in the test framework.
 * 
 * Usage:
 *   npm run encrypt-password "your-password-here"
 *   node scripts/encrypt-password.js "your-password-here"
 */

const ts = require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  }
});

const { generateEncryptedPassword } = require('../utils/encryption.ts');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password to encrypt');
  console.log('Usage: npm run encrypt-password "your-password-here"');
  console.log('   or: node scripts/encrypt-password.js "your-password-here"');
  process.exit(1);
}

console.log('🔐 Password Encryption Utility');
console.log('================================');

try {
  const encrypted = generateEncryptedPassword(password);
  console.log('\n📝 Copy this encrypted password to your constants.ts file:');
  console.log(`encryptedPassword: '${encrypted}'`);
  console.log('\n⚠️  Security Notes:');
  console.log('- Store your encryption key in environment variable PLAYWRIGHT_ENCRYPTION_KEY');
  console.log('- Never commit plain text passwords to version control');
  console.log('- Use different encryption keys for different environments');
} catch (error) {
  console.error('❌ Encryption failed:', error.message);
  process.exit(1);
}
