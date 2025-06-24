# Manual Push Instructions

Due to git/shell session issues, please run these commands manually:

```bash
cd /Users/chulhojkim/CascadeProjects/money-clip-mvp

# Add the files
git add backend/requirements.txt backend/app.py

# Commit the changes
git commit -m "Fix Plaid integration by adding missing library

- Add plaid-python==8.1.0 to requirements.txt  
- Add debug endpoint for Plaid configuration troubleshooting
- This should resolve the demo mode issue in production

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push
```

## What this fixes:
- Adds the missing `plaid-python` library to production
- Resolves the "demo mode" issue you were seeing
- Enables real Plaid bank connections

## After pushing:
1. Railway will automatically redeploy (2-3 minutes)
2. Test "Import Data" at https://app.moneyclip.money
3. Should open real Plaid Link instead of demo message

## Files changed:
- ✅ `backend/requirements.txt` - Added plaid-python==8.1.0
- ✅ `backend/app.py` - Added debug endpoint

The issue was that the Plaid Python library wasn't installed in production, causing it to fall back to mock/demo mode.