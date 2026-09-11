#!/bin/bash
set -e

echo "=== VERIFYING GAME MEDIA ASSETS ==="
npx tsx scripts/verify-release-assets.ts

OUTPUT="game-media.tar.gz"
echo "=== PACKAGING GAME MEDIA ASSETS BUNDLE ($OUTPUT) ==="
echo "Compressing videos and audio tracks..."

tar -czf "$OUTPUT" \
  resources/videos \
  resources/audio

SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "✓ Successfully created $OUTPUT ($SIZE)"

if [ "$1" == "--upload" ]; then
  echo "Uploading $OUTPUT to GitHub Release assets-v1..."
  gh release upload assets-v1 "$OUTPUT" --clobber
  echo "✓ Successfully uploaded $OUTPUT to assets-v1 mirror!"
else
  echo ""
  echo "To upload to GitHub Release mirror, run:"
  echo "  gh release upload assets-v1 $OUTPUT --clobber"
  echo "Or run this script with --upload:"
  echo "  bash scripts/pack-media-assets.sh --upload"
fi
