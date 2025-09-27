# ISCD Soccer Club App - Setup Guide

## 🚀 Quick Start (Demo Mode)

Your app is currently running in **Demo Mode** and is fully functional! You can:

- Sign in as Admin: `admin@iscd.org` / `123456`
- Sign in as Parent: `parent@example.com` / `654321`
- Test all features without any backend setup

## 🔧 Production Setup (Optional)

To use real user accounts and data persistence, you'll need to set up Supabase:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Choose your organization and fill in project details
5. Wait for the project to be created

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**

### 3. Configure Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=your_actual_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 4. Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and run the SQL commands from `docs/supabase-schema.md`
3. This will create all necessary tables and security policies

### 5. Restart Your App

After configuring Supabase, restart your development server to use real authentication and data storage.

## 📱 Features

### For Parents:
- ✅ Secure 6-digit PIN authentication
- ✅ View and manage children's information
- ✅ Track payment status and fees
- ✅ Message admin directly
- ✅ View announcements and updates
- ✅ Download pictures of the week

### For Admins:
- ✅ Manage all users and children
- ✅ Set fee structures
- ✅ Send announcements to all parents
- ✅ Upload pictures of the week
- ✅ View and respond to parent messages
- ✅ Comprehensive dashboard with statistics

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Secure authentication with Supabase Auth
- Role-based access control (admin vs parent)
- Input validation and sanitization
- Secure password requirements (6-digit PIN)

## 🛠️ Technical Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Query + Context API
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## 📞 Support

If you need help setting up Supabase or have any questions about the app, please refer to:

1. [Supabase Documentation](https://supabase.com/docs)
2. The `docs/supabase-schema.md` file for database setup
3. Console logs in your development environment for debugging

## 🎯 Demo Accounts

When running in demo mode, use these accounts:

**Admin Account:**
- Email: `admin@iscd.org`
- Password: `123456`

**Parent Account:**
- Email: `parent@example.com`
- Password: `654321`

---

**Note**: The app will automatically detect if Supabase is configured and switch between demo mode and production mode accordingly.