# Supabase Database Setup Guide

Follow these steps to create your Supabase database and connect it to the Smart Canteen System:

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Sign in with GitHub, Google, or create an account
4. Click "New Project"
5. Fill in the project details:
   - **Name**: Smart Canteen System
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your location
6. Click "Create new project"
7. Wait 2-3 minutes for the project to be ready

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API keys** → **anon public** key
   - **Project API keys** → **service_role** key (keep this secret!)

## Step 3: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Replace these with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_random_jwt_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/20250802101950_fading_valley.sql`
4. Paste it into the SQL editor
5. Click "Run" to create all tables and security policies

## Step 5: Seed Initial Data

1. In the SQL Editor, create another new query
2. Copy the entire contents of `supabase/migrations/20250802102012_copper_sunset.sql`
3. Paste it into the SQL editor
4. Click "Run" to insert demo data

## Step 6: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `users` (with 3 demo users)
   - `categories` (with 5 categories)
   - `items` (with sample menu items)
   - `orders` (empty, ready for new orders)
   - `wallet_transactions` (empty, ready for transactions)

## Step 7: Test the Connection

1. Start your development server: `npm run dev`
2. Check the console for connection messages
3. Visit `http://localhost:3001/api/health` to verify the API is working
4. You should see: `{"status":"OK","message":"Smart Canteen System API is running","database":"Connected"}`

## Demo Login Credentials

Once everything is set up, you can test the system with these credentials:

- **Admin User**:
  - QR Code: `DEMO_ADMIN`
  - PIN: `0000`

- **Staff User**:
  - QR Code: `DEMO_STAFF`
  - PIN: `9999`

- **Student User**:
  - QR Code: `DEMO_STUDENT`
  - PIN: `1234`

## Troubleshooting

### Connection Issues
- Verify your `.env` file has the correct Supabase URL and keys
- Make sure there are no extra spaces in your environment variables
- Check that your Supabase project is active and not paused

### Database Issues
- Ensure both migration files were run successfully
- Check the Supabase logs in the dashboard for any errors
- Verify Row Level Security is enabled on all tables

### Authentication Issues
- Make sure JWT_SECRET is set in your `.env` file
- Verify the demo users were created in the `users` table
- Check that the QR codes match exactly (case-sensitive)

## Security Notes

- Never commit your `.env` file to version control
- Keep your service role key secret
- The anon key is safe to use in frontend applications
- Row Level Security policies are already configured for data protection

## Next Steps

After successful setup:
1. Test all user roles (Admin, Staff, Student)
2. Try placing orders and managing the menu
3. Explore the wallet functionality
4. Customize the menu items and categories as needed

Need help? Check the console logs for detailed error messages or refer to the Supabase documentation.