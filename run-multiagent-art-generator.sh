#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 ArtBot Multi-Agent Art Generator${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo -e "${RED}❌ TypeScript compiler not found. Installing...${NC}"
    npm install -g typescript
fi

# Check for required environment variables
if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ Warning: Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY environment variables are set.${NC}"
    echo -e "${YELLOW}   The art generator requires at least one of these to function properly.${NC}"
    
    # Check if .env file exists and source it
    if [ -f .env ]; then
        echo -e "${GREEN}✅ Found .env file. Loading environment variables...${NC}"
        export $(grep -v '^#' .env | xargs)
    else
        echo -e "${RED}❌ No .env file found. Please set up your API keys.${NC}"
        exit 1
    fi
fi

if [ -z "$REPLICATE_API_KEY" ]; then
    echo -e "${RED}❌ REPLICATE_API_KEY environment variable is not set.${NC}"
    echo -e "${RED}   This is required for image generation.${NC}"
    
    # Check if .env file exists and source it
    if [ -f .env ]; then
        echo -e "${GREEN}✅ Found .env file. Loading environment variables...${NC}"
        export $(grep -v '^#' .env | xargs)
    else
        echo -e "${RED}❌ No .env file found. Please set up your API keys.${NC}"
        exit 1
    fi
fi

# Compile TypeScript to JavaScript
echo -e "${BLUE}🔄 Compiling TypeScript code...${NC}"
tsc

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript compilation failed. Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Compilation successful!${NC}"

# Get concept from command line arguments
CONCEPT="$1"
CATEGORY="$2"

# Run the art generator
echo -e "${BLUE}🚀 Running ArtBot Multi-Agent Art Generator...${NC}"
if [ -n "$CONCEPT" ]; then
    if [ -n "$CATEGORY" ]; then
        echo -e "${GREEN}🎭 Using concept: ${YELLOW}\"$CONCEPT\"${GREEN} with category: ${YELLOW}\"$CATEGORY\"${NC}"
        node dist/defaultArtGenerator.js "$CONCEPT" "$CATEGORY"
    else
        echo -e "${GREEN}🎭 Using concept: ${YELLOW}\"$CONCEPT\"${NC}"
        node dist/defaultArtGenerator.js "$CONCEPT"
    fi
else
    echo -e "${GREEN}🎭 Generating a random concept...${NC}"
    node dist/defaultArtGenerator.js
fi

# Check if the art generation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Art generation failed. Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Art generation completed!${NC}"
echo -e "${BLUE}📁 Check the output directory for your generated art.${NC}"

# Provide instructions for viewing the generated image
echo -e "${YELLOW}💡 To view your generated image, copy the URL from the output file and paste it into your browser.${NC}"
echo -e "${YELLOW}   Or check the metadata file for more information about the generated art.${NC}" 