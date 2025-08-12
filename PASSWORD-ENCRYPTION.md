# Password Encryption Guide

This project includes password encryption functionality to securely store credentials without exposing plain text passwords in the codebase.

## 🔐 Security Features

### AES-256-GCM Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 10,000 iterations
- **Authentication**: Built-in authentication tag prevents tampering
- **IV**: Random initialization vector for each encryption

### Environment-Based Keys
- Uses `PLAYWRIGHT_ENCRYPTION_KEY` environment variable
- Falls back to default key for development (change in production)
- Separate keys for different environments (dev/staging/prod)

## 🚀 Quick Setup

### 1. Set Environment Variable
```bash
# Windows (PowerShell)
$env:PLAYWRIGHT_ENCRYPTION_KEY="your-secure-32-character-key-here"

# Windows (CMD)
set PLAYWRIGHT_ENCRYPTION_KEY=your-secure-32-character-key-here

# Linux/macOS
export PLAYWRIGHT_ENCRYPTION_KEY="your-secure-32-character-key-here"
```

### 2. Encrypt Your Passwords
```bash
# Encrypt a password
npm run encrypt-password "your-actual-password"

# Example output:
# Original: your-actual-password
# Encrypted: AbCdEf123456789...
# Decrypted: your-actual-password
# Verification: ✅ SUCCESS
```

### 3. Update Constants File
```typescript
export const CREDENTIALS = {
  OPERATOR: {
    email: 'user@example.com',
    encryptedPassword: 'AbCdEf123456789...',
    getPassword: () => decryptPassword('AbCdEf123456789...')
  }
} as const;
```

## 📖 Usage Examples

### Basic Usage in Tests
```typescript
import { CREDENTIALS } from './utils/constants';

// Automatically decrypts when called
const password = CREDENTIALS.OPERATOR.getPassword();
await loginHelper.login(CREDENTIALS.OPERATOR.email, password);
```

### Manual Encryption/Decryption
```typescript
import { encryptPassword, decryptPassword } from './utils/encryption';

// Encrypt a password
const encrypted = encryptPassword('myPassword123');
console.log('Encrypted:', encrypted);

// Decrypt it back
const decrypted = decryptPassword(encrypted);
console.log('Decrypted:', decrypted);
```

### Environment-Specific Keys
```typescript
// Use different keys for different environments
const encrypted = encryptPassword('password', 'production-key');
const decrypted = decryptPassword(encrypted, 'production-key');
```

## 🛠️ Development Workflow

### Adding New Credentials

1. **Encrypt the password**:
   ```bash
   npm run encrypt-password "new-password"
   ```

2. **Add to constants.ts**:
   ```typescript
   export const NEW_USER = {
     email: 'newuser@example.com',
     encryptedPassword: 'generated-encrypted-string',
     getPassword: () => decryptPassword('generated-encrypted-string')
   };
   ```

3. **Use in helpers**:
   ```typescript
   async loginAsNewUser() {
     await this.login(NEW_USER.email, NEW_USER.getPassword());
   }
   ```

### Environment Setup for Teams

1. **Share encryption key securely** (not in code/email)
2. **Create .env file** (not committed):
   ```
   PLAYWRIGHT_ENCRYPTION_KEY=team-shared-key
   ```
3. **Test encryption** works for everyone:
   ```bash
   npm run encrypt-password "test123"
   ```

## 🔒 Security Best Practices

### ✅ Do's
- Use strong, unique encryption keys (32+ characters)
- Store encryption keys in environment variables
- Use different keys for dev/staging/production
- Regularly rotate encryption keys
- Share keys through secure channels

### ❌ Don'ts
- Never commit encryption keys to version control
- Don't use the default key in production
- Don't share encrypted passwords without the key
- Don't store keys in the same repo as encrypted data
- Don't reuse keys across different projects

## 🚨 Migration from Plain Text

If you have existing plain text passwords:

1. **Encrypt existing passwords**:
   ```bash
   npm run encrypt-password "existing-password"
   ```

2. **Replace in constants.ts**:
   ```typescript
   // Before
   password: 'plain-text-password'
   
   // After
   encryptedPassword: 'encrypted-string',
   getPassword: () => decryptPassword('encrypted-string')
   ```

3. **Update all usages** to call `getPassword()`

4. **Test thoroughly** to ensure decryption works

5. **Remove plain text** from all files and git history

## ⚙️ Technical Details

### Encryption Process
1. Derive 32-byte key from password using PBKDF2
2. Generate random 16-byte IV
3. Encrypt using AES-256-GCM
4. Combine IV + AuthTag + Encrypted data
5. Base64 encode the result

### Decryption Process
1. Base64 decode the encrypted string
2. Extract IV, AuthTag, and encrypted data
3. Derive the same key using PBKDF2
4. Decrypt using AES-256-GCM with extracted components
5. Verify authentication tag

### File Structure
```
utils/
├── encryption.ts           # Core encryption functions
├── constants.ts            # Encrypted credentials
└── helpers.ts             # Updated to use getPassword()

scripts/
└── encrypt-password.ts    # CLI tool for encryption (TypeScript)

.env.example               # Environment template
```

This encryption system provides strong security while maintaining ease of use for the development team! 🔐
