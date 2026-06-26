#!/bin/bash
# Deploy web to Vercel
cd ~/Projects/smart-home-inventory/web

# Read token from env file
VTOKEN=$(grep VERCEL_TOKEN ~/Hermes/.env | head -1 | cut -d= -f2-)

# Unset conflicting vars
unset VERCEL_PROJECT_ID
unset VERCEL_ORG_ID

# Deploy
vercel deploy --token="$VTOKEN" --yes --prod 2>&1
echo ""
echo "EXIT CODE: $?"
