#!/bin/bash

# Create a directory for downloaded images if it doesn't exist
IMAGES_DIR="./images"
mkdir -p "$IMAGES_DIR"

# Check if output directory exists
if [ ! -d "./output" ]; then
  echo "❌ Error: No output directory found. Generate some art first!"
  exit 1
fi

# Count how many image URLs we have
URL_COUNT=$(ls -1 ./output/*.txt 2>/dev/null | wc -l)

if [ "$URL_COUNT" -eq 0 ]; then
  echo "❌ Error: No image URLs found in the output directory. Generate some art first!"
  exit 1
fi

echo "🖼️ Found $URL_COUNT image URLs to download"

# Loop through each URL file in the output directory
for URL_FILE in ./output/*.txt; do
  # Get the base filename without extension
  FILENAME=$(basename "$URL_FILE" .txt)
  
  # Read the URL from the file
  IMAGE_URL=$(cat "$URL_FILE")
  
  echo "⬇️ Downloading image for concept: $FILENAME"
  
  # Download the image using curl
  curl -s "$IMAGE_URL" -o "$IMAGES_DIR/$FILENAME.png"
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully downloaded to $IMAGES_DIR/$FILENAME.png"
  else
    echo "❌ Failed to download image from $URL_FILE"
  fi
done

echo "🎉 All images downloaded to $IMAGES_DIR directory" 