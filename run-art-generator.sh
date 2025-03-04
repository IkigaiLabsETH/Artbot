#!/bin/bash

# Set default concept if not provided
CONCEPT="${1:-cosmic garden}"
echo "🎨 Running ArtBot with concept: \"$CONCEPT\""

# Check if .env file exists
if [ -f .env ]; then
  echo "📝 Loading environment variables from .env file"
  # Use a safer method to load environment variables
  set -a
  source .env
  set +a
else
  echo "⚠️ No .env file found. Make sure environment variables are set."
fi

# Check for required API keys
if [ -z "$REPLICATE_API_KEY" ]; then
  echo "❌ Error: REPLICATE_API_KEY environment variable is required"
  exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Error: Either ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable is required"
  exit 1
fi

# Print API key status
echo "✅ API Keys found:"
if [ -n "$REPLICATE_API_KEY" ]; then
  echo "  - Replicate: Yes"
else
  echo "  - Replicate: No"
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "  - Anthropic: Yes"
else
  echo "  - Anthropic: No"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  echo "  - OpenAI: Yes"
else
  echo "  - OpenAI: No"
fi

# Run the art generator
echo "🚀 Running ArtBot..."
node dist/generate-art.js "$CONCEPT" 