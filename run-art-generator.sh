#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
  echo "✅ Found .env file"
else
  echo "❌ .env file not found"
  exit 1
fi

# Set environment variables manually
export REPLICATE_API_KEY=$(grep REPLICATE_API_KEY .env | cut -d '=' -f2)
export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d '=' -f2)
export OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2)

# Check for required environment variables
if [ -z "$REPLICATE_API_KEY" ]; then
  echo "❌ REPLICATE_API_KEY is not set in .env file"
  exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Either ANTHROPIC_API_KEY or OPENAI_API_KEY must be set in .env file"
  exit 1
fi

# Print environment variables (masked for security)
echo "✅ REPLICATE_API_KEY: ${REPLICATE_API_KEY:0:5}..."
if [ ! -z "$ANTHROPIC_API_KEY" ]; then
  echo "✅ ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:5}..."
fi
if [ ! -z "$OPENAI_API_KEY" ]; then
  echo "✅ OPENAI_API_KEY: ${OPENAI_API_KEY:0:5}..."
fi

# Run the art generator with the provided concept or default to "cosmic garden"
CONCEPT="${1:-cosmic garden}"
echo "🚀 Running ArtBot with concept: \"$CONCEPT\""

# Execute the art generator
node dist/generate-art.js "$CONCEPT" 