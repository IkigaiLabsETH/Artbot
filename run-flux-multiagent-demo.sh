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
echo "╭──────────────────────────────────────────────────────╮"
echo "│                                                      │"
echo "│   🤖 ArtBot Multi-Agent System with FLUX Model 🎨   │"
echo "│                                                      │"
echo "╰──────────────────────────────────────────────────────╯"
echo -e "${NC}"

# Print description
echo -e "${CYAN}A collaborative art creation system using specialized agent roles:${NC}"
echo -e "${YELLOW}🎬 Director Agent${NC} - Coordinates the creative process"
echo -e "${YELLOW}💡 Ideator Agent${NC} - Generates creative ideas"
echo -e "${YELLOW}🎨 Stylist Agent${NC} - Develops artistic styles"
echo -e "${YELLOW}✨ Refiner Agent${NC} - Creates prompts and generates artwork with FLUX"
echo -e "${YELLOW}🔍 Critic Agent${NC} - Evaluates and provides feedback"
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
  echo -e "  ./run-flux-multiagent-demo.sh [project_title]"
  echo ""
  echo -e "${MAGENTA}Examples:${NC}"
  echo -e "  ./run-flux-multiagent-demo.sh \"Nocturnal Reflections\""
  echo -e "  ./run-flux-multiagent-demo.sh \"Digital Solitude\""
  echo ""
  echo -e "${MAGENTA}Output:${NC}"
  echo -e "  The demo creates several files in the output directory:"
  echo -e "  - [project-title]-project.json - Complete project data"
  echo -e "  - [concept-name].png - The generated image"
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

# Run the FLUX multi-agent demo
echo -e "${GREEN}Starting FLUX multi-agent demo...${NC}"
echo -e "${YELLOW}This will run a complete art creation process with multiple agents${NC}"
echo -e "${YELLOW}The process may take several minutes to complete${NC}"
echo ""

# Set output format to PNG
export OUTPUT_FORMAT="png"
echo -e "${GREEN}Output format: ${OUTPUT_FORMAT}${NC}"

node dist/demo-flux-multiagent.js "$@"

# Check if the demo was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Multi-agent demo failed. Please check the error messages above.${NC}"
  exit 1
fi

echo -e "${BLUE}Done!${NC}"
echo -e "${GREEN}Check the output directory for your generated image and project files.${NC}" 