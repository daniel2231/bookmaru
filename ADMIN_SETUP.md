# Admin Panel Setup Guide

## Overview

Your admin panel is now set up with the following features:

1. **Admin Authentication**: Simple password-based authentication using environment variable
2. **Submission Management**: View pending submissions in a table format
3. **Approve/Deny Actions**: Approve submissions (with automatic translation) or deny them
4. **Translation Service**: Supabase Edge Function using OpenAI API for automatic translation

## Setup Steps

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Admin password for accessing the admin panel
PRIVATE_ADMIN_PASSWORD=your_secure_password_here

# OpenAI API key for translation service
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Database Setup

Make sure your Supabase database has the following:

- `places` table with `status` field

### 3. Deploy the Edge Function

```bash
# Deploy the translation function to Supabase
supabase functions deploy translate-submission
```

## How It Works

### Submission Flow:

1. **User submits** → Status set to 'pending'
2. **Admin logs in** → `/admin` route with password authentication
3. **Admin reviews** → Table shows all pending submissions
4. **Admin approves** →
   - Calls translation Edge Function
   - Updates status to 'approved'
   - Translates content using OpenAI
5. **Admin denies** → Deletes submission from database
6. **Main page shows** → Only approved submissions are displayed

### Translation Process:

- When approving a Korean submission → Translates to English
- When approving an English submission → Translates to Korean
- Uses OpenAI GPT-3.5-turbo for high-quality translations
- Translates: name, description, and recommended book details

## Access

- **Admin Panel**: `https://your-domain.com/admin`
- **Main App**: `https://your-domain.com` (shows approved submissions only)

## Features

- ✅ Password-based authentication
- ✅ Session-based login (stored in browser session)
- ✅ Pending submissions table
- ✅ Approve/Deny actions
- ✅ Automatic translation via OpenAI
- ✅ Real-time updates
- ✅ Error handling
- ✅ Responsive design

## Security Notes

- Password is stored securely in environment variables
- Session is stored in browser sessionStorage (cleared on browser close)
- Translation API key is stored securely in Supabase environment variables
- All admin actions are logged and can be monitored

## Troubleshooting

- **Translation fails**: Check OpenAI API key and quota
- **Admin access denied**: Verify PRIVATE_ADMIN_PASSWORD is set correctly
- **Login issues**: Check that the password matches the environment variable
