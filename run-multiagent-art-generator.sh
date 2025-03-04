#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 ArtBot Multi-Agent Art Generator${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if a concept was provided
if [ -z "$1" ]; then
    echo "Please provide a concept for the art generator."
    echo "Usage: $0 \"Your concept here\" [category]"
    exit 1
fi

# Get the concept from the first argument
CONCEPT="$1"

# Get the category from the second argument (optional)
CATEGORY="${2:-magritte_surrealism}"

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

# Ensure the output directory exists
mkdir -p output

# Find the correct path to the compiled JavaScript file
if [ -f "dist/defaultArtGenerator.js" ]; then
    JS_FILE="dist/defaultArtGenerator.js"
elif [ -f "dist/src/defaultArtGenerator.js" ]; then
    JS_FILE="dist/src/defaultArtGenerator.js"
else
    echo "Could not find the compiled JavaScript file. Please check the TypeScript compilation."
    exit 1
fi

# Run the art generator with the provided concept and category
echo -e "${BLUE}🚀 Running ArtBot Multi-Agent Art Generator...${NC}"
node $JS_FILE "$CONCEPT" "$CATEGORY"

# Create a sanitized version of the concept for filename matching
SANITIZED_CONCEPT=$(echo "$CONCEPT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Check if the image was generated - look for the specific file based on the concept
IMAGE_FILE="output/flux-$SANITIZED_CONCEPT.png"

if [ -f "$IMAGE_FILE" ]; then
    echo -e "${GREEN}✅ Image generated successfully: ${YELLOW}$IMAGE_FILE${NC}"
    
    # Get the image URL from the corresponding .txt file
    IMAGE_URL_FILE="output/flux-$SANITIZED_CONCEPT.txt"
    if [ -f "$IMAGE_URL_FILE" ]; then
        echo -e "${GREEN}✅ Image URL: ${YELLOW}$(cat $IMAGE_URL_FILE)${NC}"
    fi
else
    # Fallback to finding any recently created image file
    RECENT_IMAGE=$(find output -name "flux-*.png" -type f -mmin -2 | head -1)
    if [ -n "$RECENT_IMAGE" ]; then
        echo -e "${GREEN}✅ Image generated successfully: ${YELLOW}$RECENT_IMAGE${NC}"
        
        # Get the image URL from the corresponding .txt file
        IMAGE_URL_FILE="${RECENT_IMAGE%.png}.txt"
        if [ -f "$IMAGE_URL_FILE" ]; then
            echo -e "${GREEN}✅ Image URL: ${YELLOW}$(cat $IMAGE_URL_FILE)${NC}"
        fi
    else
        echo -e "${RED}❌ No image file found. Check the logs for errors.${NC}"
    fi
fi

echo -e "${GREEN}✨ Art generation completed!${NC}"
echo -e "${BLUE}📁 Check the output directory for your generated art.${NC}"

# Provide instructions for viewing the generated image
echo -e "${YELLOW}💡 To view your generated image, copy the URL from the output file and paste it into your browser.${NC}"
echo -e "${YELLOW}   Or check the metadata file for more information about the generated art.${NC}" 