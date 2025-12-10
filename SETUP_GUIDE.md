# Complete Setup Guide for Receipt Tracker Project

This guide will help you find all the information needed for the `.env` file.

---

## 📦 Part 1: Install and Setup PostgreSQL

### Step 1: Install PostgreSQL

**Method 1: With Homebrew (Recommended for macOS)**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Method 2: Download from Official Website**
- Go to https://www.postgresql.org/download/macosx/
- Download and install the appropriate version

### Step 2: Create Database

After installation, run these commands:

```bash
# Connect to PostgreSQL (with default user)
psql postgres

# Or if you need a specific user:
psql -U postgres
```

Inside PostgreSQL, run these commands:

```sql
-- Create a new database
CREATE DATABASE receipts_db;

-- Create a user (optional, you can use default user)
CREATE USER receipt_user WITH PASSWORD 'your_password_here';

-- Grant privileges to database
GRANT ALL PRIVILEGES ON DATABASE receipts_db TO receipt_user;

-- Exit
\q
```

### Step 3: Build Connection String

After creating the database, the connection string will look like this:

```
postgres://username:password@localhost:5432/receipts_db
```

**Example:**
- If using default user:
  ```
  postgres://postgres:your_password@localhost:5432/receipts_db
  ```
- If you created a new user:
  ```
  postgres://receipt_user:your_password@localhost:5432/receipts_db
  ```

**Note:** If you don't have a password or don't want to set one:
```
postgres://postgres@localhost:5432/receipts_db
```

---

## 🔍 Part 2: Get OCR API Key

### Option 1: Tesseract OCR (Free, but requires server)

**Pros:** Free and open source  
**Cons:** Requires setting up your own server

### Option 2: Google Cloud Vision API (Recommended)

**Steps:**

1. **Create Google Cloud Account:**
   - Go to https://console.cloud.google.com/
   - Create a new project

2. **Enable Vision API:**
   - In the left menu, go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the key

4. **Endpoint:**
   ```
   https://vision.googleapis.com/v1/images:annotate
   ```

**Cost:** $1.50 per 1000 images ($300 free credit for 3 months)

### Option 3: Azure Computer Vision (Recommended)

**Steps:**

1. **Create Azure Account:**
   - Go to https://portal.azure.com/
   - Create a free account (12 months free)

2. **Create Computer Vision Resource:**
   - In Azure Portal, click "Create a resource"
   - Search for "Computer Vision"
   - Create a resource

3. **Get API Key and Endpoint:**
   - After creating resource, go to "Keys and Endpoint"
   - Copy `Key 1` and `Endpoint`

**Endpoint:** Something like:
```
https://your-resource-name.cognitiveservices.azure.com/vision/v3.2/ocr
```

**Cost:** $1 per 1000 images ($200 free credit)

### Option 4: OCR.space API (Free for limited use)

**Steps:**

1. Go to https://ocr.space/ocrapi
2. Create a free account
3. Get API Key from user panel

**Endpoint:**
```
https://api.ocr.space/parse/image
```

**Limitation:** 25,000 requests per day (free)

---

## 🤖 Part 3: Get OpenAI API Key

### Steps:

1. **Create OpenAI Account:**
   - Go to https://platform.openai.com/
   - Click "Sign up"
   - Create account with email or Google

2. **Add Credit:**
   - Go to https://platform.openai.com/account/billing
   - Add a payment method
   - Add at least $5 credit

3. **Create API Key:**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "receipt-tracker")
   - Copy the key (only shown once!)

**Important Notes:**
- Keep the key in a safe place
- Never commit the key to Git
- Cost: approximately $0.001-0.002 per receipt (depending on text length)

---

## 📝 Part 4: Fill .env File

After getting all information, open the `.env` file in `receipt-tracker-backend` and fill it like this:

```env
# Database Configuration
DATABASE_URL=postgres://postgres:your_password@localhost:5432/receipts_db

# OCR Service Configuration (Example with Google Cloud Vision)
OCR_API_KEY=AIzaSyC...your-key-here
OCR_API_ENDPOINT=https://vision.googleapis.com/v1/images:annotate

# Or if using Azure:
# OCR_API_KEY=abc123...your-key-here
# OCR_API_ENDPOINT=https://your-resource.cognitiveservices.azure.com/vision/v3.2/ocr

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...your-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## ✅ Checklist

- [ ] PostgreSQL installed and `receipts_db` database created
- [ ] Connection string ready
- [ ] OCR service selected and API Key received
- [ ] OpenAI API Key received
- [ ] `.env` file filled with real information
- [ ] `.env` file is in `.gitignore` (for security)

---

## 🆘 Troubleshooting Guide

### Issue: Can't connect to PostgreSQL
- Check that PostgreSQL is running: `brew services list`
- Check that port 5432 is open
- Check that username and password are correct

### Issue: API Key doesn't work
- Check that you copied the complete key
- Check that API is enabled in the service
- Check that you have sufficient credit

---

## 💡 Recommendations for Getting Started

**For testing and learning (lowest cost):**
1. PostgreSQL: Local installation (free)
2. OCR: OCR.space (free up to 25K requests)
3. OpenAI: Minimum $5 credit

**For serious project:**
1. PostgreSQL: Local installation or cloud service (Supabase free)
2. OCR: Google Cloud Vision or Azure (free credit)
3. OpenAI: Based on usage
