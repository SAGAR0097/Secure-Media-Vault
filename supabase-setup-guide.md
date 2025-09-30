# Supabase Edge Function Setup Guide

## Step 1: Install Supabase CLI

### Option A: Direct Download
1. Download from: https://github.com/supabase/cli/releases
2. Extract to `C:\supabase\`
3. Add to PATH: `C:\supabase\`

### Option B: Using Scoop
```powershell
# Install Scoop
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Step 2: Initialize Project
```bash
supabase init
supabase login
```

## Step 3: Link to Supabase Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 4: Deploy Edge Function
```bash
supabase functions deploy hash-object
```

## Step 5: Get Function URL
After deployment, you'll get a URL like:
```
https://YOUR_PROJECT_REF.functions.supabase.co/hash-object
```

## Step 6: Configure Environment Variables
Add to your `.env` file:
```
EDGE_FUNCTION_URL=https://YOUR_PROJECT_REF.functions.supabase.co/hash-object
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
