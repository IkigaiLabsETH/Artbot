# ArtBot Multi-Agent Art Generator

## Overview

The ArtBot Multi-Agent Art Generator is a sophisticated system that uses a collaborative multi-agent approach to generate artistic images based on textual concepts. The system leverages multiple specialized AI agents, each responsible for a different aspect of the creative process, to produce high-quality artwork.

## How It Works

The art generation process involves several specialized agents working together:

1. **Director Agent**: Coordinates the creative process and manages the workflow
2. **Ideator Agent**: Generates creative ideas based on the provided concept
3. **Stylist Agent**: Develops artistic styles for the concept
4. **Refiner Agent**: Creates the final artwork using image generation models
5. **Critic Agent**: Provides evaluation and feedback on the generated artwork

## Prerequisites

- Node.js (v23+ recommended)
- TypeScript
- Replicate API key (for image generation)
- Anthropic API key or OpenAI API key (for agent intelligence)

## Setup

1. Clone the repository
2. Create a `.env` file with your API keys:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   OPENAI_API_KEY=your_openai_api_key
   REPLICATE_API_KEY=your_replicate_api_key
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Compile the TypeScript code:
   ```
   tsc
   ```

## Running the Art Generator

Use the provided script to run the art generator:

```bash
./run-multiagent-art-generator.sh "Your concept here" [category]
```

For example:
```bash
./run-multiagent-art-generator.sh "A tranquil lake at sunset with mountains in the background" impressionist
```

### Available Categories

The art generator supports the following artistic categories:

- `magritte_surrealism` (default): René Magritte's surrealist style with clean compositions and philosophical questioning
- `impressionist`: Impressionist style with visible brushstrokes, emphasis on light, and everyday subject matter
- `cinematic`: Cinematic style with dramatic lighting and composition
- `surreal`: General surrealist style with dreamlike and fantastical elements
- `cyberpunk`: Futuristic cyberpunk aesthetic with neon lights and high-tech elements
- `nature`: Natural landscapes and scenes with emphasis on organic elements
- `urban`: Urban environments and cityscapes
- `abstract`: Abstract art with non-representational elements
- `nostalgic`: Nostalgic scenes with a sense of memory and emotion
- `futuristic`: Forward-looking scenes with advanced technology
- `fantasy`: Fantasy worlds and mythical elements
- `dystopian`: Dark and gritty dystopian environments
- `crypto_art`: Crypto-native visual elements and aesthetics

Each category applies specific art direction elements to guide the generation process, including style emphasis, visual elements, color palette, composition guidelines, mood and tone, references, and elements to avoid.

## Customizing Art Direction

You can customize the art direction by creating an `art-direction.json` file in the root directory. This file allows you to specify various aspects of the artistic style:

```json
{
  "styleEmphasis": ["cinematic", "dramatic lighting", "film grain"],
  "visualElements": ["reflective surfaces", "visual paradoxes", "windows and frames"],
  "colorPalette": ["rich blues", "deep reds", "golden highlights"],
  "compositionGuidelines": ["rule of thirds", "leading lines", "depth of field"],
  "moodAndTone": "dreamlike and contemplative with a sense of mystery",
  "references": ["Roger Deakins cinematography", "Gregory Crewdson photography"],
  "avoidElements": ["text", "watermarks", "distorted faces"]
}
```

The system will merge your custom art direction with the category-specific art direction, with category-specific elements taking precedence.

## Output

The art generator produces several output files:

- `output/flux-[concept].png`: The generated image
- `output/flux-[concept].txt`: The URL to the generated image
- `output/flux-[concept]-prompt.txt`: The prompt used to generate the image
- `output/flux-[concept]-metadata.json`: Metadata about the generated image

## Troubleshooting

### API Key Issues

If you encounter issues with API keys, make sure they are correctly set in your `.env` file or as environment variables.

### Image Generation Failures

If the image generation fails, check the following:
- Ensure your Replicate API key is valid and has sufficient credits
- Check your internet connection
- Try a different concept or category

### API Overload

If you receive errors about API rate limits or overload:
- Wait a few minutes before trying again
- Consider using a different API key
- Reduce the frequency of requests

## Advanced Configuration

Advanced users can modify the source code to customize the art generation process further:

- `src/defaultArtGenerator.ts`: Main entry point for the art generator
- `src/services/ai/conceptGenerator.ts`: Handles concept generation and categories
- `src/artbot-multiagent-system.ts`: Implements the multi-agent collaboration system

## License

This project is licensed under the MIT License - see the LICENSE file for details. 