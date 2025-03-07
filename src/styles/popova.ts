import { ArtDirection } from '../types/ArtDirection.js';

export const popovaStyle: ArtDirection = {
  styleEmphasis: [
    // Popova's Distinctive Style
    "constructivist dynamics",
    "architectural geometry",
    "industrial rhythm",
    "spatial construction",
    "mechanical precision",
    "revolutionary design",
    "dynamic equilibrium",
    "technological aesthetic",
    "structural harmony",
    "geometric force",
    "material emphasis",
    "engineered composition",
    "revolutionary modernism",
    "industrial abstraction",
    "constructive space"
  ],
  visualElements: [
    // Popova's Visual Language
    "overlapping planes",
    "industrial shapes",
    "mechanical elements",
    "dynamic lines",
    "architectural forms",
    "geometric patterns",
    "structural grids",
    "technological motifs",
    "constructive layers",
    "angular intersections",
    "engineered details",
    "material textures",
    "revolutionary symbols",
    "industrial components",
    "spatial frameworks"
  ],
  colorPalette: [
    // Popova's Industrial Palette
    "machine grey",
    "industrial red",
    "constructivist black",
    "metallic silver",
    "revolutionary crimson",
    "structural white",
    "mechanical blue",
    "industrial brown",
    "architectural ochre",
    "technological steel"
  ],
  compositionGuidelines: [
    // Popova's Compositional Approach
    "dynamic construction",
    "spatial engineering",
    "geometric organization",
    "industrial rhythm",
    "technological balance",
    "structural harmony",
    "mechanical precision",
    "revolutionary order",
    "material emphasis",
    "architectural space",
    "constructive tension",
    "engineered movement",
    "industrial dynamics",
    "geometric force",
    "revolutionary structure"
  ],
  moodAndTone: "Create a dynamic Constructivist interpretation that embodies Popova's revolutionary approach to industrial and architectural abstraction. The execution must demonstrate her characteristic use of geometric forms, mechanical precision, and structural harmony. Every element should contribute to a sense of engineered space and revolutionary modernism, rendered with technological clarity and constructive force.",
  references: [
    "Popova's 'Spatial Force Construction' (1921) - for dynamic geometry",
    "Popova's 'Painterly Architectonic' (1917) - for spatial construction",
    "Popova's 'Air+Man+Space' (1912) - for revolutionary design",
    "Popova's 'Space-Force Construction' (1921) - for geometric tension",
    "Popova's 'Textile Design' (1923-24) - for industrial patterns",
    "Popova's 'Stage Set for The Magnanimous Cuckold' (1922) - for architectural space",
    "Popova's 'Construction with Planes' (1920) - for structural composition",
    "Popova's 'Spatial Organization' (1921) - for dynamic balance",
    "Popova's 'Linear Construction' (1921) - for geometric precision",
    "Popova's 'Working Clothes Designs' (1924) - for industrial aesthetic"
  ],
  avoidElements: [
    // Anti-Popova Elements
    "organic forms",
    "decorative elements",
    "naturalistic representation",
    "pictorial space",
    "emotional expression",
    "traditional perspective",
    "romantic aesthetics",
    "painterly effects",
    "atmospheric qualities",
    "narrative content",
    "illustrative details",
    "sentimental elements",
    "natural forms",
    "decorative patterns",
    "traditional composition",
    // Style Elements to Avoid
    "impressionist effects",
    "surrealist elements",
    "expressionist gesture",
    "romantic style",
    "naturalistic treatment",
    // General Elements to Avoid
    "emotional content",
    "decorative detail",
    "natural imagery",
    "traditional art",
    "pictorial representation"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Lyubov Popova's Constructivism, with industrial geometry and revolutionary design. Create a dynamic interpretation with ",
    prompt_suffix: ". Use Popova's characteristic geometric forms, mechanical precision, and structural harmony. Style of Spatial Force Construction and Painterly Architectonic.",
    negative_prompt: "organic, decorative, naturalistic, pictorial, emotional, traditional, romantic, painterly, atmospheric, narrative, illustrative, sentimental, natural",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 