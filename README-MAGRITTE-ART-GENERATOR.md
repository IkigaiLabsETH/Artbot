# Margritte-Inspired Art Generator

```
    ╭──────────────────────╮
    │       ARTBOT         │
    │    ┌──────────┐     │
    │    │ 🎨 AI    │     │
    │    └──────────┘     │
    │  Margritte Specialist │
    ╰──────────────────────╯
```

## Overview

This art generator specializes in creating images inspired by the surrealist works of Studio Margritte, the Belgian surrealist painter known for his thought-provoking and conceptually paradoxical images. The system uses a multi-agent approach to generate artwork that captures the essence of Margritte's distinctive style and philosophical approach to art, with a focus on producing images that look and feel like traditional oil paintings rather than photorealistic images.

## Features

- **Multi-Agent System**: Collaborative creation through specialized agent roles
- **Margritte-Specific Categories**: Generate art in various Margritte-inspired styles
- **Traditional Painting Aesthetics**: Outputs that emulate oil painting techniques with visible brushstrokes and canvas texture
- **Concept-to-Painting Pipeline**: From text concepts to finished artwork in Margritte's distinctive painting style

## Painterly Qualities

The art generator emphasizes the following painterly qualities in all generated images:

- **Oil Painting Techniques**: Visible brushstrokes and traditional painting textures
- **Canvas-Like Texture**: The distinctive texture of paint on canvas
- **Non-Photorealistic Rendering**: Avoidance of photorealistic elements in favor of traditional painting aesthetics
- **Margritte's Color Palette**: The distinctive color choices and mixing techniques used by Margritte
- **Traditional Composition**: Composition approaches typical of traditional painting rather than photography

## Margritte Style Categories

The art generator supports the following Margritte-inspired categories:

| Category | Description | Example Elements |
|----------|-------------|-----------------|
| `Margritte_classic` | Classic Margritte style with bowler hats, clouds, and clean compositions | Bowler hats, clouds, pipes, apples |
| `Margritte_empire_of_light` | Day/night juxtaposition inspired by "The Empire of Light" series | Daylight sky above nighttime street |
| `Margritte_objects` | Ordinary objects in extraordinary contexts | Room filled with giant apple, rose suspended in wine glass |
| `Margritte_wordplay` | Visual-verbal paradoxes inspired by "The Treachery of Images" | Pipe denying its existence, apple labeled as landscape |
| `Margritte_windows` | Window frames and framing devices like "The Human Condition" | Window framing interior landscape, canvas continuing view beyond |
| `Margritte_scale` | Surreal scale relationships like "Personal Values" | Comb larger than bedroom, apple filling entire room |
| `Margritte_metamorphosis` | Transformations and hybrid forms | Bird transforming into leaf, human face becoming sky |
| `Margritte_mystery` | Mysterious and enigmatic scenes with hidden faces | Face wrapped in white cloth, lovers with veiled heads |
| `Margritte_skies` | Margritte's distinctive cloud-filled blue skies | Dove made of blue sky, sky fragments in broken mirror |
| `Margritte_silhouettes` | Silhouette figures like in "The Schoolmaster" | Silhouette filled with night sky, man-shaped void in wall |
| `Margritte_mirrors` | Mirror and reflection themes | Mirror reflecting impossible view, reflection showing different scene |
| `Margritte_surrealism` | General Margritte surrealist style (default) | Combination of various Margritte elements |

## Usage

To generate Margritte-inspired artwork, use the following command:

```bash
./run-multiagent-art-generator.sh "Your concept here" [category]
```

Where:
- `"Your concept here"` is your artistic concept (required)
- `[category]` is one of the Margritte style categories listed above (optional, defaults to `Margritte_surrealism`)

### Examples

```bash
# Generate art with the default Margritte surrealism style
./run-multiagent-art-generator.sh "Bowler hat floating above sea"

# Generate art with the Empire of Light style
./run-multiagent-art-generator.sh "House at twilight" Margritte_empire_of_light

# Generate art with the Objects style
./run-multiagent-art-generator.sh "Giant apple filling a room" Margritte_scale

# Generate art with the Windows style
./run-multiagent-art-generator.sh "A window revealing an impossible scene" Margritte_windows
```

## System Architecture

The art generation process involves several specialized agents working together:

1. **Director Agent**: Coordinates the creative process and manages workflow
2. **Ideator Agent**: Generates creative ideas based on the concept
3. **Stylist Agent**: Develops artistic styles based on the concept and category
4. **Refiner Agent**: Creates the final artwork using FLUX, emphasizing traditional painting aesthetics
5. **Critic Agent**: Provides evaluation and feedback

## Output

The art generator produces the following outputs in the `output` directory:

- **Image file**: PNG format (`flux-[concept].png`)
- **Image URL**: Text file with the URL to the generated image (`flux-[concept].txt`)
- **Prompt**: Text file with the prompt used for generation (`flux-[concept]-prompt.txt`)
- **Metadata**: JSON file with metadata about the generation process (`flux-[concept]-metadata.json`)

## Requirements

- Node.js 23+
- TypeScript
- API keys for:
  - Anthropic Claude (for concept generation)
  - OpenAI (fallback for concept generation)
  - Replicate (for image generation with Flux)

## References

### Margritte's Key Works

- "The Treachery of Images" (This is not a pipe)
- "The Son of Man" (Man with apple obscuring face)
- "The Empire of Light" (Day/night juxtaposition)
- "The Human Condition" (Canvas continuing the view beyond)
- "Personal Values" (Oversized objects in a room)
- "Golconda" (Men in bowler hats raining from sky)
- "The Blank Signature" (Horse and rider in forest)
- "The False Mirror" (Eye with sky as iris)
- "The Listening Room" (Room filled with giant apple)
- "The Key to the Fields" (Shattered window revealing scene beyond)

## Acknowledgments

- Inspired by the oil paintings of Studio Margritte
- Built with Claude 3.5 Sonnet and Flux AI
- Special thanks to the AI art community

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 