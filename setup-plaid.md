# Plaid Integration Setup

## Quick Setup (5 minutes)

### 1. Get Plaid Credentials
1. Go to **https://dashboard.plaid.com/signup**
2. Sign up for a free developer account
3. Complete the account verification
4. Navigate to **Keys** section in dashboard
5. Copy your **Sandbox credentials**:
   - `client_id` (starts with something like `65a1b2c3d4e5f6g7h8i9j0k1`)
   - `secret` (starts with something like `abcd1234efgh5678ijkl9012`)

### 2. Set Environment Variables

#### For Local Development:
```bash
# Backend directory
cd /Users/chulhojkim/CascadeProjects/money-clip-mvp/backend

# Set environment variables (replace with your actual credentials)
export PLAID_ENV=sandbox
export PLAID_CLIENT_ID=your_actual_client_id_here
export PLAID_SECRET=your_actual_secret_here

# Test the connection
python3 -c "
from plaid_service import PlaidService
service = PlaidService()
print('Plaid Status:', service.get_status())
print('Available:', service.is_available())
"
```

#### For Railway Production:
1. Go to your Railway project dashboard
2. Navigate to **Variables** tab
3. Add these environment variables:
   ```
   PLAID_ENV=sandbox
   PLAID_CLIENT_ID=your_actual_client_id_here
   PLAID_SECRET=your_actual_secret_here
   ```
4. Deploy and test

### 3. Test Bank Connection

Once credentials are set:

1. **Frontend**: Click "Import Data" button
2. **Expected**: Plaid Link modal opens with real bank selection
3. **Demo banks available**: Chase, Wells Fargo, Bank of America, etc.
4. **Test credentials**: Use Plaid's test credentials
   - Username: `user_good`
   - Password: `pass_good`

### 4. Verify Integration

After connecting a test bank account:

- ✅ Accounts appear in dashboard
- ✅ Balance updates automatically  
- ✅ Recent transactions sync
- ✅ Daily allowance recalculates

## Current Status

**System is ready for Plaid!** 

- ✅ Plaid Python SDK installed
- ✅ Configuration system set up
- ✅ Frontend Plaid Link integration complete
- ✅ Backend API endpoints ready
- ✅ Database models support Plaid data
- ⏳ **Just need real credentials**

## Troubleshooting

### Common Issues:

**"Invalid client_id"**: Check that you copied the full client_id from Plaid dashboard

**"Invalid secret"**: Ensure secret is from the same environment (sandbox/development/production)

**"Environment mismatch"**: Make sure `PLAID_ENV=sandbox` matches your credential type

### Test Connection:
```bash
curl -X GET http://localhost:5001/api/plaid/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response with valid credentials:
```json
{
  "available": true,
  "demo_mode": false,
  "environment": {
    "environment": "sandbox",
    "is_valid": true,
    "validation_message": "Configuration valid"
  }
}
```

## Production Ready

Once working in sandbox:

1. Apply for Plaid Production access
2. Get production credentials  
3. Update `PLAID_ENV=production`
4. Set production `PLAID_CLIENT_ID` and `PLAID_SECRET`
5. Deploy to Railway

**Note**: Production approval typically takes 1-2 weeks and requires business verification.