#!/bin/bash

# Set Node.js version
echo "Setting Node.js version..."
nvm use 23 || { echo "Failed to set Node.js version. Make sure nvm is installed."; exit 1; }

# Build the project
echo "Building the project..."
npx tsc || { echo "TypeScript compilation failed."; exit 1; }

# Run the demo
echo "Running Multi-Agent Art Creation System Demo..."
node dist/demo-multiagent.js

echo "Demo completed!" 