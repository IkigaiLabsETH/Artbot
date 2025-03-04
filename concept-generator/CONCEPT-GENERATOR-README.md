# 🎨 ArtBot Concept Generator

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

The ArtBot Concept Generator is a complementary tool for the ArtBot system that creates unique and inspiring concept ideas across multiple creative categories. This tool is designed to enhance the ideation phase of the creative process by providing a diverse range of concepts that can later be used as prompts for the main ArtBot art generation system.

> **Important**: This tool does NOT replace the defaultArtGenerator functionality. It is a separate utility that works alongside the main ArtBot system to enhance the creative process.

## How It Fits Into ArtBot

The concept generator serves as an ideation assistant in the ArtBot ecosystem:

1. **Ideation Phase**: Use the concept generator to brainstorm creative concepts
2. **Art Generation Phase**: Feed these concepts into the main ArtBot system (defaultArtGenerator)
3. **Refinement Phase**: Use ArtBot's other tools to refine and evolve the generated art

This separation of concerns allows for a more flexible and powerful creative workflow.

## Features

- **Multiple Categories**: Generate concepts across 10 different creative categories
- **Customizable Output**: Specify the number of concepts you want to generate
- **JSON Export**: All generated concepts are saved as JSON files for easy integration with the main ArtBot system
- **Simple Interface**: Easy-to-use command-line interface with clear instructions
- **Standalone Operation**: Works independently from the main art generation process

## Categories

The generator supports the following concept categories:

- **Cinematic**: Film-inspired scenes with dramatic lighting and composition
- **Surreal**: Dreamlike, impossible scenes that challenge reality
- **Cyberpunk**: High-tech, low-life futuristic urban environments
- **Nature**: Natural landscapes and phenomena with dramatic elements
- **Urban**: City scenes capturing the essence of metropolitan life
- **Abstract**: Non-representational compositions focusing on color and form
- **Nostalgic**: Scenes evoking emotional connections to the past
- **Futuristic**: Forward-looking visions of technology and society
- **Fantasy**: Magical and mythical scenes from imaginary worlds
- **Dystopian**: Post-apocalyptic or troubled future scenarios

## Usage

### Using the Shell Script (Recommended)

The easiest way to use the concept generator is with the provided shell script:

```bash
./run-concept-generator.sh [category] [count]
```

Examples:
- `./run-concept-generator.sh` - Generate 5 concepts for each category
- `./run-concept-generator.sh cyberpunk` - Generate 5 cyberpunk concepts
- `./run-concept-generator.sh fantasy 10` - Generate 10 fantasy concepts

### Using Node.js Directly

You can also run the generator directly with Node.js:

```bash
node generate-concept-ideas.js [category] [count]
```

### Using NPM Script

```bash
npm run generate [category] [count]
```

## Output

The generator creates JSON files in the `output` directory with the following format:

```json
{
  "cinematic": [
    "abandoned lighthouse at dawn",
    "neon-lit alleyway after rain",
    "ancient temple reclaimed by jungle",
    "solitary figure on endless dunes",
    "cybernetic garden under binary stars"
  ]
}
```

## Integration with ArtBot

To use these concept ideas with the main ArtBot system:

1. Generate concept ideas using this tool:
   ```bash
   ./run-concept-generator.sh fantasy 5
   ```

2. Find the generated JSON file in the `output` directory

3. Use concepts from this file as input for the main ArtBot art generation:
   ```bash
   # Example of how you might use a concept with the main ArtBot system
   pnpm demo:flux "dragon perched on ancient library tower"
   ```

This workflow keeps the concept generation separate from the art generation while allowing them to work together seamlessly.

## Files Included

- `generate-concept-ideas.js` - The main JavaScript module
- `run-concept-generator.sh` - User-friendly shell script interface
- `package.json` - Dependencies and npm scripts
- `CONCEPT-GENERATOR-README.md` - This documentation file

## Contributing

Contributions to expand the concept generator are welcome! Feel free to:
- Add new concept categories
- Expand the concept libraries
- Improve the generation algorithm
- Enhance the user interface

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the creative potential of AI-human collaboration
- Built as a complementary tool for the ArtBot creative intelligence system 