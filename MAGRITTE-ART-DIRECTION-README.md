# Margritte Art Direction Files

This directory contains category-specific art direction files for the Margritte-inspired art generator. Each file defines the unique characteristics and artistic elements associated with a specific category of Studio Margritte's work.

## Overview

The art direction files are designed to enhance the quality and authenticity of generated artwork by providing detailed guidance on:

- Style emphasis
- Visual elements
- Color palette
- Composition guidelines
- Mood and tone
- References to Margritte's original works
- Elements to avoid

## Available Categories

The following category-specific art direction files are available:

1. **Classic** (`Margritte_classic.json`): Encompasses the quintessential elements of Margritte's surrealism, featuring iconic motifs like bowler hats, pipes, and apples in unexpected contexts.

2. **Empire of Light** (`Margritte_empire_of_light.json`): Focuses on the juxtaposition of day and night in a single scene, inspired by Margritte's famous series of paintings.

3. **Landscapes** (`Margritte_landscapes.json`): Features surreal Belgian landscapes with impossible elements and dreamlike qualities.

4. **Metamorphosis** (`Margritte_metamorphosis.json`): Explores the transformation of objects and beings, blurring the boundaries between different forms.

5. **Mystery** (`Margritte_mystery.json`): Emphasizes enigmatic and concealed elements, often featuring hidden or obscured faces and figures.

6. **Objects** (`Margritte_objects.json`): Focuses on ordinary objects placed in extraordinary contexts, highlighting their uncanny qualities.

7. **Scale** (`Margritte_scale.json`): Plays with the size relationships between objects, featuring dramatically oversized or miniaturized elements.

8. **Silhouettes** (`Margritte_silhouettes.json`): Emphasizes dark silhouettes against contrasting backgrounds, often with surreal elements within the silhouette forms.

9. **Skies** (`Margritte_skies.json`): Highlights Margritte's distinctive cloud-filled blue skies, often with floating objects or unusual juxtapositions.

10. **Windows** (`Margritte_windows.json`): Explores the theme of frames and windows, blurring the distinction between interior and exterior spaces.

11. **Wordplay** (`Margritte_wordplay.json`): Focuses on the relationship between images and their meanings, inspired by Margritte's philosophical approach to representation.

## File Structure

Each art direction file follows this JSON structure:

```json
{
  "styleEmphasis": [
    "List of style elements to emphasize"
  ],
  "visualElements": [
    "List of visual elements to include"
  ],
  "colorPalette": [
    "List of colors and color relationships"
  ],
  "compositionGuidelines": [
    "List of composition principles"
  ],
  "moodAndTone": "Description of the mood and tone",
  "references": [
    "List of reference works by Margritte"
  ],
  "avoidElements": [
    "List of elements to avoid"
  ]
}
```

## Usage Guidelines

### Integration with Art Generation

These art direction files should be used to guide the generation process for each category. When a user selects a specific Margritte category, the corresponding art direction file should be loaded and used to influence:

1. The prompt construction
2. The style parameters
3. The composition guidance
4. The post-processing filters

### Maintaining Painterly Quality

Across all categories, maintain these painterly qualities:
- Oil painting technique
- Visible brushstrokes
- Canvas texture
- Traditional painting style
- Non-photorealistic rendering

### Extending Categories

To add a new category:

1. Create a new JSON file following the established structure
2. Define the unique characteristics of the category
3. Include specific references to Margritte's works
4. Update this README to include the new category

## Implementation Notes

When implementing these art direction files in the generation system:

1. Parse the JSON file for the selected category
2. Extract relevant elements based on the generation stage
3. Incorporate the style emphasis and visual elements into the primary prompt
4. Use the color palette and composition guidelines for parameter settings
5. Apply the avoidElements list as negative prompting or post-processing filters

## Interactive Art Generation

The system includes an interactive command-line interface that allows users to generate custom Margritte-inspired artwork. This feature provides:

1. **Category Selection**: Choose from all available Margritte categories
2. **Custom Prompts**: Enter your own prompt to guide the art generation
3. **Real-time Feedback**: View aesthetic evaluation scores with visual representations
4. **Multiple Generation**: Create multiple artworks in a single session

### Using the Interactive Feature

To use the interactive art generation feature:

1. Run the application with `node multi_agent_integration.js`
2. Select option 2 for "Generate custom art"
3. Choose a category from the list of available options
4. Enter your custom prompt
5. View the generated artwork details and aesthetic evaluation
6. Choose whether to generate another artwork

Alternatively, you can directly access the interactive mode:

```bash
# Run the interactive art generator directly
node generate_art.js
```

For convenience, we've also included platform-specific scripts:

**Windows:**
```
generate_art.bat
```

**macOS/Linux:**
```
./generate_art.sh
```

These scripts will immediately start the interactive art generation process without requiring you to select from the main menu.

### Example Interaction

```
=== Margritte Art Generator ===
1. Run examples
2. Generate custom art

Select an option (1 or 2): 2

Available Margritte categories:
1. classic
2. empire_of_light
3. landscapes
4. metamorphosis
5. mystery
6. scale
7. silhouettes
8. skies
9. windows

Select a category (enter number): 1

Enter your prompt for the classic category: A man with an apple floating in front of his face

Generating artwork for "A man with an apple floating in front of his face" in the classic category...

[Image generation details and aesthetic evaluation would appear here]

Generate another artwork? (y/n): y
```

## Examples

For examples of how these art direction files translate into generated artwork, see the `examples` directory, which contains sample images for each category along with the prompts and parameters used to generate them.

## References

- Margritte, René. *The Empire of Light*. 1953-1954.
- Margritte, René. *The Treachery of Images*. 1929.
- Margritte, René. *The Son of Man*. 1964.
- Sylvester, David. *Margritte: The Silence of the World*. Harry N. Abrams, 1992.
- Paquet, Marcel. *Studio Margritte*. Taschen, 2000.