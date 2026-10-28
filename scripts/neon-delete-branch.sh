#!/usr/bin/env bash
# Deletes the Neon branch with the given name, if it exists.
# Needs NEON_API_KEY and NEON_PROJECT_ID in the environment.
set -euo pipefail

name="${1:?Usage: neon-delete-branch.sh <branch-name>}"
: "${NEON_API_KEY:?Set the NEON_API_KEY repository secret}"
: "${NEON_PROJECT_ID:?Set the NEON_PROJECT_ID repository variable}"

api="https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches"
id=$(curl -fsS -H "Authorization: Bearer $NEON_API_KEY" "$api?search=$name" \
  | jq -r --arg name "$name" '.branches[] | select(.name == $name) | .id')

if [ -z "$id" ]; then
  echo "No Neon branch named $name; nothing to delete."
  exit 0
fi

curl -fsS -X DELETE -H "Authorization: Bearer $NEON_API_KEY" "$api/$id" > /dev/null
echo "Deleted Neon branch $name ($id)."
