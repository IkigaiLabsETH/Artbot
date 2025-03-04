# Art Direction System for ArtBot

The Art Direction system allows you to provide specific artistic guidance to the multi-agent system, influencing how your artwork is generated. This feature gives you more control over the visual style, composition, color palette, and other aspects of the generated art.

## How It Works

The Art Direction system works by providing specific guidance to the specialized agents in the multi-agent system:

1. **Stylist Agent**: Uses the style emphasis, color palette, and references to develop a cohesive artistic style
2. **Ideator Agent**: Incorporates required visual elements and mood/tone into the creative concept
3. **Refiner Agent**: Applies composition guidelines and avoids specified elements during artwork generation
4. **Director Agent**: Ensures all art direction requirements are coordinated across the creative process

## Configuration Options

You can configure art direction in three ways:

### 1. Environment Variables

Set these environment variables in your `.env` file:

```
ART_STYLE_EMPHASIS=cinematic,dramatic lighting,film grain
ART_COLOR_PALETTE=rich blues,deep reds,golden highlights
ART_COMPOSITION=rule of thirds,leading lines,depth of field
ART_MOOD=atmospheric and evocative
ART_REFERENCES=Roger Deakins,Gregory Crewdson
ART_AVOID=text,watermarks,distorted faces
```

### 2. JSON Configuration File

Create an `art-direction.json` file in your project root with the following structure:

```json
{
  "styleEmphasis": [
    "cinematic",
    "dramatic lighting",
    "film grain"
  ],
  "visualElements": [
    "reflective surfaces",
    "dynamic shadows"
  ],
  "colorPalette": [
    "rich blues",
    "deep reds",
    "golden highlights"
  ],
  "compositionGuidelines": [
    "rule of thirds",
    "leading lines"
  ],
  "moodAndTone": "atmospheric and evocative",
  "references": [
    "Roger Deakins cinematography",
    "Gregory Crewdson photography"
  ],
  "avoidElements": [
    "text",
    "watermarks",
    "distorted faces"
  ]
}
```

### 3. Command Line Parameters (Coming Soon)

In future versions, you'll be able to specify art direction parameters directly via command line.

## Art Direction Properties

| Property | Description | Example Values |
|----------|-------------|----------------|
| `styleEmphasis` | Specific styles to emphasize | cinematic, impressionistic, minimalist |
| `visualElements` | Required visual elements | reflective surfaces, dynamic shadows |
| `colorPalette` | Specific color palette to use | rich blues, deep reds, golden highlights |
| `compositionGuidelines` | Guidelines for composition | rule of thirds, leading lines |
| `moodAndTone` | Overall mood and tone | atmospheric, joyful, melancholic |
| `references` | Reference artists or works | Roger Deakins, Blade Runner 2049 |
| `avoidElements` | Elements to avoid | text, watermarks, distorted faces |

## Examples

### Cinematic Night Scene

```json
{
  "styleEmphasis": ["cinematic", "noir", "dramatic lighting"],
  "colorPalette": ["deep blues", "neon highlights", "shadows"],
  "moodAndTone": "mysterious and atmospheric"
}
```

### Vibrant Abstract

```json
{
  "styleEmphasis": ["abstract", "geometric", "vibrant"],
  "colorPalette": ["bright primary colors", "high contrast"],
  "compositionGuidelines": ["dynamic balance", "rhythm", "movement"]
}
```

### Ethereal Nature

```json
{
  "styleEmphasis": ["ethereal", "dreamy", "soft focus"],
  "visualElements": ["natural elements", "organic forms", "mist"],
  "colorPalette": ["soft pastels", "gentle gradients"]
}
```

## Integration with Multi-Agent System

The art direction information is passed to each specialized agent in the multi-agent system:

1. **Director Agent** receives the complete art direction and coordinates its implementation
2. **Ideator Agent** focuses on the conceptual elements that align with the art direction
3. **Stylist Agent** develops a style guide based on the art direction parameters
4. **Refiner Agent** applies the art direction during the final artwork generation
5. **Critic Agent** evaluates how well the artwork adheres to the specified art direction

## Tips for Effective Art Direction

1. **Be Specific**: The more specific your direction, the more predictable the results
2. **Balance Constraints**: Too many constraints may limit creativity, too few may result in unpredictable output
3. **Consider Compatibility**: Ensure your art direction elements work well together
4. **Experiment**: Try different combinations to discover unique artistic styles
5. **Review Results**: Check the metadata of generated images to see how the art direction was applied

## Troubleshooting

If your art direction isn't being applied as expected:

1. Check that your `art-direction.json` file is valid JSON
2. Ensure the file is in the root directory of your project
3. Verify that environment variables are correctly formatted
4. Look for any conflicting directions that might be causing issues
5. Check the console output for any warnings or errors related to art direction 