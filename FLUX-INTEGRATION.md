# FLUX Integration for ArtBot

This document outlines the integration of the FLUX model (`adirik/flux-cinestill`) as the default art generator for ArtBot, along with enhanced conceptually rich prompt generation.

## Overview

The FLUX model is now the default art generator for ArtBot, replacing the previous default model. This integration includes:

1. **Conceptually Rich Prompts**: All prompts are now generated with metaphorical depth, emotional resonance, and visual complexity.
2. **FLUX-Specific Optimizations**: Prompts are automatically enhanced with FLUX-specific trigger words and technical elements.
3. **Creative Process Explanations**: Each generated prompt includes a "Creative Process" explanation that reveals the thinking behind it.
4. **Multi-Agent Integration**: The FLUX model is fully integrated with ArtBot's multi-agent system.

## Using the FLUX Integration

### Basic Usage

To generate art with FLUX, simply run:

```bash
npm run start
```

This will use the default concept "cosmic garden at night". To specify a different concept:

```bash
npm run start "your concept here"
```

### Multi-Agent Demo

To run the multi-agent demo with FLUX:

```bash
npm run demo:flux-multiagent
```

Or use the shell script:

```bash
./run-flux-multiagent-demo.sh "Project Title"
```

## Technical Implementation

The integration includes the following components:

1. **ReplicateService**: Updated to use FLUX as the default model and handle FLUX-specific parameters.
2. **ConceptualPromptGenerator**: A new service that generates conceptually rich prompts with metaphorical depth.
3. **CreativeEngine**: Enhanced with a new `generateConceptualImage` method that uses FLUX.
4. **DefaultArtGenerator**: A new default implementation that uses FLUX with conceptually rich prompts.

## Prompt Philosophy

The FLUX integration uses a sophisticated prompt generation approach that creates conceptually rich, evocative prompts with:

1. **Visual Complexity** - Detailed descriptions of textures, lighting, and composition
2. **Conceptual Depth** - Metaphorical elements and layered meanings
3. **Emotional Resonance** - Philosophical or emotional undertones that give the image impact
4. **Technical Enhancement** - FLUX-specific elements like film grain and cinematic lighting

Each generated prompt is accompanied by a "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.

## Example Prompt Style

```
Prompt: Two distinct streams of text-covered surfaces meeting and interweaving, creating new symbols at their intersection, handprints visible beneath the transformation.

Creative Process: I imagined a tide of language pouring over humanity, each word a fragment of forgotten histories clawing its way into relevance. the hands seemed to rise not in hope, but in desperation, as if trying to pull down the weight of their own erasure. it felt like watching a crowd beg to be remembered by the very thing that consumed them.
```

## Configuration

The FLUX integration can be configured through environment variables:

```
REPLICATE_API_KEY=your_replicate_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key  # Optional if using OpenAI
OPENAI_API_KEY=your_openai_api_key        # Optional if using Anthropic
IMAGE_WIDTH=768                           # Default width for FLUX images
IMAGE_HEIGHT=768                          # Default height for FLUX images
NUM_INFERENCE_STEPS=28                    # Default inference steps for FLUX
GUIDANCE_SCALE=3.0                        # Default guidance scale for FLUX
```

## Output Files

The generator creates several files in the `output` directory:

- `flux-[concept].png` - The generated image
- `flux-[concept].txt` - The image URL
- `flux-[concept]-prompt.txt` - The prompt and creative process
- `flux-[concept]-metadata.json` - Complete metadata including parameters and timestamps

## API Parameters

The FLUX model supports the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| prompt | string | required | The prompt for image generation. For best results, include the trigger word "CNSTLL" and keywords like "cinestill 800t", "night time", and "4k". |
| width | integer | 768 | Width of the generated image (256-1440) |
| height | integer | 768 | Height of the generated image (256-1440) |
| num_inference_steps | integer | 28 | Number of denoising steps (1-50) |
| guidance_scale | number | 3 | Influences how closely the image follows the prompt (0-10) |
| output_format | string | "png" | Format of the output image ("webp", "jpg", or "png") |

## Troubleshooting

- **API Key Issues**: Ensure your Replicate API key is valid and has sufficient credits
- **Image Generation Failures**: Check the error messages for details. Common issues include:
  - Invalid parameters (e.g., width/height outside the allowed range)
  - Safety filter triggers (try adjusting your prompt)
  - API rate limits or quota issues
- **Script Execution Problems**: Make sure the script is executable (`chmod +x run-flux-multiagent-demo.sh`)

## Resources

- [FLUX Model on Replicate](https://replicate.com/adirik/flux-cinestill)
- [Replicate API Documentation](https://replicate.com/docs/reference/http)
- [FLUX Model Parameters](https://replicate.com/adirik/flux-cinestill/api) 