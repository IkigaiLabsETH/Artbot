#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 ArtBot - Autonomous Creativity Demo${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js to run this demo.${NC}"
    exit 1
fi

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo -e "${YELLOW}⚠️ TypeScript is not installed. Installing TypeScript...${NC}"
    npm install -g typescript
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
        echo -e "${YELLOW}⚠️ Please edit the .env file to add your API keys before running the demo.${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example file not found. Please create a .env file with your API keys.${NC}"
        exit 1
    fi
fi

# Build the project
echo -e "${BLUE}🔨 Building the project...${NC}"
npm run build || { echo -e "${RED}❌ Build failed.${NC}"; exit 1; }

# Run the autonomous creativity demo
echo -e "${GREEN}✅ Build successful. Running the autonomous creativity demo...${NC}"
echo -e "${YELLOW}⚠️ This demo will run for 1 hour by default. Press Ctrl+C to stop it early.${NC}"
echo ""

node dist/demo-autonomous-creativity.js

echo -e "${GREEN}✅ Demo completed.${NC}" 