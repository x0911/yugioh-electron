#!/bin/bash
set -e

OUTPUT="game-assets.tar.gz"
echo "=== PACKAGING GAME MEDIA ASSETS BUNDLE ==="
echo "Compressing cards, videos, audio, backgrounds, and character portraits..."

tar -czf "$OUTPUT" \
  resources/cards \
  resources/videos \
  resources/audio \
  resources/backgrounds \
  resources/characters

SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "✓ Successfully created $OUTPUT ($SIZE)"
echo "Upload to: https://github.com/x0911/yugioh-electron/releases/tag/assets-v1"
