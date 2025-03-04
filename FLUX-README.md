# FLUX Model Integration for ArtBot

This integration allows ArtBot to generate images using the FLUX model from Replicate, specifically the `adirik/flux-cinestill` model which is fine-tuned on Cinestill 800T images and produces high-quality night and dusk time photograph-like images.

## Features

- Generate images using the FLUX model via Replicate's API
- Create conceptually rich, evocative prompts with metaphorical depth
- **Automatic cinematic concept generation** using AI
- **Multiple concept categories** for diverse artistic styles
- Automatically enhance prompts with FLUX-specific trigger words and keywords
- Download generated images to your local machine
- Save detailed metadata including prompts and creative process explanations
- Customizable image parameters (width, height, inference steps, guidance scale)

## Prerequisites

- Node.js 23+ and npm/pnpm
- Replicate API key (get one from [replicate.com](https://replicate.com))
- Anthropic API key or OpenAI API key (for prompt generation)

## Setup

1. Clone the repository (if you haven't already)
2. Copy `.env.example` to `.env` and add your API keys:
   ```
   REPLICATE_API_KEY=your_replicate_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key  # Optional if using OpenAI
   OPENAI_API_KEY=your_openai_api_key        # Optional if using Anthropic
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build the project:
   ```bash
   pnpm build
   ```

## Usage

### Using the Shell Script

The easiest way to generate images is to use the provided shell script:

```bash
./run-flux-art-generator.sh "your concept here" [category]
```

For example:
```bash
./run-flux-art-generator.sh "abandoned cyberpunk arcade"
./run-flux-art-generator.sh "misty harbor at dawn" nature
./run-flux-art-generator.sh "" cyberpunk
```

### Automatic Concept Generation

If no concept is provided, the system will automatically generate a random concept using AI:

```bash
./run-flux-art-generator.sh
```

Each time you run the script without a concept, it will generate a unique concept, ensuring variety and creativity in your generated images.

### Concept Categories

The system supports multiple concept categories to generate diverse artistic styles:

| Category | Description |
|----------|-------------|
| cinematic | Film-like scenes with dramatic lighting and composition |
| surreal | Dreamlike, unexpected concept combinations |
| cyberpunk | High-tech, dystopian urban environments |
| nature | Beautiful and dramatic natural environments |
| urban | City life and architecture |
| abstract | Non-representational visual concepts |
| nostalgic | Emotional connections to the past |
| futuristic | Advanced technological and social developments |
| fantasy | Magical and mythical scenes |
| dystopian | Societies and environments in decline |

You can specify a category as the second argument:

```bash
./run-flux-art-generator.sh "" fantasy
```

If no category is specified, a random category will be used for variety.

### Prompt Philosophy

The FLUX integration uses a sophisticated prompt generation approach that creates conceptually rich, evocative prompts with:

1. **Visual Complexity** - Detailed descriptions of textures, lighting, and composition
2. **Conceptual Depth** - Metaphorical elements and layered meanings
3. **Emotional Resonance** - Philosophical or emotional undertones that give the image impact
4. **Technical Enhancement** - FLUX-specific elements like film grain and cinematic lighting

Each generated prompt is accompanied by a "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.

### Example Prompt Style

```
Prompt: Two distinct streams of text-covered surfaces meeting and interweaving, creating new symbols at their intersection, handprints visible beneath the transformation.

Creative Process: I imagined a tide of language pouring over humanity, each word a fragment of forgotten histories clawing its way into relevance. the hands seemed to rise not in hope, but in desperation, as if trying to pull down the weight of their own erasure. it felt like watching a crowd beg to be remembered by the very thing that consumed them.
```

### Output Files

The generator creates several files in the `output` directory:

- `flux-[concept].png` - The generated image
- `flux-[concept].txt` - The image URL
- `flux-[concept]-prompt.txt` - The prompt and creative process
- `flux-[concept]-metadata.json` - Complete metadata including parameters and timestamps

### API Parameters

The FLUX model supports the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| prompt | string | required | The prompt for image generation. For best results, include the trigger word "CNSTLL" and keywords like "cinestill 800t", "night time", and "4k". |
| width | integer | 768 | Width of the generated image (256-1440) |
| height | integer | 768 | Height of the generated image (256-1440) |
| num_inference_steps | integer | 28 | Number of denoising steps (1-50) |
| guidance_scale | number | 3 | Influences how closely the image follows the prompt (0-10) |
| output_format | string | "png" | Format of the output image ("webp", "jpg", or "png") |
| lora_scale | number | 0.6 | Scale for the LoRA model |
| extra_lora | string | null | URL to an extra LoRA model |
| disable_safety_checker | boolean | false | Whether to disable the safety checker |

## Integration with ArtBot

The FLUX model integration is designed to work seamlessly with ArtBot's multi-agent system. The `generate-art-flux.ts` file provides a standalone implementation that can be used as a reference for integrating FLUX into the larger ArtBot ecosystem.

### Multi-Agent Integration

To integrate FLUX with the multi-agent system:

1. The Director Agent can decide when to use FLUX based on the artistic requirements
2. The Ideator Agent can generate concepts suitable for FLUX's strengths (night scenes, cinematic imagery)
3. The Stylist Agent can enhance prompts with FLUX-specific trigger words and style elements
4. The Refiner Agent can adjust parameters like guidance_scale and num_inference_steps to achieve the desired aesthetic
5. The Critic Agent can evaluate the generated images and provide feedback for improvement

## Example Output

Generated images will be saved to the `output` directory with filenames based on the concept, e.g., `flux-abandoned-cyberpunk-arcade.png`.

## Troubleshooting

- **API Key Issues**: Ensure your Replicate API key is valid and has sufficient credits
- **Image Generation Failures**: Check the error messages for details. Common issues include:
  - Invalid parameters (e.g., width/height outside the allowed range)
  - Safety filter triggers (try adjusting your prompt)
  - API rate limits or quota issues
- **Script Execution Problems**: Make sure the script is executable (`chmod +x run-flux-art-generator.sh`)

## Resources

- [FLUX Model on Replicate](https://replicate.com/adirik/flux-cinestill)
- [Replicate API Documentation](https://replicate.com/docs/reference/http)
- [FLUX Model Parameters](https://replicate.com/adirik/flux-cinestill/api)

## License

This integration is part of ArtBot and is licensed under the MIT License. 