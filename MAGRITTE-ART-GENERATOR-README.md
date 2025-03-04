# Magritte Surrealism Art Generator

```
    ╭──────────────────────╮
    │  MAGRITTE ARTBOT     │
    │    ┌──────────┐     │
    │    │ 🎩 🍎    │     │
    │    └──────────┘     │
    │  Surrealist Partner  │
    ╰──────────────────────╯
```

## Overview

The Magritte Surrealism Art Generator is a specialized version of ArtBot that focuses on creating artwork in the distinctive style of René Magritte, the visionary Belgian surrealist painter. This generator uses a multi-agent system to collaboratively create images that embody Magritte's philosophical approach to surrealism, characterized by visual paradoxes, juxtaposition of ordinary objects in extraordinary contexts, and challenging perceptions through familiar objects in unfamiliar settings.

## Features

- **Magritte-Inspired Concepts**: Generates concepts that reflect Magritte's philosophical approach to surrealism
- **Visual Paradoxes**: Creates images with juxtapositions that challenge logical thinking
- **Distinctive Visual Elements**: Incorporates Magritte's iconic elements like bowler hats, floating objects, clouds, and blue skies
- **Multi-Agent Collaboration**: Uses specialized agents (Director, Ideator, Stylist, Refiner, Critic) to create cohesive artwork
- **Customizable Concepts**: Generate random Magritte-style concepts or provide your own
- **Multiple AI Provider Support**: Run with either Anthropic or OpenAI as the primary AI provider

## Prerequisites

- Node.js 23+ and pnpm
- TypeScript compiler (`tsc`)
- API keys for:
  - Anthropic or OpenAI (for concept generation and agent collaboration)
  - Replicate (for image generation)

## Running the Generator

### Quick Start

```bash
# Make the scripts executable (if not already)
chmod +x run-magritte-art-generator.sh
chmod +x run-magritte-art-generator-openai.sh

# Run with Anthropic as primary AI provider (with a custom concept)
./run-magritte-art-generator.sh "bowler hat floating above ocean"

# Run with OpenAI as primary AI provider (with a custom concept)
./run-magritte-art-generator-openai.sh "bowler hat floating above ocean"

# Or run without a concept to generate a random Magritte-inspired concept
./run-magritte-art-generator.sh
./run-magritte-art-generator-openai.sh
```

### Choosing Between Anthropic and OpenAI

- **Anthropic (Claude)**: Provides more nuanced and philosophically aligned Magritte-style concepts, but may experience overload errors during peak usage times
- **OpenAI (GPT)**: More reliable availability, with slightly different creative interpretations of Magritte's style

If you encounter "overload" errors with the Anthropic API, switch to the OpenAI script.

### Environment Setup

Create a `.env` file in the project root with your API keys:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_KEY=your_replicate_api_key
```

At least one of either `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is required, along with `REPLICATE_API_KEY`.

## Customizing Art Direction

The Magritte style is automatically applied when using the dedicated script, but you can further customize the art direction by editing the `art-direction.json` file. The default Magritte art direction includes:

- **Style Emphasis**: Magritte surrealism, surreal juxtaposition
- **Visual Elements**: Bowler hats, floating objects, clouds, blue skies, impossible scenes
- **Color Palette**: Magritte blues, soft greens, earthy browns
- **Composition**: Surreal scale relationships, clean compositions with clear subjects
- **Mood**: Dreamlike and contemplative with a sense of mystery and philosophical questioning
- **References**: Notable works by René Magritte like "The Son of Man" and "The Empire of Light"

## Examples of Magritte-Inspired Concepts

- "pipe denying its existence"
- "bowler hat floating above sea"
- "window framing interior landscape"
- "stone castle hovering midair"
- "curtained doorway revealing sky"
- "moon eclipsed by leaf"
- "room filled with giant apple"
- "bird transforming into leaf"
- "mirror reflecting impossible view"
- "men in bowler hats raining"
- "clouds inside human silhouette"

## Output

Generated images and metadata are saved in the `output` directory. For each generation, you'll get:

- A PNG image file
- A text file with the prompt used for generation
- Metadata about the creative process

## Troubleshooting

- **API Errors**: 
  - If you encounter Anthropic API overload errors, use the OpenAI-based script instead: `./run-magritte-art-generator-openai.sh`
  - If you see "No AI provider available" errors, check that your API keys are correctly set in the `.env` file
- **Image Generation Issues**: Check your Replicate API key and ensure you have sufficient credits
- **Compilation Errors**: Make sure TypeScript is installed globally or in your project
- **"find: unknown primary" Error**: On macOS, the script may need modification for the `find` command. Edit the script to use `find output -name "flux-*.png" -type f | sort | tail -1` instead

## Advanced Usage

For more advanced customization, you can:

1. Edit the `src/services/ai/conceptGenerator.ts` file to modify the Magritte concept prompts
2. Adjust the `src/defaultArtGenerator.ts` file to change how the Magritte style is applied
3. Create your own art direction JSON file with specific Magritte-inspired elements
4. Set the `USE_OPENAI_PRIMARY=true` environment variable to use OpenAI as the primary AI provider in any script

## Related Documentation

- [ArtBot README](./ARTBOT-README.md) - General information about the ArtBot system
- [Art Direction README](./ART-DIRECTION-README.md) - Details on customizing art direction
- [Multi-Agent System README](./src/services/multiagent/README.md) - Information about the multi-agent architecture 