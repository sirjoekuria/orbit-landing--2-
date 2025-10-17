# Supabase Integration Setup Guide

This guide will help you set up Supabase as your database for the delivery system.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `delivery-system` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `env.example`)
2. Add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` and paste it into the SQL editor
3. Click **Run** to execute the schema creation
4. This will create all the necessary tables, indexes, and security policies

## 5. Migrate Your Existing Data

1. Make sure your `.env` file is set up with the correct credentials
2. Run the migration script:

```bash
node scripts/migrate-to-supabase.js
```

This will migrate your existing JSON data to Supabase.

## 6. Update Your Route Handlers

The new Supabase-based route handlers are in `server/routes/auth-supabase.ts`. To use them:

1. Replace the imports in your main server file:

```typescript
// Replace this:
import { userSignup, login, getProfile, updateProfile, getAllUsers, toggleUserStatus, deleteUser, forgotPassword, resetPassword } from "./routes/auth";

// With this:
import { userSignup, login, getProfile, updateProfile, getAllUsers, toggleUserStatus, deleteUser, forgotPassword, resetPassword } from "./routes/auth-supabase";
```

2. Update other route files similarly to use the `DatabaseService`

## 7. Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Test the API endpoints to ensure they work with Supabase
3. Check your Supabase dashboard to see the data being created

## 8. Database Schema Overview

The following tables are created:

- **users**: Customer and admin user accounts
- **riders**: Rider-specific information (extends users)
- **orders**: Delivery orders
- **activities**: System activities and rider actions
- **locations**: Geographic locations for delivery
- **reset_tokens**: Password reset tokens
- **payments**: Payment records
- **withdrawals**: Rider withdrawal requests
- **partnership_requests**: Business partnership requests
- **messages**: Contact form messages

## 9. Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: Integrated with Supabase Auth (optional)
- **Data validation**: Database-level constraints and checks
- **Indexes**: Optimized for common queries

## 10. Benefits of Supabase

- **Real-time subscriptions**: Get live updates on data changes
- **Built-in authentication**: User management and JWT tokens
- **Automatic backups**: Your data is safely backed up
- **Scalability**: Handles growth from small to large scale
- **Dashboard**: Visual interface to manage your data
- **API**: Auto-generated REST and GraphQL APIs

## Troubleshooting

### Common Issues

1. **Connection errors**: Check your SUPABASE_URL and keys
2. **Permission errors**: Ensure RLS policies are set correctly
3. **Migration errors**: Check that your JSON data format matches the schema

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

1. **Enable Authentication**: Set up Supabase Auth for user management
2. **Add Real-time Features**: Use Supabase subscriptions for live updates
3. **Set up Backups**: Configure automatic backups
4. **Monitor Performance**: Use Supabase dashboard to monitor usage
5. **Scale**: Upgrade your plan as your application grows
