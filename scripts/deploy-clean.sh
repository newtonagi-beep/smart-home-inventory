#!/bin/bash
# Deploy web to Vercel - clean environment
set -e

cd ~/Projects/smart-home-inventory/web

# Read token directly
TOKEN="***"
while IFS='=' read -r key value; do
    if [[ "$key" == "VERCEL_TOKEN" ]]; then
        TOKEN="$value"
        break
    fi
done < ~/Hermes/.env

# Strip quotes
TOKEN="${TOKEN%\"}"
TOKEN="${TOKEN#\"}"
TOKEN="${TOKEN%\'}"
TOKEN="${TOKEN#\'}"

echo "Token loaded: ${TOKEN:0:8}..."

# Unset all conflicting Vercel env vars
unset VERCEL_PROJECT_ID
unset VERCEL_ORG_ID
unset VERCEL_TOKEN
unset NEXT_PUBLIC_VERCEL_URL

# Deploy
export VERCEL_TOKEN="$TOKEN"
npx -y vercel deploy --token="$VERCEL_TOKEN" --yes --prod 2>&1
echo ""
echo "EXIT: $?"
