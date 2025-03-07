import { ArtDirection } from '../types/ArtDirection.js';

export const cherniakStyle: ArtDirection = {
  styleEmphasis: [
    // Cherniak's Distinctive Style
    "generative algorithms",
    "mathematical precision",
    "geometric minimalism",
    "computational art",
    "algorithmic patterns",
    "elegant constraints",
    "procedural generation",
    "digital abstraction",
    "systematic variation",
    "code-based art",
    "deterministic chaos",
    "geometric harmony",
    "mathematical beauty",
    "programmatic art",
    "controlled randomness"
  ],
  visualElements: [
    // Cherniak's Visual Language
    "wrapped strings",
    "geometric pegs",
    "clean lines",
    "perfect circles",
    "mathematical curves",
    "precise intersections",
    "systematic patterns",
    "geometric primitives",
    "minimal elements",
    "negative space",
    "algorithmic forms",
    "binary structures",
    "recursive patterns",
    "geometric tension",
    "mathematical grids"
  ],
  colorPalette: [
    // Cherniak's Digital Palette
    "stark white",
    "pure black",
    "algorithmic grey",
    "digital beige",
    "minimal blue",
    "systematic red",
    "computational yellow",
    "binary green",
    "precise purple",
    "geometric orange"
  ],
  compositionGuidelines: [
    // Cherniak's Compositional Approach
    "mathematical balance",
    "algorithmic placement",
    "geometric harmony",
    "systematic spacing",
    "controlled chaos",
    "precise alignment",
    "programmatic rhythm",
    "computational flow",
    "geometric tension",
    "binary contrast",
    "recursive structure",
    "mathematical proportion",
    "generative patterns",
    "systematic variation",
    "coded composition"
  ],
  moodAndTone: "Create a Cherniak-style generative artwork that embodies mathematical precision and algorithmic beauty. The piece should feature systematic patterns and geometric elements while maintaining elegant simplicity. Every component should contribute to a sense of computational harmony and controlled chaos, rendered with his signature blend of minimalism and complexity.",
  references: [
    "Cherniak's 'Ringers' series - for wrapped string patterns",
    "Cherniak's 'Perfect Chromatic Field' - for color theory",
    "Cherniak's 'Abstract Portraits' - for geometric interpretation",
    "Cherniak's 'Circuit Breaker' - for systematic composition",
    "Cherniak's 'Binary Garden' - for algorithmic nature",
    "Cherniak's 'Eternal Return' - for recursive patterns",
    "Cherniak's 'Geometric Dreams' - for mathematical beauty",
    "Cherniak's 'Code Art' - for programmatic approach",
    "Cherniak's 'Systematic Chaos' - for controlled randomness",
    "Cherniak's 'Digital Foundations' - for geometric primitives"
  ],
  avoidElements: [
    // Anti-Cherniak Elements
    "organic forms",
    "hand-drawn elements",
    "textural complexity",
    "natural irregularity",
    "expressive brushwork",
    "emotional gestures",
    "random chaos",
    "decorative elements",
    "figurative elements",
    "painterly effects",
    "loose composition",
    "undefined edges",
    "arbitrary decisions",
    "natural textures",
    "uncontrolled elements",
    // Style Elements to Avoid
    "expressionist technique",
    "impressionist style",
    "surrealist elements",
    "abstract expressionism",
    "freeform composition",
    // General Elements to Avoid
    "emotional expression",
    "natural forms",
    "random placement",
    "irregular patterns",
    "unstructured design"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Dmitri Cherniak's generative art, with mathematical precision and algorithmic patterns. Create a systematic interpretation with ",
    prompt_suffix: ". Use Cherniak's characteristic geometric elements, wrapped strings, and minimal composition. Style of Ringers and Perfect Chromatic Field.",
    negative_prompt: "organic, hand-drawn, textural, natural, expressive, emotional, random, decorative, figurative, painterly, loose, undefined, arbitrary, uncontrolled",
    num_inference_steps: 40,
    guidance_scale: 11.5
  }
}; 