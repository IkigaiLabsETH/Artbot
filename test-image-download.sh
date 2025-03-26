#!/bin/bash

# Test script for the image download functionality

# Ensure TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo "TypeScript is not installed. Installing..."
    npm install -g typescript
fi

# Ensure the output directory exists
mkdir -p output

# Compile TypeScript code
echo "Compiling TypeScript code..."
tsc

# Run the art generator with a simple concept
echo "Running art generator with test concept..."
node dist/src/defaultArtGenerator.js "Test concept for image download" "Margritte_surrealism"

echo "Test completed. Check the output directory for results." 