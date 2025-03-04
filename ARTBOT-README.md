# ArtBot - AI-Powered Art Generation

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

ArtBot is an AI-powered art generation tool that creates stunning images based on textual concepts. It uses advanced AI models to generate detailed art prompts and then transforms these prompts into visual artwork.

## Features

- **Concept-to-Art Generation**: Transform simple concepts into detailed artwork
- **AI-Powered Prompt Engineering**: Uses Claude 3 Sonnet to create detailed art prompts
- **High-Quality Image Generation**: Generates images using OpenAI's DALL-E 3
- **Simple Command-Line Interface**: Easy to use with a single command

## Requirements

- Node.js 16+
- OpenAI API Key (for DALL-E 3 image generation)
- Anthropic API Key (for Claude prompt generation, optional if using OpenAI for prompts)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

## Usage

Run the art generator with a concept:

```bash
./run-art-generator.sh "your concept here"
```

For example:
```bash
./run-art-generator.sh "surreal dreamscape"
```

The generated image URL will be saved to the `output` directory with a filename based on your concept.

## How It Works

1. **Concept Input**: You provide a simple concept like "cosmic garden" or "surreal dreamscape"
2. **Prompt Generation**: The AI (Claude 3 Sonnet) creates a detailed art prompt based on your concept
3. **Image Generation**: The prompt is sent to DALL-E 3 to generate a high-quality image
4. **Output**: The image URL is saved to a file in the output directory

## Examples

Here are some concept ideas to try:
- "cosmic garden"
- "surreal dreamscape"
- "cyberpunk cityscape"
- "enchanted forest"
- "underwater civilization"
- "steampunk laboratory"

## Troubleshooting

- **API Key Issues**: Make sure your API keys are correctly set in the `.env` file
- **Image Generation Fails**: Check that your OpenAI account has access to DALL-E 3
- **Prompt Generation Fails**: Ensure your Anthropic API key is valid or that you have an OpenAI key as fallback

## License

This project is part of the Eliza OS ecosystem and is licensed under the same terms.

## Acknowledgments

- Built with Claude 3.5 Sonnet and DALL-E 3
- Part of the Eliza OS project 