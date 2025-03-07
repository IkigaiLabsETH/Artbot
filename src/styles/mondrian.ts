import { ArtDirection } from '../types/ArtDirection.js';

export const mondrianStyle: ArtDirection = {
  styleEmphasis: [
    // Mondrian's Distinctive Style
    "neo-plasticist abstraction",
    "geometric purity",
    "primary color blocks",
    "perpendicular lines",
    "asymmetrical balance",
    "mathematical precision",
    "universal harmony",
    "reductionist composition",
    "planar relationships",
    "grid-based structure",
    "pure abstraction",
    "spatial equilibrium",
    "modernist clarity",
    "elemental forms",
    "dynamic balance"
  ],
  visualElements: [
    // Mondrian's Visual Language
    "black vertical lines",
    "black horizontal lines",
    "rectangular color planes",
    "white background spaces",
    "primary color blocks",
    "perpendicular intersections",
    "geometric divisions",
    "balanced asymmetry",
    "pure geometric forms",
    "precise edges",
    "clean intersections",
    "planar divisions",
    "mathematical grid",
    "orthogonal structure",
    "spatial rhythm"
  ],
  colorPalette: [
    // Mondrian's Essential Palette
    "primary red",
    "primary blue",
    "primary yellow",
    "pure white",
    "pure black",
    "cool white",
    "warm white",
    "matte black",
    "bright red",
    "ultramarine blue"
  ],
  compositionGuidelines: [
    // Mondrian's Compositional Approach
    "grid-based structure",
    "asymmetrical balance",
    "perpendicular relationships",
    "mathematical proportion",
    "dynamic equilibrium",
    "spatial harmony",
    "geometric division",
    "planar organization",
    "pure form relationships",
    "universal order",
    "rhythmic structure",
    "balanced tension",
    "precise spacing",
    "orthogonal alignment",
    "dynamic stability"
  ],
  moodAndTone: "Create a pure Mondrian-style neo-plasticist interpretation that embodies his pursuit of universal harmony through geometric abstraction. The execution must demonstrate his characteristic use of primary colors, black lines, and white spaces in perfect perpendicular relationships. Every element should contribute to a sense of dynamic equilibrium and mathematical precision, rendered with absolute geometric clarity.",
  references: [
    "Mondrian's 'Composition with Red, Blue, and Yellow' (1930) - for primary color balance",
    "Mondrian's 'Broadway Boogie Woogie' (1942-43) - for dynamic grid",
    "Mondrian's 'Composition II in Red, Blue, and Yellow' (1929) - for geometric purity",
    "Mondrian's 'Tableau I' (1921) - for perpendicular structure",
    "Mondrian's 'Composition with Large Red Plane' (1921) - for spatial balance",
    "Mondrian's 'Composition C' (1920) - for neo-plastic principles",
    "Mondrian's 'Composition with Grid 9' (1919) - for linear structure",
    "Mondrian's 'Composition with Yellow' (1930) - for color relationships",
    "Mondrian's 'New York City I' (1942) - for dynamic rhythm",
    "Mondrian's 'Victory Boogie Woogie' (1944) - for complex grid"
  ],
  avoidElements: [
    // Anti-Mondrian Elements
    "diagonal lines",
    "curved forms",
    "secondary colors",
    "natural forms",
    "organic shapes",
    "textural effects",
    "painterly qualities",
    "decorative elements",
    "representational forms",
    "atmospheric effects",
    "gestural marks",
    "expressive brushwork",
    "naturalistic colors",
    "irregular shapes",
    "random placement",
    // Style Elements to Avoid
    "expressionist gestures",
    "impressionist effects",
    "surrealist elements",
    "figurative forms",
    "naturalistic representation",
    // General Elements to Avoid
    "emotional expression",
    "organic movement",
    "natural imagery",
    "pictorial depth",
    "realistic elements"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Piet Mondrian's neo-plasticism, with pure geometric abstraction and primary colors. Create a precise interpretation with ",
    prompt_suffix: ". Use Mondrian's characteristic black perpendicular lines, primary color planes, and white spaces. Style of Composition with Red, Blue, and Yellow.",
    negative_prompt: "diagonal, curved, organic, textural, painterly, decorative, representational, atmospheric, gestural, expressive, naturalistic, irregular, random",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 