#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Soundmark — Bulk Upload Songs to AWS S3
# ─────────────────────────────────────────────────────────────────
#
# Prerequisites:
#   brew install awscli
#   aws configure  (enter your Access Key, Secret Key, region: ap-south-1)
#
# Usage:
#   ./scripts/bulk-upload.sh /path/to/your/music
#
# Expected folder structure on your local machine:
#   /path/to/your/music/
#   ├── en/              # English songs
#   │   ├── jazz/
#   │   │   ├── song1.mp3
#   │   │   └── song2.mp3
#   │   ├── lounge/
#   │   ├── ambient/
#   │   └── ...
#   ├── hi/              # Hindi songs
#   │   ├── bollywood/
#   │   ├── devotional/
#   │   └── ...
#   ├── es/              # Spanish
#   ├── ar/              # Arabic
#   ├── af/              # African
#   ├── in-regional/     # Indian Regional
#   │   ├── tamil/
#   │   ├── telugu/
#   │   └── ...
#   └── in-instrumental/ # Indian Instrumental
#       ├── wedding/
#       ├── ceremony/
#       └── ...
#
# The script will upload all audio files preserving the folder structure.
# ─────────────────────────────────────────────────────────────────

set -euo pipefail

BUCKET="soundmark-music"
REGION="ap-south-1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "${1:-}" ]; then
  echo -e "${RED}Usage: $0 /path/to/your/music${NC}"
  echo ""
  echo "Expected folder structure:"
  echo "  /path/to/music/en/jazz/song.mp3"
  echo "  /path/to/music/hi/bollywood/song.mp3"
  echo "  etc."
  exit 1
fi

SOURCE_DIR="$1"

if [ ! -d "$SOURCE_DIR" ]; then
  echo -e "${RED}Error: Directory '$SOURCE_DIR' does not exist${NC}"
  exit 1
fi

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}Error: AWS CLI not found. Install with: brew install awscli${NC}"
  echo "Then run: aws configure"
  exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Soundmark — Bulk Upload to S3${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Source:  ${YELLOW}$SOURCE_DIR${NC}"
echo -e "  Bucket:  ${YELLOW}s3://$BUCKET${NC}"
echo -e "  Region:  ${YELLOW}$REGION${NC}"
echo ""

# Count files
TOTAL_FILES=$(find "$SOURCE_DIR" -type f \( -name "*.mp3" -o -name "*.m4a" -o -name "*.aac" -o -name "*.flac" -o -name "*.wav" -o -name "*.ogg" -o -name "*.wma" \) | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$SOURCE_DIR" 2>/dev/null | cut -f1)

echo -e "  Files:   ${GREEN}$TOTAL_FILES audio files${NC}"
echo -e "  Size:    ${GREEN}$TOTAL_SIZE${NC}"
echo ""

# Show breakdown by language folder
echo -e "${BLUE}  Breakdown:${NC}"
for lang_dir in "$SOURCE_DIR"/*/; do
  if [ -d "$lang_dir" ]; then
    lang=$(basename "$lang_dir")
    count=$(find "$lang_dir" -type f \( -name "*.mp3" -o -name "*.m4a" -o -name "*.aac" -o -name "*.flac" -o -name "*.wav" -o -name "*.ogg" \) | wc -l | tr -d ' ')
    size=$(du -sh "$lang_dir" 2>/dev/null | cut -f1)
    echo -e "    ${lang}: ${count} files (${size})"
  fi
done
echo ""

read -p "Proceed with upload? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Upload cancelled.${NC}"
  exit 0
fi

echo ""
echo -e "${GREEN}Starting upload...${NC}"
echo ""

# Sync with progress, setting correct content types
aws s3 sync "$SOURCE_DIR" "s3://$BUCKET/" \
  --region "$REGION" \
  --exclude "*" \
  --include "*.mp3" \
  --include "*.m4a" \
  --include "*.aac" \
  --include "*.flac" \
  --include "*.wav" \
  --include "*.ogg" \
  --content-type "audio/mpeg" \
  --metadata '{"uploaded-by":"bulk-upload-cli","platform":"soundmark"}' \
  --storage-class STANDARD \
  --no-progress \
  2>&1 | while IFS= read -r line; do
    echo -e "  ${GREEN}✓${NC} $line"
  done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Upload complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  View in AWS Console:"
echo -e "  ${BLUE}https://$REGION.console.aws.amazon.com/s3/buckets/$BUCKET${NC}"
echo ""
