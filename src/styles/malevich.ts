import { ArtDirection } from '../types/ArtDirection.js';

export const malevichStyle: ArtDirection = {
  styleEmphasis: [
    // Malevich's Distinctive Style
    "suprematist abstraction",
    "pure geometric forms",
    "non-objective reality",
    "floating elements",
    "spatial dynamism",
    "absolute abstraction",
    "geometric purity",
    "cosmic space",
    "revolutionary modernism",
    "spiritual geometry",
    "mathematical harmony",
    "universal forms",
    "transcendent space",
    "revolutionary aesthetics",
    "pure feeling"
  ],
  visualElements: [
    // Malevich's Visual Language
    "black square",
    "floating rectangles",
    "dynamic circles",
    "crossed planes",
    "geometric clusters",
    "diagonal elements",
    "pure shapes",
    "white space",
    "intersecting forms",
    "suspended geometry",
    "minimal elements",
    "precise edges",
    "clean forms",
    "spatial voids",
    "geometric tension"
  ],
  colorPalette: [
    // Malevich's Pure Palette
    "absolute black",
    "pure white",
    "revolutionary red",
    "cosmic blue",
    "geometric yellow",
    "transcendent green",
    "dynamic orange",
    "spatial grey",
    "pure brown",
    "infinite white"
  ],
  compositionGuidelines: [
    // Malevich's Compositional Approach
    "dynamic balance",
    "floating arrangement",
    "geometric tension",
    "spatial hierarchy",
    "revolutionary order",
    "pure composition",
    "cosmic space",
    "mathematical harmony",
    "diagonal dynamics",
    "minimal structure",
    "transcendent placement",
    "absolute organization",
    "spatial freedom",
    "geometric clarity",
    "revolutionary balance"
  ],
  moodAndTone: "Create a pure Suprematist interpretation that embodies Malevich's revolutionary approach to non-objective art. The execution must demonstrate his characteristic use of geometric forms floating in infinite space. Every element should contribute to a sense of absolute abstraction and spiritual transcendence, rendered with mathematical precision and revolutionary clarity.",
  references: [
    "Malevich's 'Black Square' (1915) - for pure abstraction",
    "Malevich's 'Suprematist Composition' (1916) - for floating forms",
    "Malevich's 'White on White' (1918) - for transcendent space",
    "Malevich's 'Eight Red Rectangles' (1915) - for geometric composition",
    "Malevich's 'Suprematism' (1915) - for revolutionary aesthetics",
    "Malevich's 'Airplane Flying' (1915) - for dynamic movement",
    "Malevich's 'Black Circle' (1915) - for geometric purity",
    "Malevich's 'Suprematist Painting' (1917-18) - for spatial relationships",
    "Malevich's 'Red Square' (1915) - for revolutionary symbolism",
    "Malevich's 'Supremus No. 58' (1916) - for complex geometry"
  ],
  avoidElements: [
    // Anti-Malevich Elements
    "representational forms",
    "naturalistic elements",
    "decorative details",
    "pictorial space",
    "narrative content",
    "organic shapes",
    "textural effects",
    "atmospheric perspective",
    "realistic rendering",
    "traditional composition",
    "illustrative elements",
    "emotional expression",
    "natural forms",
    "representational space",
    "pictorial depth",
    // Style Elements to Avoid
    "impressionist effects",
    "expressionist gesture",
    "cubist fragmentation",
    "surrealist elements",
    "naturalistic style",
    // General Elements to Avoid
    "representational imagery",
    "natural world references",
    "emotional content",
    "decorative patterns",
    "traditional perspective"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Kazimir Malevich's Suprematism, with pure geometric abstraction and non-objective reality. Create a revolutionary interpretation with ",
    prompt_suffix: ". Use Malevich's characteristic floating geometric forms, pure colors, and infinite space. Style of Black Square and Suprematist Composition.",
    negative_prompt: "representational, naturalistic, decorative, pictorial, narrative, organic, textural, realistic, traditional, illustrative, emotional, natural",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 