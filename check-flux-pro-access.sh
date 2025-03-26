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
echo "║   🔍 FLUX Pro Model Access Checker                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check for Replicate API key
if [ -z "$REPLICATE_API_KEY" ]; then
    if [ -f .env ]; then
        echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
        export $(grep -v '^#' .env | xargs)
    else
        echo -e "${RED}Error: REPLICATE_API_KEY is not set.${NC}"
        echo -e "Please set this environment variable or create a .env file.${NC}"
        exit 1
    fi
fi

if [ -z "$REPLICATE_API_KEY" ]; then
    echo -e "${RED}Error: REPLICATE_API_KEY is still not set.${NC}"
    echo -e "Please set this environment variable in your .env file.${NC}"
    exit 1
fi

# Define the FLUX Pro model
FLUX_PRO_MODEL="black-forest-labs/flux-1.1-pro"

echo -e "${YELLOW}Checking access to FLUX Pro model: ${FLUX_PRO_MODEL}${NC}"

# Make a request to the Replicate API to check model access
RESPONSE=$(curl -s -H "Authorization: Token $REPLICATE_API_KEY" \
    "https://api.replicate.com/v1/models/$FLUX_PRO_MODEL")

# Check if the response contains an error
if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ You do not have access to the FLUX Pro model.${NC}"
    echo -e "${YELLOW}Error response: ${RESPONSE}${NC}"
    echo -e "\n${YELLOW}Possible reasons:${NC}"
    echo -e "1. Your Replicate API key may not have access to this model"
    echo -e "2. The model name may have changed or been deprecated"
    echo -e "3. There may be an issue with the Replicate API"
    echo -e "\n${YELLOW}Suggestions:${NC}"
    echo -e "1. Check your Replicate account to ensure you have access to this model"
    echo -e "2. Try using a different model by setting the DEFAULT_IMAGE_MODEL environment variable"
    echo -e "3. The scripts will automatically fall back to other models if FLUX Pro is not available"
else
    echo -e "${GREEN}✅ You have access to the FLUX Pro model!${NC}"
    echo -e "${YELLOW}The Margritte art generator scripts will use this model for image generation.${NC}"
    
    # Extract and display the model's latest version
    LATEST_VERSION=$(echo "$RESPONSE" | grep -o '"latest_version": {[^}]*}' | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$LATEST_VERSION" ]; then
        echo -e "${GREEN}Latest version: ${LATEST_VERSION}${NC}"
    fi
fi

echo -e "\n${BLUE}For more information about the Margritte art generator, see:${NC}"
echo -e "${YELLOW}Margritte-ART-GENERATOR-README.md${NC}" 