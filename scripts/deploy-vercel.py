#!/usr/bin/env python3
"""Deploy smart-home-inventory/web to Vercel via API."""
import json, os, subprocess, sys

# Read token
env_path = os.path.expanduser("~/Hermes/.env")
token = None
with open(env_path) as f:
    for line in f:
        if line.startswith("VERCEL_TOKEN="):
            token = line.split("=", 1)[1].strip().strip("'\"")

if not token:
    print("ERROR: VERCEL_TOKEN not found")
    sys.exit(1)

team_id = "newtonagi-3166s-projects"
project_name = "smart-home-inventory"
base = "https://api.vercel.com"
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Step 1: Fix project settings (remove rootDirectory)
print("=== Fixing project settings ===")
project_url = f"{base}/v1/projects/{project_name}?teamId={team_id}"
result = subprocess.run(
    ["curl", "-s", "-X", "PATCH", project_url,
     "-H", f"Authorization: Bearer {token}",
     "-H", "Content-Type: application/json",
     "-d", '{"rootDirectory":null,"framework":"nextjs"}'],
    capture_output=True, text=True, timeout=15
)
data = json.loads(result.stdout)
print(f"  rootDirectory: {data.get('rootDirectory', 'CLEARED')}")
print(f"  framework: {data.get('framework', '?')}")

# Step 2: Create deployment from GitHub
print("\n=== Creating deployment ===")
deploy_url = f"{base}/v13/deployments?teamId={team_id}"
payload = json.dumps({
    "name": project_name,
    "project": project_name,
    "target": "production",
    "gitSource": {
        "type": "github",
        "repo": "newtonagi-beep/smart-home-inventory",
        "repoId": 967274022,
        "ref": "main"
    },
    "projectSettings": {
        "framework": "nextjs",
        "rootDirectory": "web"
    }
})
result = subprocess.run(
    ["curl", "-s", "-X", "POST", deploy_url,
     "-H", f"Authorization: Bearer {token}",
     "-H", "Content-Type: application/json",
     "-d", payload],
    capture_output=True, text=True, timeout=30
)
data = json.loads(result.stdout)
url = data.get("url", "?")
state = data.get("state", "?")
print(f"  URL: {url}")
print(f"  State: {state}")

if url != "?":
    print(f"\n  ✅ Deployed: https://{url}")
else:
    err = data.get("error", data)
    print(f"  ❌ Error: {err}")
    print(f"  Full response: {json.dumps(data, indent=2)[:500]}")
