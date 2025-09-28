# Supabase Quick Setup Guide

Your app is configured correctly, but you need to complete the Supabase setup. Follow these steps:

## Step 1: Run SQL Setup Script

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `zfwlrskjtwabynglrmgz`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire content from `supabase-setup.sql` file
6. Click **Run** to execute the script

## Step 2: Disable Email Confirmation

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Scroll down to **Email Auth**
3. **UNCHECK** "Enable email confirmations"
4. Click **Save**

## Step 3: Test Your Setup

1. In your app, navigate to the debug screen (you should see a "Supabase Debug" option)
2. Click "Test Connection" - should show ✅
3. Click "Test Database Tables" - should show ✅

## Step 4: Create Your First Account

1. Go to Sign Up in your app
2. Create an account with:
   - Email: your-email@example.com
   - Password: 123456 (6 digits)
   - Name: Your Name
   - Phone: Your phone number

## Step 5: Make Yourself Admin (Optional)

If you want admin access:

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find your user record
4. Change the `role` field from `parent` to `admin`
5. Save the changes

## Troubleshooting

### If sign-up fails:
- Check that email confirmation is disabled
- Verify the SQL script ran successfully
- Check the console logs for specific error messages

### If sign-in fails:
- Make sure you're using exactly 6 digits for password
- Verify your account was created successfully
- Check if email confirmation is still enabled (should be disabled)

### If you see "Supabase not configured":
- Verify your .env file has the correct URL and key
- Restart your development server
- Check the debug screen for validation details

## Current Configuration Status

✅ **Supabase URL**: https://zfwlrskjtwabynglrmgz.supabase.co
✅ **Anon Key**: Configured (starts with eyJ...)
✅ **Environment Variables**: Set correctly

You just need to complete the database setup and disable email confirmation!