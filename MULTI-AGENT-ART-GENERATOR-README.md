# ArtBot Multi-Agent Art Generator

```
    ╭──────────────────────╮
    │       ARTBOT         │
    │    ┌──────────┐     │
    │    │ 🎨 AI    │     │
    │    └──────────┘     │
    │  Creative Partner    │
    ╰──────────────────────╯
```

## Overview

The ArtBot Multi-Agent Art Generator is a sophisticated system that uses a collaborative multi-agent approach to create unique, conceptually rich artwork. Drawing inspiration from René Magritte's surrealist style, the system generates evocative images with philosophical depth and visual intrigue.

## How It Works

The art generation process involves multiple specialized AI agents working together:

1. **Director Agent**: Coordinates the creative process and manages workflow
2. **Ideator Agent**: Generates creative ideas based on the concept
3. **Stylist Agent**: Develops artistic styles based on the generated ideas
4. **Refiner Agent**: Creates the final artwork using the FLUX image generation model
5. **Critic Agent**: Evaluates and provides feedback on the artwork

## Prerequisites

Before using the Multi-Agent Art Generator, ensure you have:

- Node.js 23+ installed
- TypeScript installed (`npm install -g typescript`)
- API keys for:
  - Anthropic Claude or OpenAI (for AI reasoning)
  - Replicate (for image generation)

## Setup

1. Create a `.env` file in the root directory with your API keys:

```env
# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_KEY=your_replicate_api_key

# Storage
STORAGE_PATH=.artbot

# Image Generation
DEFAULT_IMAGE_MODEL=black-forest-labs/flux-1.1-pro
IMAGE_WIDTH=1024
IMAGE_HEIGHT=1024
```

2. Install dependencies:
```bash
pnpm install
```

## Running the Art Generator

We provide two scripts for running the art generator:

### Standard Version (Anthropic Primary)

```bash
./run-multiagent-art-generator.sh "Your concept here"
```

This script uses Anthropic Claude as the primary AI provider with retry logic for handling API overload errors.

### OpenAI Primary Version

```bash
./run-multiagent-art-generator-openai.sh "Your concept here"
```

This script uses OpenAI as the primary AI provider, which can be useful when Anthropic's API is experiencing high demand.

### Optional Category Parameter

You can specify an art category as a second parameter:

```bash
./run-multiagent-art-generator.sh "Your concept here" "magritte_surrealism"
```

Available categories include:
- `magritte_surrealism` (default)
- `crypto_art`
- `cyberpunk`
- `solarpunk`
- `cosmic_horror`

## Customizing Art Direction

You can customize the art direction by editing the `art-direction.json` file in the root directory. This file contains specifications for:

- **Style Emphasis**: Specific styles to emphasize
- **Visual Elements**: Required visual elements
- **Color Palette**: Specific color palette to use
- **Composition Guidelines**: Guidelines for composition
- **Mood and Tone**: Overall mood and tone
- **References**: Reference artists or works
- **Avoid Elements**: Elements to avoid

Example:
```json
{
  "styleEmphasis": [
    "Magritte surrealism",
    "cinematic",
    "dramatic lighting"
  ],
  "visualElements": [
    "bowler hats",
    "floating objects",
    "clouds"
  ],
  "colorPalette": [
    "Magritte blues",
    "soft greens",
    "earthy browns"
  ],
  "compositionGuidelines": [
    "rule of thirds",
    "surreal scale relationships"
  ],
  "moodAndTone": "dreamlike and contemplative",
  "references": [
    "René Magritte's 'The Son of Man'"
  ],
  "avoidElements": [
    "text",
    "watermarks"
  ]
}
```

## Output

The art generator creates several files in the `output` directory:

- **Image URL**: A text file containing the URL to view the generated image
- **Prompt**: The detailed prompt used to generate the image
- **Metadata**: A JSON file containing information about the generation process
- **Image File**: The downloaded image (if available)

## Troubleshooting

### API Overload Errors

If you encounter "overloaded" errors from the Anthropic API:

1. Try using the OpenAI primary script: `./run-multiagent-art-generator-openai.sh`
2. Wait a few minutes and try again
3. Check that your API keys are valid and have sufficient quota

### Image Generation Issues

If the image generation fails:

1. Verify your Replicate API key is valid
2. Check that the DEFAULT_IMAGE_MODEL in your .env file is available on Replicate
3. Try a different concept or art direction

## Advanced Configuration

You can modify the following files for advanced customization:

- `src/defaultArtGenerator.ts`: Main art generation logic
- `src/services/multiagent/FluxRefinerAgent.ts`: Image generation agent
- `src/services/ai/index.ts`: AI service configuration
- `src/services/replicate/index.ts`: Image model configuration

After making changes, rebuild the project:

```bash
pnpm build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 