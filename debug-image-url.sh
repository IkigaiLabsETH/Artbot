#!/bin/bash

# Debug script for the image URL issue

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

# Set environment variables for debugging
export DEBUG_REPLICATE=true
export DEBUG_IMAGE_URL=true

# Find the correct path to the compiled JavaScript file
if [ -f "dist/defaultArtGenerator.js" ]; then
    JS_FILE="dist/defaultArtGenerator.js"
elif [ -f "dist/src/defaultArtGenerator.js" ]; then
    JS_FILE="dist/src/defaultArtGenerator.js"
else
    echo "Could not find the compiled JavaScript file. Please check the TypeScript compilation."
    exit 1
fi

# Run the art generator with a simple concept
echo "Running art generator with test concept..."
echo "Using JavaScript file: $JS_FILE"
node $JS_FILE "Test concept for debugging image URL" "magritte_surrealism"

echo "Debug completed. Check the output directory and console logs for results." 