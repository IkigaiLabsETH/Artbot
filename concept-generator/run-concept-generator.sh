#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "
    ╭──────────────────────╮
    │       ARTBOT         │
    │    ┌──────────┐     │
    │    │ 🎨 AI    │     │
    │    └──────────┘     │
    │  Creative Partner    │
    ╰──────────────────────╯
"

echo -e "${CYAN}ArtBot Concept Generator${NC}"
echo -e "Generate unique concept ideas for creative projects\n"

# Check if .env file exists
if [ ! -f .env ] && [ ! -f ../.env ]; then
    echo -e "${RED}Error: .env file not found.${NC}"
    echo -e "Please create a .env file with your API keys."
    echo -e "Example:"
    echo -e "ANTHROPIC_API_KEY=your_api_key"
    echo -e "OPENAI_API_KEY=your_api_key"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "Please install Node.js to use this script."
    echo -e "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Function to display usage information
usage() {
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./run-concept-generator.sh [category] [count]"
    echo -e ""
    echo -e "${YELLOW}Categories:${NC}"
    echo -e "  all         - Generate concepts for all categories"
    echo -e "  cinematic   - Film-inspired scenes with dramatic lighting"
    echo -e "  surreal     - Dreamlike, impossible scenes"
    echo -e "  cyberpunk   - High-tech, low-life futuristic environments"
    echo -e "  nature      - Natural landscapes and phenomena"
    echo -e "  urban       - City scenes capturing metropolitan life"
    echo -e "  abstract    - Non-representational compositions"
    echo -e "  nostalgic   - Scenes evoking emotional connections to the past"
    echo -e "  futuristic  - Forward-looking visions of technology"
    echo -e "  fantasy     - Magical and mythical scenes"
    echo -e "  dystopian   - Post-apocalyptic or troubled future scenarios"
    echo -e ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ./run-concept-generator.sh                  - Generate 5 concepts for each category"
    echo -e "  ./run-concept-generator.sh cyberpunk        - Generate 5 cyberpunk concepts"
    echo -e "  ./run-concept-generator.sh fantasy 10       - Generate 10 fantasy concepts"
    echo -e "  ./run-concept-generator.sh all 3            - Generate 3 concepts for each category"
    echo -e ""
}

# Display usage if help flag is provided
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    usage
    exit 0
fi

# Run the concept generator
echo -e "Running concept generator..."
echo -e "${CYAN}🎨 ArtBot Concept Generator${NC}"
echo -e "---------------------------"

# Handle the 'all' category specially
if [ "$1" == "all" ]; then
    count=${2:-5}
    categories=("cinematic" "surreal" "cyberpunk" "nature" "urban" "abstract" "nostalgic" "futuristic" "fantasy" "dystopian")
    
    for category in "${categories[@]}"; do
        echo -e "\n${YELLOW}Category: ${category}${NC}"
        node generate-concept-ideas.js "$category" "$count"
    done
else
    # Run with provided arguments or defaults
    node generate-concept-ideas.js "$@"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Concept generation completed successfully!${NC}"
    echo -e "Generated concepts have been saved to the output directory."
else
    echo -e "${RED}Concept generation failed.${NC}"
    echo -e "Please check the error messages above."
    exit 1
fi 