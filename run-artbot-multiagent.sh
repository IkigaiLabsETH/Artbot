#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Display banner
echo -e "${BLUE}"
echo "╭──────────────────────────────────────────────────────────╮"
echo "│                                                          │"
echo "│                 🎨 ArtBot Multi-Agent System             │"
echo "│                                                          │"
echo "╰──────────────────────────────────────────────────────────╯"
echo -e "${NC}"

echo -e "${CYAN}ArtBot is a collaborative multi-agent system for art creation.${NC}"
echo -e "${CYAN}Agents: Director, Ideator, Stylist, Refiner, and Critic${NC}"
echo -e "${CYAN}Each agent specializes in a specific aspect of the creative process.${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found.${NC}"
  echo -e "${YELLOW}Please create a .env file with your API keys.${NC}"
  echo "Example:"
  echo "REPLICATE_API_KEY=your_replicate_api_key"
  echo "ANTHROPIC_API_KEY=your_anthropic_api_key"
  echo "OPENAI_API_KEY=your_openai_api_key"
  exit 1
fi

# Check for required API keys
if ! grep -q "REPLICATE_API_KEY" .env && ! grep -q "ANTHROPIC_API_KEY" .env && ! grep -q "OPENAI_API_KEY" .env; then
  echo -e "${RED}Error: Required API keys not found in .env file.${NC}"
  echo -e "${YELLOW}Please add at least one of the following API keys:${NC}"
  echo "REPLICATE_API_KEY=your_replicate_api_key"
  echo "ANTHROPIC_API_KEY=your_anthropic_api_key"
  echo "OPENAI_API_KEY=your_openai_api_key"
  exit 1
fi

# Help message
function show_help {
  echo -e "${GREEN}Usage:${NC}"
  echo -e "  ./run-artbot-multiagent.sh [options] \"Project Title\" \"Project Description\""
  echo ""
  echo -e "${GREEN}Options:${NC}"
  echo -e "  -h, --help     Show this help message"
  echo -e "  -f, --flux     Use FLUX cinematic image generator"
  echo -e "  -t, --title    Set the project title"
  echo -e "  -d, --description Set the project description"
  echo ""
  echo -e "${GREEN}Examples:${NC}"
  echo -e "  ./run-artbot-multiagent.sh \"Abstract Emotions\" \"A series exploring human emotions through abstract forms\""
  echo -e "  ./run-artbot-multiagent.sh --flux \"Neon Noir\" \"A cyberpunk cityscape with neon lights and rain-slicked streets\""
  echo ""
  echo -e "${YELLOW}Note: The process may take several minutes to complete.${NC}"
  exit 0
}

# Parse command line arguments
USE_FLUX=false
PROJECT_TITLE="Untitled Art Project"
PROJECT_DESCRIPTION="An artistic exploration"

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -f|--flux)
      USE_FLUX=true
      shift
      ;;
    -t|--title)
      if [[ -n "$2" && "$2" != -* ]]; then
        PROJECT_TITLE="$2"
        shift 2
      else
        echo -e "${RED}Error: Argument for $1 is missing${NC}" >&2
        show_help
        exit 1
      fi
      ;;
    -d|--description)
      if [[ -n "$2" && "$2" != -* ]]; then
        PROJECT_DESCRIPTION="$2"
        shift 2
      else
        echo -e "${RED}Error: Argument for $1 is missing${NC}" >&2
        show_help
        exit 1
      fi
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}" >&2
      show_help
      exit 1
      ;;
  esac
done

echo -e "${GREEN}Project Title:${NC} $PROJECT_TITLE"
echo -e "${GREEN}Project Description:${NC} $PROJECT_DESCRIPTION"
if [ "$USE_FLUX" = true ]; then
  echo -e "${GREEN}Using FLUX:${NC} Yes (Cinematic image generation enabled)"
else
  echo -e "${GREEN}Using FLUX:${NC} No (Standard image generation)"
fi
echo ""

# Build TypeScript code
echo -e "${YELLOW}Building TypeScript code...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to build TypeScript code.${NC}"
  exit 1
fi

echo -e "${GREEN}TypeScript build successful.${NC}"
echo ""

# Create a temporary file for the ArtBot script
TEMP_FILE=$(mktemp).mjs
CURRENT_DIR=$(pwd)
# Create a sanitized project title for filenames
SANITIZED_TITLE=$(echo "$PROJECT_TITLE" | tr -cd '[:alnum:][:space:]' | tr '[:space:]' '-' | tr '[:upper:]' '[:lower:]')
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILENAME="${SANITIZED_TITLE}_${TIMESTAMP}"

echo "import { ArtBotMultiAgentSystem } from '${CURRENT_DIR}/dist/artbot-multiagent-system.js';" > $TEMP_FILE
echo "" >> $TEMP_FILE
echo "async function runArtBot() {" >> $TEMP_FILE
echo "  try {" >> $TEMP_FILE
echo "    // Initialize ArtBot" >> $TEMP_FILE
echo "    console.log('Current directory:', process.cwd());" >> $TEMP_FILE
echo "    const outputDir = '${CURRENT_DIR}/output';" >> $TEMP_FILE
echo "    console.log('Output directory:', outputDir);" >> $TEMP_FILE
echo "    const artBot = new ArtBotMultiAgentSystem({" >> $TEMP_FILE
echo "      outputDir: outputDir" >> $TEMP_FILE
echo "    });" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "    await artBot.initialize();" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "    // Run an art project" >> $TEMP_FILE
echo "    const result = await artBot.runArtProject({" >> $TEMP_FILE
echo "      title: \"$PROJECT_TITLE\"," >> $TEMP_FILE
echo "      description: \"$PROJECT_DESCRIPTION\"," >> $TEMP_FILE
echo "      useFlux: $USE_FLUX," >> $TEMP_FILE
echo "      outputFilename: \"$OUTPUT_FILENAME\"" >> $TEMP_FILE
echo "    });" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "    console.log('Art project completed successfully!');" >> $TEMP_FILE
echo "    console.log('Output files are in the output directory.');" >> $TEMP_FILE
echo "    console.log(result);" >> $TEMP_FILE
echo "  } catch (error) {" >> $TEMP_FILE
echo "    console.error('Error running ArtBot:', error);" >> $TEMP_FILE
echo "  }" >> $TEMP_FILE
echo "}" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "runArtBot();" >> $TEMP_FILE

# Run the ArtBot script
echo -e "${BLUE}Starting ArtBot Multi-Agent System...${NC}"
echo -e "${BLUE}Project: ${PROJECT_TITLE}${NC}"
echo -e "${BLUE}Description: ${PROJECT_DESCRIPTION}${NC}"
echo -e "${YELLOW}This process may take several minutes to complete.${NC}"
echo ""

node $TEMP_FILE

# Clean up
rm $TEMP_FILE

echo ""
echo -e "${GREEN}ArtBot process completed.${NC}"
echo -e "${GREEN}Output directory: ${YELLOW}output/${NC}"
echo -e "${GREEN}Generated files include:${NC}"
echo -e "${YELLOW}- Art image${NC}"
echo -e "${YELLOW}- Project metadata${NC}"
echo -e "${YELLOW}- Agent collaboration logs${NC}"

# Find and display the most recent image file
if [ -d "output" ]; then
  # Find the most recently modified image file
  LATEST_IMAGE=$(find output -type f -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | sort -r | head -n 1)
  
  if [ -n "$LATEST_IMAGE" ]; then
    echo ""
    echo -e "${GREEN}Latest generated artwork:${NC}"
    echo -e "${YELLOW}$LATEST_IMAGE${NC}"
    
    # Try to open the image file with the default application
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      open "$LATEST_IMAGE" 2>/dev/null || echo -e "${YELLOW}Image file created but could not be opened automatically.${NC}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      # Linux
      xdg-open "$LATEST_IMAGE" 2>/dev/null || echo -e "${YELLOW}Image file created but could not be opened automatically.${NC}"
    else
      echo -e "${YELLOW}Image file created. Please open it manually.${NC}"
    fi
  else
    echo ""
    echo -e "${YELLOW}No image files found in the output directory.${NC}"
    echo -e "${YELLOW}This might be because:${NC}"
    echo -e "${YELLOW}1. The image generation process failed${NC}"
    echo -e "${YELLOW}2. The image is still being generated${NC}"
    echo -e "${YELLOW}3. The image was saved with a different extension${NC}"
  fi
else
  echo ""
  echo -e "${YELLOW}Output directory not found. No artwork was generated.${NC}"
fi 