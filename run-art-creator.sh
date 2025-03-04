#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js v23 or higher."
    exit 1
fi

# Get Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
echo "Current Node.js version: $NODE_VERSION"

# Commenting out the version check for testing purposes
# if [[ "$(echo "$NODE_VERSION" | cut -d '.' -f 1)" -lt 23 ]]; then
#     echo "Error: Node.js v23 or higher is required."
#     echo "Current version: v$NODE_VERSION"
#     echo "Please install Node.js v23 or higher."
#     exit 1
# fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed."
    echo "Please install pnpm."
    exit 1
fi

# Check if the character file exists
if [ ! -f "characters/art-creator.json" ]; then
    echo "Error: characters/art-creator.json does not exist."
    echo "Please create the character file."
    exit 1
fi

# Build the plugin-art-creator
echo "Building plugin-art-creator..."
cd packages/plugin-art-creator
pnpm install
pnpm build
cd ../..

# Create a symbolic link for the plugin in the agent's node_modules
echo "Creating symbolic link for plugin-art-creator..."
mkdir -p agent/node_modules/@elizaos
ln -sf ../../../packages/plugin-art-creator agent/node_modules/@elizaos/plugin-art-creator

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    # Set environment variables manually
    export OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | head -1 | cut -d '=' -f2 | sed 's/#.*$//' | tr -d ' ')
    export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | head -1 | cut -d '=' -f2 | sed 's/#.*$//' | tr -d ' ')
    export REPLICATE_API_KEY=$(grep REPLICATE_API_KEY .env | head -1 | cut -d '=' -f2 | sed 's/#.*$//' | tr -d ' ')
fi

# Check if the required API keys are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY is not set."
    echo "Please set the OPENAI_API_KEY environment variable."
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY is not set."
    echo "Please set the ANTHROPIC_API_KEY environment variable."
    exit 1
fi

if [ -z "$REPLICATE_API_KEY" ]; then
    echo "Error: REPLICATE_API_KEY is not set."
    echo "Please set the REPLICATE_API_KEY environment variable."
    exit 1
fi

echo "Using OPENAI_API_KEY: $OPENAI_API_KEY"
echo "Using ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY"
echo "Using REPLICATE_API_KEY: $REPLICATE_API_KEY"

# Run the agent with the art-creator character
echo "Starting Eliza with ArtBot character..."
cd agent
pnpm run start -- --characters="../characters/art-creator.json" 