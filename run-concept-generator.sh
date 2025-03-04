#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Print banner
echo -e "${BOLD}${MAGENTA}"
echo "╭──────────────────────────────────────────╮"
echo "│                                          │"
echo "│         🎨 ArtBot Concept Generator      │"
echo "│                                          │"
echo "╰──────────────────────────────────────────╯"
echo -e "${RESET}"

echo -e "${CYAN}Generate unique concept ideas for art creation${RESET}"
echo -e "${CYAN}Powered by ArtBot's Creative Intelligence${RESET}\n"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: .env file not found. Creating a sample .env file.${RESET}"
  echo "# API Keys for ArtBot" > .env
  echo "ANTHROPIC_API_KEY=" >> .env
  echo "OPENAI_API_KEY=" >> .env
  echo -e "${YELLOW}Please edit the .env file to add your API keys.${RESET}\n"
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed. Please install Node.js to use this script.${RESET}"
  exit 1
fi

# Display usage information
echo -e "${BOLD}Usage:${RESET}"
echo -e "  ${YELLOW}./run-concept-generator.sh [category] [count]${RESET}\n"

echo -e "${BOLD}Available Categories:${RESET}"
echo -e "  ${CYAN}cinematic${RESET}   - Film-inspired scenes with dramatic lighting and composition"
echo -e "  ${CYAN}surreal${RESET}     - Dreamlike, impossible scenes that challenge reality"
echo -e "  ${CYAN}cyberpunk${RESET}   - High-tech, low-life futuristic urban environments"
echo -e "  ${CYAN}nature${RESET}      - Natural landscapes and phenomena with dramatic elements"
echo -e "  ${CYAN}urban${RESET}       - City scenes capturing the essence of metropolitan life"
echo -e "  ${CYAN}abstract${RESET}    - Non-representational compositions focusing on color and form"
echo -e "  ${CYAN}nostalgic${RESET}   - Scenes evoking emotional connections to the past"
echo -e "  ${CYAN}futuristic${RESET}  - Forward-looking visions of technology and society"
echo -e "  ${CYAN}fantasy${RESET}     - Magical and mythical scenes from imaginary worlds"
echo -e "  ${CYAN}dystopian${RESET}   - Post-apocalyptic or troubled future scenarios\n"

echo -e "${BOLD}Examples:${RESET}"
echo -e "  ${YELLOW}./run-concept-generator.sh${RESET}               - Generate 5 concepts for each category"
echo -e "  ${YELLOW}./run-concept-generator.sh cyberpunk${RESET}     - Generate 5 cyberpunk concepts"
echo -e "  ${YELLOW}./run-concept-generator.sh fantasy 10${RESET}    - Generate 10 fantasy concepts\n"

# Run the concept generator
echo -e "${BOLD}Running Concept Generator...${RESET}\n"

# Create output directory if it doesn't exist
mkdir -p output

# Run the script with Node.js
node --experimental-modules --es-module-specifier-resolution=node generate-concept-ideas.js "$@"

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✅ Concept generation completed successfully!${RESET}"
  echo -e "${CYAN}Generated concepts are saved in the output directory.${RESET}"
else
  echo -e "\n${RED}❌ Error: Concept generation failed.${RESET}"
  echo -e "${YELLOW}Please check your API keys and try again.${RESET}"
fi 