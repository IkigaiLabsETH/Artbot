#!/bin/bash

# Set Node.js version if nvm is available
echo "Setting Node.js version..."
if command -v nvm &> /dev/null; then
  nvm use 23 || { echo "Failed to set Node.js version."; exit 1; }
else
  echo "nvm not found, using system Node.js version: $(node -v)"
fi

# Build the project
echo "Building the project..."
npm run build || { echo "TypeScript compilation failed."; exit 1; }

# Run the test
echo "Running Multi-Agent System Test..."
node test-multiagent.js

echo "Test completed!" 