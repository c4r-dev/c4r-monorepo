# 🔐 Security Guidelines for C4R Monorepo

## Overview
This document outlines security best practices and requirements for the C4R (Community for Rigor) educational research activities platform.

## 🚨 Critical Security Rules

### 1. NO HARDCODED CREDENTIALS
**NEVER** commit credentials, API keys, passwords, or sensitive data to version control.

#### ❌ WRONG:
```javascript
const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/database'
const API_KEY = 'sk-1234567890abcdef'
```

#### ✅ CORRECT:
```javascript
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI
const API_KEY = process.env.OPENAI_API_KEY
```

### 2. Environment Variables
All sensitive configuration MUST use environment variables:

- Database connection strings
- API keys (OpenAI, MongoDB, etc.)
- Secret tokens
- Third-party service credentials

### 3. .env File Security
- ✅ `.env` file is in `.gitignore` (already configured)
- ✅ Use `.env` for local development
- ❌ NEVER commit `.env` files to git
- ❌ NEVER share `.env` files in chat/email

## 📋 Environment Variables Reference

### Required Variables
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server
NODE_ENV=development|production
PORT=3333

# Logging
LOG_LEVEL=info|debug|warn|error

# APIs (when needed)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

## 🛠️ Development Workflow

### Setting Up Environment
1. **Copy environment template:**
   ```bash
   cp .env.example .env  # If available, or create manually
   ```

2. **Configure your variables:**
   ```bash
   # Edit .env with your actual credentials
   nano .env
   ```

3. **Verify exclusion from git:**
   ```bash
   git status  # .env should NOT appear in untracked files
   ```

### For New Activities
When creating MongoDB connections:

```javascript
// ALWAYS use this pattern:
require('dotenv').config();
const logger = require('../../../../../../packages/logging/logger.js');
import { mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    logger.app.info('Connected to MongoDB.')
  } catch (error) {
    logger.app.error('MongoDB connection error', { error: error.message })
  }
}

export default connectMongoDB
```

## 🔍 Security Verification

### Check for Exposed Credentials
Regular security audits using automated tools:

```bash
# Check for hardcoded credentials
node scripts/migrate-credentials-to-env.js

# Search for potential security issues
grep -r "password\|secret\|key" --include="*.js" --include="*.ts" .
```

### Pre-commit Hooks (Recommended)
Add to your development workflow:

```bash
# Install pre-commit hooks to prevent credential commits
npm install --save-dev pre-commit
```

## 🚨 Security Incident Response

### If Credentials Are Accidentally Committed

1. **IMMEDIATE ACTIONS:**
   ```bash
   # Rotate compromised credentials immediately
   # Change MongoDB password
   # Regenerate API keys
   ```

2. **Clean git history:**
   ```bash
   # Remove from git history (USE WITH CAUTION)
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/file' \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push cleaned history:**
   ```bash
   git push --force --all
   ```

4. **Notify team members** to update their local repos

### If You Discover Exposed Credentials
1. **Report immediately** to repository maintainers
2. **Do NOT use** the exposed credentials
3. **Assume credentials are compromised** and rotate immediately

## 📊 Security Architecture

### Current Security Status
✅ **Secured:** All MongoDB connections use environment variables  
✅ **Protected:** .env files excluded from version control  
✅ **Monitored:** Structured logging captures security events  
✅ **Automated:** Scripts available for credential migration  

### Database Security
- **Connection encryption:** All MongoDB connections use TLS
- **Access control:** Database credentials rotated regularly
- **Network security:** Connections restricted to authorized IPs
- **Data encryption:** Sensitive data encrypted at rest

### Application Security
- **Input validation:** All user inputs validated and sanitized
- **Error handling:** Sensitive information not exposed in error messages
- **Session management:** Secure session handling in activities
- **Logging:** Security events logged for monitoring

## 🔧 Tools & Scripts

### Available Security Tools
```bash
# Migrate hardcoded credentials to environment variables
node scripts/migrate-credentials-to-env.js

# Migrate console.* to structured logging
node scripts/migrate-console-to-logger.js

# Analyze logs for security events
node scripts/analyze-logs.js report
```

### Security Checklist for New Features
- [ ] No hardcoded credentials
- [ ] Environment variables configured
- [ ] Input validation implemented
- [ ] Error handling doesn't expose sensitive data
- [ ] Logging captures security-relevant events
- [ ] Database queries use parameterized statements
- [ ] Authentication/authorization properly implemented

## 🚫 Common Security Anti-Patterns

### DON'T DO THESE:

```javascript
// ❌ Hardcoded credentials
const password = 'mypassword123'

// ❌ Credentials in comments
// MongoDB: mongodb+srv://user:pass@cluster.net

// ❌ Credentials in variable names
const mongodb_user_password = process.env.SECRET

// ❌ Exposing credentials in logs
console.log('Connecting with:', process.env.MONGODB_URI)

// ❌ Credentials in error messages
throw new Error(`Failed to connect: ${process.env.MONGODB_URI}`)
```

### ✅ DO THESE INSTEAD:

```javascript
// ✅ Environment variables
const MONGODB_URI = process.env.MONGODB_URI

// ✅ Secure logging
logger.app.info('Connecting to MongoDB...')

// ✅ Safe error handling
logger.app.error('Database connection failed', { 
  error: error.message,
  // Don't log the actual URI
})
```

## 📚 Additional Resources

### Security Documentation
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

### Monitoring & Alerting
- **Structured logging:** All security events logged to `logs/app.jsonl`
- **Error tracking:** Security errors logged to `logs/errors.jsonl`
- **Performance monitoring:** Database connection metrics tracked

## 🔄 Regular Security Maintenance

### Monthly Tasks
- [ ] Rotate database credentials
- [ ] Review access logs
- [ ] Update dependencies with security patches
- [ ] Audit environment variable usage

### Quarterly Tasks
- [ ] Full security audit of codebase
- [ ] Review and update security documentation
- [ ] Penetration testing (if applicable)
- [ ] Security training for team members

---

## 🆘 Emergency Contacts

**Security Issues:** Report immediately to repository maintainers  
**Credential Compromise:** Rotate credentials first, then notify team  
**Data Breach:** Follow institutional incident response procedures  

---

**Remember:** Security is everyone's responsibility. When in doubt, err on the side of caution and ask for security review.

*Last Updated: September 18, 2025*