# ArtBot - Surrealist Vision Generator

<div align="center">

```ascii
    ╭──────────────────────╮
    │       ARTBOT         │
    │    ┌──────────┐     │
    │    │ 🎨 AI    │     │
    │    └──────────┘     │
    │  Creative Partner    │
    ╰──────────────────────╯
```

*Blending Surrealist Philosophy with Fashion Photography*

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## Overview

ArtBot is a sophisticated AI art generation system that uniquely combines René Magritte's philosophical surrealism with Guy Bourdin's provocative fashion photography. Through a multi-agent collaborative system, it creates artworks that challenge perception while maintaining high aesthetic and conceptual standards.

<div align="center">

### Artistic Fusion
🎨 Magritte's Surrealism + 📸 Bourdin's Fashion = 🌟 Unique Visual Language

</div>

## Features

### Core Capabilities
- 🤖 **Advanced Multi-Agent System**
  - Director Agent: Orchestrates the creative process
  - Ideator Agent: Generates innovative concepts
  - Stylist Agent: Develops unique artistic styles
  - Refiner Agent: Perfects visual details
  - Critic Agent: Provides artistic evaluation

- 🎯 **Category-Specific Art Direction**
  - Magritte-inspired categories (Lovers, Empire of Light, Objects, etc.)
  - Bourdin-inspired categories (Fashion, Color, Composition, etc.)
  - Hybrid style combinations

- 🎨 **Sophisticated Style System**
  - Dynamic style evolution
  - Intelligent style blending
  - Context-aware aesthetics

### Technical Features
- 📊 **Advanced Processing**
  - High-resolution image generation
  - Intelligent composition analysis
  - Style transfer capabilities

- 💾 **Memory System**
  - Experience-based learning
  - Style evolution tracking
  - Creative process memory

- 🔄 **Workflow Integration**
  - Seamless API integration
  - Batch processing support
  - Custom pipeline creation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/artbot.git
cd artbot

# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

## Configuration

Configure your environment variables:

```env
ANTHROPIC_API_KEY=your_api_key
REPLICATE_API_KEY=your_api_key
STORAGE_PATH=.artbot
```

## Usage

### Basic Art Generation

```bash
# Generate art with default settings
npm start "your concept"

# Generate with specific category
npm start "your concept" "category_name"
```

### Advanced Usage

```bash
# Use specific style blend
npm run generate -- --style=bourdin_fashion "your concept"

# Batch generation
npm run batch -- --count=5 "your concept"
```

## Art Direction System

### Style Categories

#### Magritte-Inspired
- 🌌 Empire of Light
- 🎭 Lovers
- 🍎 Objects
- 🪟 Windows
- 👤 Silhouettes
- 🦋 Metamorphosis
- 📝 Wordplay
- 📏 Scale
- 🔍 Mystery
- 🌅 Landscapes
- ☁️ Skies

#### Bourdin-Inspired
- 👗 Fashion
- 🎨 Color
- 📸 Composition
- 📖 Narrative
- 💎 Objects

## Development

```bash

pnpm i && pnpm build && pnpm start

```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- [Technical Documentation](docs/technical.md)
- [API Reference](docs/api.md)
- [Style Guide](docs/style-guide.md)
- [Multi-Agent System](docs/multi-agent.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by René Magritte's surrealist philosophy
- Influenced by Guy Bourdin's revolutionary fashion photography
- Built with modern AI technologies
- Special thanks to the AI art community

<div align="center">

---

Made with 🎨 by ArtBot Team

[Report Bug](https://github.com/yourusername/artbot/issues) • [Request Feature](https://github.com/yourusername/artbot/issues)

</div>
