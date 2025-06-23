# Plaid Bank Connection Setup (2 minutes)

To enable real bank connections in Clip, you need to set up Plaid environment variables in Railway.

## Step 1: Get Plaid Credentials

1. Go to [Plaid Dashboard](https://dashboard.plaid.com)
2. Sign in or create a free account
3. Create a new app or use existing
4. Copy your credentials:
   - `client_id` 
   - `secret` (for sandbox)
   - `environment` (sandbox for testing, production for live)

## Step 2: Add to Railway

1. Go to your Railway project
2. Click on your backend service
3. Go to **Variables** tab
4. Add these environment variables:

```
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_secret_here
PLAID_ENV=sandbox
```

## Step 3: Deploy

Railway will automatically redeploy with the new variables.

## Step 4: Test

- The "Import Data" button will now connect to real Plaid
- Demo mode message will disappear
- You can connect real bank accounts

## Environments

- **sandbox**: For testing with fake bank accounts
- **development**: For real banks in development  
- **production**: For live production use

That's it! Bank connections are now live.