# Margritte Art Generator: Quickstart Guide

This guide will help you quickly get started with the Margritte Art Generator, a specialized multi-agent AI system designed to create artwork inspired by the surrealist painter Studio Margritte.

## Prerequisites

- Node.js (v14 or higher)
- TypeScript
- API keys for Anthropic, OpenAI, and Replicate

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following content:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   OPENAI_API_KEY=your_openai_api_key
   REPLICATE_API_KEY=your_replicate_api_key
   ```

## Generate Your First Artwork

The Margritte Art Generator uses a simple command-line interface to generate artwork. The basic command is:

```bash
./run-multiagent-art-generator.sh "Your concept" Margritte_category
```

Where:
- `"Your concept"` is the artistic concept you want to visualize
- `Margritte_category` is one of the 12 specialized Margritte categories

### Example Commands

1. **Classic Margritte Style**:
   ```bash
   ./run-multiagent-art-generator.sh "A pipe floating above a landscape" Margritte_classic
   ```

2. **Empire of Light**:
   ```bash
   ./run-multiagent-art-generator.sh "A street with houses illuminated at night under a bright blue daytime sky" Margritte_empire_of_light
   ```

3. **Objects**:
   ```bash
   ./run-multiagent-art-generator.sh "A room filled with floating green apples" Margritte_objects
   ```

4. **Windows**:
   ```bash
   ./run-multiagent-art-generator.sh "A window revealing an impossible scene" Margritte_windows
   ```

5. **Scale**:
   ```bash
   ./run-multiagent-art-generator.sh "Giant apple filling a room" Margritte_scale
   ```

6. **Silhouettes**:
   ```bash
   ./run-multiagent-art-generator.sh "Silhouette filled with night sky" Margritte_silhouettes
   ```

7. **Metamorphosis**:
   ```bash
   ./run-multiagent-art-generator.sh "A bird gradually transforming into leaves" Margritte_metamorphosis
   ```

## Available Categories

The Margritte Art Generator supports 12 specialized categories:

1. `Margritte_classic`: The quintessential Margritte style
2. `Margritte_empire_of_light`: Day/night paradoxical scenes
3. `Margritte_objects`: Extraordinary treatment of ordinary objects
4. `Margritte_wordplay`: Exploration of words and images
5. `Margritte_windows`: Windows and frames as perceptual devices
6. `Margritte_scale`: Play with scale and proportion
7. `Margritte_metamorphosis`: Transformation and hybrid forms
8. `Margritte_mystery`: Enigmatic and mysterious scenes
9. `Margritte_skies`: Distinctive treatment of skies and clouds
10. `Margritte_silhouettes`: Use of silhouettes and negative space
11. `Margritte_mirrors`: Exploration of reflection and doubled imagery
12. `Margritte_surrealism`: General surrealist approach

For detailed information about each category, refer to the [Margritte-CATEGORIES-GUIDE.md](Margritte-CATEGORIES-GUIDE.md) file.

## Output

When you run the art generator, it will:

1. Compile the TypeScript code (if needed)
2. Initialize the multi-agent system
3. Generate the artwork based on your concept and selected category
4. Save the generated image to the `output` directory
5. Provide a URL to view the image online

The output files include:
- The image file (PNG format)
- A text file containing the image URL
- A prompt file containing the prompt used to generate the image
- A metadata file with additional information about the generation process

## Troubleshooting

If you encounter issues:

1. **API Key Errors**: Ensure your API keys are correctly set in the `.env` file.
2. **Compilation Errors**: Make sure TypeScript is installed (`npm install -g typescript`).
3. **Missing Dependencies**: Run `npm install` to ensure all dependencies are installed.
4. **Permission Issues**: If you can't execute the script, run `chmod +x run-multiagent-art-generator.sh`.

## Next Steps

- Explore different concepts and categories to see how they affect the generated artwork
- Check the [Margritte-CATEGORIES-GUIDE.md](Margritte-CATEGORIES-GUIDE.md) for detailed information about each category
- Read the [README-Margritte-ART-GENERATOR.md](README-Margritte-ART-GENERATOR.md) for a comprehensive overview of the system

## Resources

- [Studio Margritte Museum](https://www.musee-Margritte-museum.be)
- [MoMA Collection: Studio Margritte](https://www.moma.org/artists/3692)
- [Tate: Studio Margritte](https://www.tate.org.uk/art/artists/rene-Margritte-1553)