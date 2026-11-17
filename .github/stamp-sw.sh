#!/bin/sh
# Stamps the service worker's cache tokens. Usage: stamp-sw.sh <sw.js> <public-dir>
#   __VERSION__     first 8 characters of $GITHUB_SHA
#   __MEDIA_HASH__  12 characters of sha256 over the sorted file list and contents
#                   of <public-dir>/sounds and <public-dir>/grooves
set -eu

sw=$1
dir=$2
version=$(printf %s "$GITHUB_SHA" | cut -c1-8)

if command -v sha256sum >/dev/null 2>&1; then sha=sha256sum; else sha='shasum -a 256'; fi
media_hash=$(
  cd "$dir"
  find sounds grooves -type f | LC_ALL=C sort | while IFS= read -r file; do
    printf '%s\n' "$file"
    cat "$file"
  done | $sha | cut -c1-12
)

sed -e "s/__VERSION__/$version/" -e "s/__MEDIA_HASH__/$media_hash/" "$sw" > "$sw.tmp"
mv "$sw.tmp" "$sw"
