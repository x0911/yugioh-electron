#!/bin/bash
set -e

OUTPUT="card-images.tar.gz"
echo "=== PACKAGING CARD IMAGES BUNDLE ==="
echo "Target directory: resources/cards"

if [ ! -d "resources/cards" ]; then
  echo "Error: resources/cards directory not found!"
  exit 1
fi

echo "Compressing card images (full, art, mini, card-back)..."
tar -czf "$OUTPUT" resources/cards

SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "✓ Successfully created $OUTPUT ($SIZE)"
echo "To upload to release: gh release upload assets-v1 $OUTPUT --clobber"
