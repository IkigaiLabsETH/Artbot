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

# Ensure the plugin is linked in the agent's node_modules
echo "Linking plugin-art-creator to agent..."
mkdir -p agent/node_modules/@elizaos
rm -rf agent/node_modules/@elizaos/plugin-art-creator
ln -sf ../../../../packages/plugin-art-creator agent/node_modules/@elizaos/plugin-art-creator

# Run the agent with the art-creator character
echo "Starting Eliza with the art-creator character..."
cd agent && npm run dev -- --character="../characters/art-creator.json" 