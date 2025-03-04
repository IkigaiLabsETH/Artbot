#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "╭──────────────────────────────────────────╮"
echo "│                                          │"
echo "│   🎨 ArtBot FLUX Image Generator 🎨     │"
echo "│                                          │"
echo "╰──────────────────────────────────────────╯"
echo -e "${NC}"

# Print description
echo -e "${CYAN}Generate conceptually rich, cinematic images using the FLUX model${NC}"
echo -e "${CYAN}Creates images with film-like quality and night-time aesthetics${NC}"
echo -e "${CYAN}Powered by Replicate's adirik/flux-cinestill model${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found. Please create one based on .env.example${NC}"
  exit 1
fi

# Check if REPLICATE_API_KEY is set in .env
if ! grep -q "REPLICATE_API_KEY=" .env; then
  echo -e "${RED}Error: REPLICATE_API_KEY not found in .env file${NC}"
  echo -e "${YELLOW}Please add your Replicate API key to the .env file:${NC}"
  echo "REPLICATE_API_KEY=your_api_key_here"
  exit 1
fi

# Check if either ANTHROPIC_API_KEY or OPENAI_API_KEY is set in .env
if ! grep -q "ANTHROPIC_API_KEY=" .env && ! grep -q "OPENAI_API_KEY=" .env; then
  echo -e "${RED}Error: Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY found in .env file${NC}"
  echo -e "${YELLOW}Please add at least one of these API keys to the .env file:${NC}"
  echo "ANTHROPIC_API_KEY=your_api_key_here"
  echo "OPENAI_API_KEY=your_api_key_here"
  exit 1
fi

# Display usage if requested
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
  echo -e "${MAGENTA}Usage:${NC}"
  echo -e "  ./run-flux-art-generator.sh [concept] [category]"
  echo ""
  echo -e "${MAGENTA}Examples:${NC}"
  echo -e "  ./run-flux-art-generator.sh \"abandoned cyberpunk arcade\""
  echo -e "  ./run-flux-art-generator.sh \"misty harbor at dawn\" nature"
  echo -e "  ./run-flux-art-generator.sh \"\" cyberpunk"
  echo ""
  echo -e "${MAGENTA}Available Categories:${NC}"
  echo -e "  cinematic   - Film-like scenes with dramatic lighting and composition"
  echo -e "  surreal     - Dreamlike, unexpected concept combinations"
  echo -e "  cyberpunk   - High-tech, dystopian urban environments"
  echo -e "  nature      - Beautiful and dramatic natural environments"
  echo -e "  urban       - City life and architecture"
  echo -e "  abstract    - Non-representational visual concepts"
  echo -e "  nostalgic   - Emotional connections to the past"
  echo -e "  futuristic  - Advanced technological and social developments"
  echo -e "  fantasy     - Magical and mythical scenes"
  echo -e "  dystopian   - Societies and environments in decline"
  echo ""
  echo -e "${MAGENTA}Note:${NC}"
  echo -e "  If no concept is provided, the system will automatically generate a random"
  echo -e "  concept using AI. If no category is specified, a random category will be used."
  echo -e "  Each run will produce a unique concept."
  echo ""
  echo -e "${MAGENTA}Output:${NC}"
  echo -e "  The generator creates several files in the output directory:"
  echo -e "  - flux-[concept].png - The generated image"
  echo -e "  - flux-[concept].txt - The image URL"
  echo -e "  - flux-[concept]-prompt.txt - The prompt and creative process"
  echo -e "  - flux-[concept]-metadata.json - Complete metadata"
  exit 0
fi

# Build the TypeScript code
echo -e "${YELLOW}Building TypeScript code...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
  exit 1
fi

# Run the FLUX art generator
echo -e "${GREEN}Starting FLUX art generator...${NC}"
if [ -z "$1" ]; then
  if [ -z "$2" ]; then
    echo -e "${YELLOW}No concept or category provided. The system will generate a random concept with a random category.${NC}"
  else
    echo -e "${YELLOW}No concept provided. The system will generate a random concept with category: $2${NC}"
  fi
else
  if [ -z "$2" ]; then
    echo -e "${YELLOW}Using provided concept: \"$1\"${NC}"
  else
    echo -e "${YELLOW}Using provided concept: \"$1\" with category: $2${NC}"
  fi
fi
echo -e "${YELLOW}This will generate a conceptually rich prompt and create an image using FLUX${NC}"
echo -e "${YELLOW}The process may take a minute or two to complete${NC}"
echo ""

node dist/generate-art-flux.js "$@"

# Check if the generation was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Image generation failed. Please check the error messages above.${NC}"
  exit 1
fi

echo -e "${BLUE}Done!${NC}"
echo -e "${GREEN}Check the output directory for your generated image and prompt files.${NC}" 