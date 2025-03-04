#!/bin/bash

# Check if Node.js is installed and version is at least 23
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 23 ]; then
  echo "Error: Node.js v23 or higher is required."
  echo "Current version: $(node -v)"
  echo "Please install Node.js v23 or higher."
  exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "Error: pnpm is not installed."
  echo "Please install pnpm: npm install -g pnpm"
  exit 1
fi

# Check if the character file exists
if [ ! -f "characters/art-creator.json" ]; then
  echo "Error: characters/art-creator.json not found."
  echo "Please create this file or check its path."
  exit 1
fi

# Build the plugin-art-creator
echo "Building plugin-art-creator..."
cd packages/plugin-art-creator
pnpm install
pnpm run build
cd ../..

# Create symbolic link for the plugin in agent's node_modules
echo "Creating symbolic link for plugin-art-creator..."
mkdir -p agent/node_modules/@elizaos
rm -rf agent/node_modules/@elizaos/plugin-art-creator
ln -sf $(pwd)/packages/plugin-art-creator agent/node_modules/@elizaos/plugin-art-creator

# Load environment variables from .env file
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file..."
  # Set environment variables manually
  export OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2 | sed 's/#.*$//' | tr -d ' ')
  export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d '=' -f2 | tr -d ' ')
  export REPLICATE_API_KEY=$(grep REPLICATE_API_KEY .env | cut -d '=' -f2 | tr -d ' ')
fi

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY is not set."
  echo "Please set this environment variable in your .env file or export it."
  exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY is not set."
  echo "Please set this environment variable in your .env file or export it."
  exit 1
fi

if [ -z "$REPLICATE_API_KEY" ]; then
  echo "Error: REPLICATE_API_KEY is not set."
  echo "Please set this environment variable in your .env file or export it."
  exit 1
fi

# Print the API keys for debugging
echo "Using OPENAI_API_KEY: $OPENAI_API_KEY"
echo "Using ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY"
echo "Using REPLICATE_API_KEY: $REPLICATE_API_KEY"

# Run the agent with the art-creator character
echo "Starting Eliza with ArtBot character..."
cd agent
pnpm run start -- --characters="../characters/art-creator.json" 