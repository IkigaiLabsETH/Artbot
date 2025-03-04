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
echo "│   🤖 ArtBot Multi-Agent System 🎨                    │"
echo "│                                                      │"
echo "╰──────────────────────────────────────────────────────╯"
echo -e "${NC}"

# Print description
echo -e "${CYAN}A collaborative art creation system using specialized agent roles:${NC}"
echo -e "${YELLOW}🎬 Director Agent${NC} - Coordinates the creative process"
echo -e "${YELLOW}💡 Ideator Agent${NC} - Generates creative ideas"
echo -e "${YELLOW}🎨 Stylist Agent${NC} - Develops artistic styles"
echo -e "${YELLOW}✨ Refiner Agent${NC} - Creates prompts and generates artwork"
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
  echo -e "  ./run-artbot-multiagent.sh [project_title] [project_description]"
  echo ""
  echo -e "${MAGENTA}Examples:${NC}"
  echo -e "  ./run-artbot-multiagent.sh \"Cosmic Garden\" \"A surreal garden with cosmic elements\""
  echo -e "  ./run-artbot-multiagent.sh \"Digital Solitude\" \"Exploring isolation in the digital age\""
  echo ""
  echo -e "${MAGENTA}Output:${NC}"
  echo -e "  The script creates several files in the output directory:"
  echo -e "  - [project-title]-project.json - Complete project data"
  echo -e "  - [project-title].png - The generated image"
  exit 0
fi

# Get project title and description from arguments or use defaults
PROJECT_TITLE="${1:-"Cosmic Garden"}"
PROJECT_DESCRIPTION="${2:-"A surreal garden with cosmic elements and ethereal lighting"}"

# Build the TypeScript code
echo -e "${YELLOW}Building TypeScript code...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
  exit 1
fi

# Create a temporary directory to run the script with proper module settings
TMP_DIR=$(mktemp -d)

# Copy the dist directory to the temporary directory
if [ -d "dist" ]; then
  cp -r dist "$TMP_DIR/"
else
  echo -e "${RED}Error: dist directory not found. Build may have failed.${NC}"
  rm -rf "$TMP_DIR"
  exit 1
fi

# Copy the .env file to the temporary directory
cp .env "$TMP_DIR/"

# Copy node_modules to the temporary directory
if [ -d "node_modules" ]; then
  echo -e "${YELLOW}Copying dependencies...${NC}"
  cp -r node_modules "$TMP_DIR/"
else
  echo -e "${YELLOW}Installing dependencies in temporary directory...${NC}"
  # Copy package.json and package-lock.json to ensure correct dependencies
  cp package.json "$TMP_DIR/" 2>/dev/null || true
  cp package-lock.json "$TMP_DIR/" 2>/dev/null || true
  cp npm-shrinkwrap.json "$TMP_DIR/" 2>/dev/null || true
  
  # Install dependencies in the temporary directory
  (cd "$TMP_DIR" && npm install --quiet)
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Trying minimal install...${NC}"
    (cd "$TMP_DIR" && npm install --quiet dotenv axios uuid)
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install minimal dependencies. Exiting.${NC}"
      rm -rf "$TMP_DIR"
      exit 1
    fi
  fi
fi

# Create a temporary file for the ArtBot script
cat > "$TMP_DIR/run.js" <<EOL
// Ensure this file is treated as an ES module
import { ArtBotMultiAgentSystem } from './dist/artbot-multiagent-system.js';

async function runArtBot() {
  try {
    // Initialize ArtBot
    const artBot = new ArtBotMultiAgentSystem();
    await artBot.initialize();
    
    // Create an art project
    const project = {
      title: "${PROJECT_TITLE}",
      description: "${PROJECT_DESCRIPTION}",
      requirements: [
        "Create a visually striking image with depth and atmosphere",
        "Incorporate elements of surrealism and fantasy",
        "Use a rich color palette with strong contrast",
        "Include subtle symbolic elements",
        "Evoke a sense of wonder and curiosity"
      ]
    };
    
    // Run the project
    await artBot.createArtProject(project);
    
    console.log('✅ ArtBot project completed successfully!');
  } catch (error) {
    console.error('Error running ArtBot:', error);
  }
}

runArtBot().catch(console.error);
EOL

# Create a package.json file to specify type=module
cat > "$TMP_DIR/package.json" <<EOL
{
  "type": "module",
  "dependencies": {
    "dotenv": "^16.0.0",
    "axios": "^1.0.0",
    "uuid": "^9.0.0"
  }
}
EOL

# Run the ArtBot script
echo -e "${GREEN}Starting ArtBot multi-agent system...${NC}"
echo -e "${YELLOW}Project: ${PROJECT_TITLE}${NC}"
echo -e "${YELLOW}Description: ${PROJECT_DESCRIPTION}${NC}"
echo -e "${YELLOW}This will run a complete art creation process with multiple agents${NC}"
echo -e "${YELLOW}The process may take several minutes to complete${NC}"
echo ""

# Run the script from the temporary directory
(cd "$TMP_DIR" && node run.js)

# Check if the script was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}ArtBot multi-agent system failed. Please check the error messages above.${NC}"
  rm -rf "$TMP_DIR"
  exit 1
fi

# Copy any output files back to the current directory if needed
if [ -d "$TMP_DIR/output" ]; then
  mkdir -p output
  cp -r "$TMP_DIR/output/"* output/ 2>/dev/null || true
fi

# Clean up
rm -rf "$TMP_DIR"

echo -e "${BLUE}Done!${NC}"
echo -e "${GREEN}Check the output directory for your generated image and project files.${NC}" 