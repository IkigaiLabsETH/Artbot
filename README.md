# Magritte Art Generator with Personalized Taste Model

A sophisticated art generator in the style of René Magritte with a personalized taste model that evolves based on user preferences.

![Magritte Art Generator](https://upload.wikimedia.org/wikipedia/en/9/9d/The_Son_of_Man.jpg)
*René Magritte's "The Son of Man" (1964)*

## Overview

This project implements a multi-agent system for generating high-quality, authentic artwork in the style of René Magritte. It features category-specific art direction files, a sophisticated aesthetic judgment system, and a personalized taste model that evolves based on user preferences.

The personalized taste model uses an ELO rating system and exploration bonuses to balance between exploiting known preferences and exploring new artistic possibilities, similar to the approach used by autonomous AI artists like Botto and Keke.

## Features

- **Category-Specific Art Direction**: 11 distinct Magritte-inspired categories with detailed style guidance
- **Multi-Agent System**: Collaborative agents for ideation, styling, refinement, and evaluation
- **Aesthetic Judgment System**: Objective evaluation of artwork quality
- **Personalized Taste Model**: ELO-based preference learning with exploration bonuses
- **Interactive Interface**: User-friendly command-line interface for art generation and taste model training

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/magritte-art-generator.git
cd magritte-art-generator

# Install dependencies
npm install
```

## Usage

### Generate Artwork

```bash
# Run the main application
npm start

# Or use the dedicated script
npm run generate

# For Windows users
generate_art.bat

# For macOS/Linux users
./generate_art.sh
```

### Train Taste Model

```bash
# Train the personalized taste model
npm run train

# For Windows users
train_taste_model.bat

# For macOS/Linux users
./train_taste_model.sh
```

## Components

### Art Direction Files

The project includes category-specific art direction files for various Magritte-inspired categories:

- Classic
- Empire of Light
- Landscapes
- Metamorphosis
- Mystery
- Objects
- Scale
- Silhouettes
- Skies
- Windows
- Wordplay

Each file contains structured guidance on style emphasis, visual elements, color palette, composition guidelines, mood and tone, references to Magritte's works, and elements to avoid.

### Multi-Agent System

The art generation process is handled by a collaborative multi-agent system:

- **Director Agent**: Coordinates the art generation process
- **Ideator Agent**: Generates creative concepts based on user prompts
- **Stylist Agent**: Develops artistic styles based on category guidelines
- **Refiner Agent**: Enhances artwork details and composition
- **Critic Agent**: Evaluates artwork quality using the aesthetic judgment system
- **Taste Agent**: Applies personalized taste model to evaluate artwork based on evolving preferences

### Personalized Taste Model

The personalized taste model evaluates each generated image based on both aesthetic quality and alignment with evolving preferences. It uses an ELO rating system for preference learning and incorporates exploration bonuses to encourage experimentation with unconventional ideas.

Key components include:

- **Feature Extraction**: Identifies style elements, visual components, color palettes, and compositional aspects
- **ELO Rating System**: Updates feature weights based on pairwise comparisons
- **Exploration Strategy**: Implements a bandit-like approach with decay to balance exploitation and exploration
- **Preference Scoring**: Calculates scores based on learned weights for different features
- **Training Interface**: Provides a user-friendly system for comparing artworks and training the model

## Documentation

For more detailed information, see the following documentation files:

- [Art Direction README](MAGRITTE-ART-DIRECTION-README.md): Explains the art direction files and their usage
- [Fine-Tuning Summary](FINE-TUNING-SUMMARY.md): Summarizes the enhancements and implementation recommendations
- [Final Enhancements Summary](FINAL-ENHANCEMENTS-SUMMARY.md): Provides a comprehensive overview of all enhancements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by René Magritte's surrealist artwork
- Influenced by autonomous AI artists like Botto and Keke
- Built with Node.js
