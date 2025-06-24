#!/bin/bash
cd /Users/chulhojkim/CascadeProjects/money-clip-mvp
git add backend/app.py
git commit -m "Add Plaid configuration debug endpoint

- Add /api/debug/plaid-config endpoint to troubleshoot Plaid setup
- Shows environment variables, validation status, and credentials preview
- Helps debug Railway environment variable configuration

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push