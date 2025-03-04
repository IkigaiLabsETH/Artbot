# ArtBot Reference Images

This feature allows ArtBot to use a curated collection of reference images as inspiration for its creative process. By providing visual examples of artistic styles, themes, and aesthetics, you can guide ArtBot's creative direction and help it develop artwork that aligns with your vision.

## Overview

The reference images system consists of:

1. A structured directory of categorized reference images
2. Metadata files that describe each image's attributes
3. A catalog that indexes all images for efficient retrieval
4. Integration with the StylistAgent to influence style development

## Directory Structure

```
reference_images/
├── README.md                 # Documentation
├── metadata_template.json    # Template for image metadata
├── catalog.json              # Auto-generated catalog of all images
├── abstract/                 # Non-representational art
├── figurative/               # Art depicting recognizable objects
├── landscape/                # Natural and urban landscapes
├── portrait/                 # Human and character portraits
├── conceptual/               # Art communicating specific ideas
├── surreal/                  # Dreamlike, fantastical imagery
├── geometric/                # Art based on geometric shapes
├── organic/                  # Art inspired by natural forms
├── digital/                  # Art created with digital tools
└── traditional/              # Art created with traditional media
```

## How It Works

1. **Inspiration Source**: When the StylistAgent develops artistic styles, it searches the reference images catalog for examples that match the project requirements and creative ideas.

2. **Style Analysis**: The system analyzes the metadata of reference images to extract style characteristics like color palettes, composition approaches, textures, and techniques.

3. **Integration**: The StylistAgent incorporates elements from the reference images into its style development process, creating styles that align with your curated examples.

## Adding Your Own Reference Images

You can add your own reference images to guide ArtBot's creative direction:

### Using the Import Script

We provide a utility script to help you import and organize reference images:

```bash
# Run the import utility
node scripts/import-reference-images.js
```

The script will guide you through:
- Selecting images to import
- Categorizing them
- Adding metadata
- Generating the catalog

### Manual Addition

You can also manually add images:

1. Place your image in the appropriate category folder (e.g., `reference_images/abstract/`)
2. Create a JSON metadata file with the same base name (e.g., `my_image.png` → `my_image.json`)
3. Use the `metadata_template.json` as a guide for the metadata structure
4. Regenerate the catalog by running:
   ```bash
   node -e "const { buildReferenceImagesCatalog } = require('./dist/utils/reference_images_catalog.js'); buildReferenceImagesCatalog().catch(console.error);"
   ```

## Metadata Structure

Each reference image should have a companion JSON file with metadata:

```json
{
  "filename": "example_image.png",
  "title": "Example Artwork Title",
  "artist": "Original Artist (if known)",
  "year": "Year of creation (if known)",
  "source": "Original source or 'Original creation'",
  "license": "Copyright status or license type",
  "categories": ["primary_category", "secondary_category"],
  "tags": ["descriptive_tag_1", "descriptive_tag_2", "descriptive_tag_3"],
  "style_attributes": {
    "color_palette": ["#HEX1", "#HEX2", "#HEX3"],
    "composition": "Description of composition approach",
    "texture": "Description of texture qualities",
    "mood": "Description of emotional tone",
    "technique": "Description of artistic technique"
  },
  "prompt_used": "If generated with AI, the prompt that created it",
  "description": "A brief description of the artwork and its significance",
  "inspiration_value": "Notes on specific elements that make this valuable",
  "added_date": "YYYY-MM-DD",
  "added_by": "Name of person who added this to the collection"
}
```

## Best Practices

1. **Diverse Collection**: Include a variety of styles, techniques, and subjects to give ArtBot a broad foundation.

2. **Quality Over Quantity**: Focus on high-quality examples that clearly demonstrate the artistic elements you want to inspire.

3. **Detailed Metadata**: Provide thorough metadata, especially tags and style attributes, to help the system find relevant references.

4. **Consistent Categorization**: Place images in the most appropriate category and use tags to cross-reference.

5. **Copyright Compliance**: Ensure you have the right to use all reference images. Prefer original creations, properly licensed works, or public domain images.

## Technical Integration

The reference images system is integrated with ArtBot through:

1. **ReferenceImageProvider**: A utility class that manages access to the reference images catalog.

2. **StylistAgent**: Uses the ReferenceImageProvider to find relevant reference images when developing styles.

3. **ArtBotMultiAgentSystem**: Initializes and manages the ReferenceImageProvider as part of the overall system.

## Example Usage

When you run ArtBot with a project like:

```javascript
const artbot = new ArtBotMultiAgentSystem();
await artbot.initialize();

await artbot.runArtProject({
  title: "Cosmic Garden",
  description: "A surreal garden with cosmic elements and vibrant colors"
});
```

The StylistAgent will search the reference images catalog for examples matching "cosmic", "garden", "surreal", and "vibrant colors", then use those as inspiration for developing the artistic style.

---

By curating a collection of reference images that align with your artistic vision, you can guide ArtBot's creative direction while still allowing it to develop its own unique interpretations. 