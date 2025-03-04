# Multi-Agent Art Generator

This system uses a collaborative multi-agent approach to generate art, leveraging specialized agents that work together in a structured workflow.

## Overview

The Multi-Agent Art Generator replaces the previous single-agent approach with a more sophisticated system where multiple specialized agents collaborate to create artwork:

1. **Director Agent**: Coordinates the creative process and manages workflow
2. **Ideator Agent**: Generates creative ideas based on project requirements
3. **Stylist Agent**: Develops artistic styles based on generated ideas
4. **Refiner Agent**: Refines and improves artwork based on selected styles
5. **Critic Agent**: Evaluates and provides feedback on artwork

## Getting Started

### Prerequisites

- Node.js 23+ and npm/pnpm
- TypeScript
- API keys for Anthropic, OpenAI, and Replicate

### Running the Multi-Agent Art Generator

Use the provided script to compile and run the multi-agent art generator:

```bash
# Make the script executable (if not already)
chmod +x run-multiagent-art-generator.sh

# Run with a specific concept
./run-multiagent-art-generator.sh "Cybernetic forest at dawn"

# Run with a specific concept and category
./run-multiagent-art-generator.sh "Crypto revolution" "crypto_art"

# Run with a random concept
./run-multiagent-art-generator.sh
```

## Art Direction

The Multi-Agent Art Generator supports detailed art direction through the `art-direction.json` file. See the [Art Direction README](ART-DIRECTION-README.md) for details on how to customize the artistic style, composition, color palette, and more.

## How It Works

The multi-agent system follows a structured workflow:

1. **Planning Stage**: The Director Agent assigns the Ideator Agent to generate creative ideas based on the concept.
2. **Styling Stage**: The Director Agent passes the ideas to the Stylist Agent to develop a cohesive artistic style.
3. **Refinement Stage**: The Director Agent passes the style to the Refiner Agent to create the final artwork.
4. **Critique Stage**: The Director Agent passes the artwork to the Critic Agent for evaluation and feedback.
5. **Completion**: The Director Agent collects all results and completes the project.

## Output

The Multi-Agent Art Generator produces the following outputs:

- **Image URL**: A URL to the generated image
- **Prompt**: The prompt used to generate the image
- **Creative Process**: A description of the creative process
- **Metadata**: Detailed information about the generation process, including:
  - Concept
  - Prompt
  - Creative process
  - Image URL
  - Timestamp
  - Art direction
  - Critique
  - Multi-agent collaboration details

## Advantages Over Single-Agent Approach

The multi-agent approach offers several advantages:

1. **Specialized Expertise**: Each agent focuses on a specific aspect of the creative process
2. **Improved Quality**: More refined and thoughtful art generation
3. **Better Feedback**: Includes evaluation and feedback from the Critic Agent
4. **Enhanced Collaboration**: Mimics a real creative team
5. **More Detailed Output**: Provides more information about the creative process

## Troubleshooting

If you encounter issues:

1. **Compilation Errors**: Make sure TypeScript is installed and your code is valid
2. **API Key Errors**: Check that your API keys are correctly set in the `.env` file
3. **Runtime Errors**: Check the console output for error messages
4. **No Multi-Agent Output**: Make sure you're using the `run-multiagent-art-generator.sh` script, which compiles the code before running it

## Examples

### Basic Usage

```bash
./run-multiagent-art-generator.sh "Quantum computing visualization"
```

### With Category

```bash
./run-multiagent-art-generator.sh "Digital identity in the blockchain era" "crypto_art"
```

### With Art Direction

1. Edit the `art-direction.json` file to customize the art direction
2. Run the generator:

```bash
./run-multiagent-art-generator.sh "Cyberpunk cityscape"
``` 