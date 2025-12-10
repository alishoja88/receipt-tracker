# API Keys Setup Guide - Step by Step

This guide will help you get the required API keys.

---

## ✅ Step 1: PostgreSQL (Done!)

**Status:** ✅ Ready  
**Connection String:** `postgres://alinina@localhost:5432/receipts_db`

---

## 🔍 Step 2: Get OCR API Key

### Recommended Option: OCR.space (Free and Simple)

**Why this option?**
- Free up to 25,000 requests per day
- Simple registration
- Simple API and good documentation

**Steps:**

1. **Go to the website:**
   - Go to https://ocr.space/ocrapi

2. **Sign up:**
   - Click "Sign Up" or "Register"
   - Choose an email and password
   - Verify your email

3. **Get API Key:**
   - After login, go to user panel
   - In "API Key" or "My API Keys" section, see your key
   - Copy the key (e.g., `K123456789abcdef`)

4. **Endpoint:**
   ```
   https://api.ocr.space/parse/image
   ```

5. **Update .env file:**
   ```env
   OCR_API_KEY=K123456789abcdef
   OCR_API_ENDPOINT=https://api.ocr.space/parse/image
   ```

---

### Alternative Option: Google Cloud Vision API

**Steps:**

1. **Create Google Cloud Account:**
   - Go to https://console.cloud.google.com/
   - Login with your Google account

2. **Create Project:**
   - Click "Select a project"
   - Click "New Project"
   - Give project a name (e.g., "receipt-tracker")
   - Click "Create"

3. **Enable Vision API:**
   - In left menu, open "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Cloud Vision API"
   - Click "Enable" button

4. **Create API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the created key
   - (Optional) To restrict access, click on the key and select "Restrict key"

5. **Endpoint:**
   ```
   https://vision.googleapis.com/v1/images:annotate
   ```

6. **Cost:** $1.50 per 1000 images ($300 free credit for 3 months)

---

## 🤖 Step 3: Get OpenAI API Key

**Steps:**

1. **Go to OpenAI website:**
   - Go to https://platform.openai.com/

2. **Sign up or login:**
   - If you don't have an account, click "Sign up"
   - You can also sign up with Google or Microsoft
   - Enter your information

3. **Verify email:**
   - Go to your email and click the verification link

4. **Add Credit:**
   - Go to https://platform.openai.com/account/billing
   - Click "Add payment method"
   - Add a credit card or PayPal
   - Add at least $5 credit (enough to start)

5. **Create API Key:**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give the key a name (e.g., "receipt-tracker")
   - Click "Create secret key"
   - ⚠️ **Important:** Copy the key immediately! It's only shown once
   - Keep the key in a safe place

6. **Update .env file:**
   ```env
   OPENAI_API_KEY=sk-proj-abc123...your-key-here
   ```

**Cost:** Approximately $0.001-0.002 per receipt (depending on text length)

---

## 📝 Step 4: Update .env File

After getting all keys, open the `.env` file in `receipt-tracker-backend` and fill it like this:

```env
# Database Configuration
DATABASE_URL=postgres://alinina@localhost:5432/receipts_db

# OCR Service Configuration
OCR_API_KEY=K123456789abcdef
OCR_API_ENDPOINT=https://api.ocr.space/parse/image

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-abc123...your-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## ✅ Checklist

- [x] PostgreSQL installed and running
- [x] Database `receipts_db` created
- [ ] OCR API Key received
- [ ] OpenAI API Key received
- [ ] `.env` file filled with real information

---

## 🆘 Troubleshooting Guide

### Issue: Can't connect to PostgreSQL
```bash
# Check that PostgreSQL is running:
brew services list

# If not, start it:
brew services start postgresql@16

# Test connection:
psql -d receipts_db
```

### Issue: API Key doesn't work
- Check that you copied the complete key (no extra spaces)
- Check that API is enabled in the service
- Check that you have sufficient credit

### Issue: Don't have OpenAI API Key
- Make sure you added at least $5 credit
- Check that your account is verified

---

## 💡 Important Notes

1. **Security:**
   - Never commit API keys to Git
   - `.env` file is in `.gitignore` (secure)

2. **Cost:**
   - OCR.space: Free up to 25K requests/day
   - OpenAI: Approximately $0.001-0.002 per receipt
   - For testing and learning, $5-10 is enough

3. **Testing:**
   - After filling `.env`, you can test with a receipt
   - If there's an issue, check the logs

---

## 🚀 After Getting Keys

When you have all keys:
1. Fill the `.env` file with real information
2. Let me know so we can continue the project!
