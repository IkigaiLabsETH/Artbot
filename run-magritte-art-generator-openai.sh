#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🎩 Margritte Surrealism Art Generator (OpenAI) 🎨        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo -e "${RED}Error: TypeScript compiler (tsc) is not installed.${NC}"
    echo -e "Please install it using: ${YELLOW}npm install -g typescript${NC}"
    exit 1
fi

# Check for required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    if [ -f .env ]; then
        echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
        export $(grep -v '^#' .env | xargs)
    else
        echo -e "${RED}Error: OPENAI_API_KEY is not set.${NC}"
        echo -e "Please set this environment variable or create a .env file.${NC}"
        exit 1
    fi
fi

if [ -z "$REPLICATE_API_KEY" ]; then
    echo -e "${RED}Error: REPLICATE_API_KEY is not set.${NC}"
    echo -e "Please set this environment variable in your .env file.${NC}"
    exit 1
fi

# Get the concept from command line arguments or use a default
CONCEPT="$*"
if [ -z "$CONCEPT" ]; then
    echo -e "${YELLOW}No concept provided. Will generate a random Margritte surrealist concept.${NC}"
fi

# Set OpenAI as the primary model
export USE_OPENAI_PRIMARY=true
echo -e "${GREEN}Using OpenAI as the primary model for AI completions.${NC}"

# Set the image model to FLUX Pro
export DEFAULT_IMAGE_MODEL="black-forest-labs/flux-1.1-pro"
export OUTPUT_FORMAT="png"
echo -e "${GREEN}Using image model: ${DEFAULT_IMAGE_MODEL}${NC}"
echo -e "${GREEN}Output format: ${OUTPUT_FORMAT}${NC}"

# Compile TypeScript code
echo -e "${GREEN}Compiling TypeScript code...${NC}"
tsc

# Run the art generator with Margritte surrealism category
echo -e "${GREEN}Running Margritte Surrealism Art Generator...${NC}"
node dist/defaultArtGenerator.js --category=Margritte_surrealism "$CONCEPT"

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Art generation complete!${NC}"
    echo -e "${YELLOW}Generated images and metadata are saved in the 'output' directory.${NC}"
    
    # Find the most recent image file (macOS compatible)
    if [ "$(uname)" == "Darwin" ]; then
        LATEST_IMAGE=$(find output -name "flux-*.png" -type f | sort | tail -1)
    else
        LATEST_IMAGE=$(find output -name "flux-*.png" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d" ")
    fi
    
    if [ ! -z "$LATEST_IMAGE" ]; then
        echo -e "${GREEN}Latest generated image: ${BLUE}$LATEST_IMAGE${NC}"
        
        # Check if we're in a graphical environment
        if [ -n "$DISPLAY" ] || [ "$(uname)" == "Darwin" ]; then
            echo -e "${YELLOW}Attempting to open the image...${NC}"
            
            # Try to open the image with the appropriate command based on OS
            if [ "$(uname)" == "Darwin" ]; then
                open "$LATEST_IMAGE" 2>/dev/null
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$LATEST_IMAGE" 2>/dev/null
            elif command -v display &> /dev/null; then
                display "$LATEST_IMAGE" 2>/dev/null
            else
                echo -e "${YELLOW}Could not automatically open the image. Please open it manually.${NC}"
            fi
        fi
    fi
else
    echo -e "\n${RED}❌ Art generation failed.${NC}"
    echo -e "${YELLOW}Please check the error messages above.${NC}"
fi 