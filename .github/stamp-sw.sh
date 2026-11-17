#!/bin/sh
# Stamps the service worker's cache tokens. Usage: stamp-sw.sh <sw.js> <public-dir>
#   __VERSION__     first 8 characters of $GITHUB_SHA
#   __MEDIA_HASH__  12 characters of sha256 over the sorted file list and contents
#                   of <public-dir>/sounds and <public-dir>/grooves
# Every step runs on its own (no pipelines whose early stages could fail silently),
# so a failing find, cat or hash fails the script and leaves the worker unstamped.
set -eu

sw=$1
dir=$2
version=$(printf %s "$GITHUB_SHA" | cut -c1-8)

if command -v sha256sum >/dev/null 2>&1; then sha=sha256sum; else sha='shasum -a 256'; fi

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

(
  cd "$dir"
  find sounds grooves -type f > "$work/found"
  [ -s "$work/found" ] || { echo "stamp-sw: no media files in $dir" >&2; exit 1; }
  LC_ALL=C sort "$work/found" > "$work/sorted"
  while IFS= read -r file; do
    printf '%s\n' "$file"
    cat "$file"
  done < "$work/sorted" > "$work/stream"
)

digest=$($sha < "$work/stream")
media_hash=$(printf %s "$digest" | cut -c1-12)
[ "${#media_hash}" -eq 12 ] || { echo "stamp-sw: hashing failed" >&2; exit 1; }

sed -e "s/__VERSION__/$version/" -e "s/__MEDIA_HASH__/$media_hash/" "$sw" > "$work/sw.js"
cp "$work/sw.js" "$sw"
