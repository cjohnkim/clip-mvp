#!/bin/bash
cd /Users/chulhojkim/CascadeProjects/money-clip-mvp
git add backend/requirements.txt backend/app.py
git commit -m "Fix Plaid integration by adding missing library

- Add plaid-python==8.1.0 to requirements.txt
- Add debug endpoint for Plaid configuration troubleshooting
- This should resolve the demo mode issue in production

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
echo "Changes pushed! Railway will redeploy automatically."