#!/bin/bash

# Script to run the Eliza application with the art-creator character

# Ensure we're using the correct Node.js version
if command -v nvm &> /dev/null; then
  nvm use 23 || echo "Please install Node.js v23 using nvm"
else
  echo "nvm not found. Please ensure you're using Node.js v23"
fi

# Check if the art-creator character exists
if [ ! -f "./characters/art-creator.json" ]; then
  echo "Error: art-creator.json not found in the characters directory"
  exit 1
fi

# Build the plugin-art-creator
echo "Building plugin-art-creator..."
cd packages/plugin-art-creator && npm run build && cd ../..

# Ensure the plugin is properly installed in the agent's node_modules
echo "Installing plugin-art-creator to agent..."
rm -rf agent/node_modules/@elizaos/plugin-art-creator
mkdir -p agent/node_modules/@elizaos/plugin-art-creator/dist
cp -r packages/plugin-art-creator/dist/* agent/node_modules/@elizaos/plugin-art-creator/dist/
cp packages/plugin-art-creator/package.json agent/node_modules/@elizaos/plugin-art-creator/

# Set environment variables for API keys if they're not already set
if [ -z "$OPENAI_API_KEY" ]; then
  export OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2)
  echo "Set OPENAI_API_KEY from .env file"
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
  export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d '=' -f2)
  echo "Set ANTHROPIC_API_KEY from .env file"
fi

if [ -z "$REPLICATE_API_KEY" ]; then
  export REPLICATE_API_KEY=$(grep REPLICATE_API_KEY .env | cut -d '=' -f2)
  echo "Set REPLICATE_API_KEY from .env file"
fi

# Run the agent with the art-creator character
echo "Starting Eliza with the art-creator character..."
cd agent && npm run dev -- --character="../characters/art-creator.json" 