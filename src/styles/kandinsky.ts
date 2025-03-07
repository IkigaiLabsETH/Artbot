import { ArtDirection } from '../types/ArtDirection.js';

export const kandinskyStyle: ArtDirection = {
  styleEmphasis: [
    // Kandinsky's Distinctive Style
    "spiritual abstraction",
    "musical synesthesia",
    "dynamic composition",
    "geometric symbolism",
    "organic abstraction",
    "rhythmic forms",
    "color theory expression",
    "emotional geometry",
    "cosmic harmony",
    "spiritual resonance",
    "intuitive composition",
    "abstract expressionism",
    "symbolic forms",
    "musical visualization",
    "metaphysical space"
  ],
  visualElements: [
    // Kandinsky's Visual Language
    "floating circles",
    "dynamic triangles",
    "sweeping lines",
    "geometric shapes",
    "organic forms",
    "musical notations",
    "intersecting planes",
    "radiating lines",
    "cosmic points",
    "rhythmic patterns",
    "abstract symbols",
    "flowing curves",
    "spiritual motifs",
    "energetic marks",
    "dynamic movement"
  ],
  colorPalette: [
    // Kandinsky's Synesthetic Palette
    "resonant yellow",
    "spiritual blue",
    "dynamic red",
    "mystical purple",
    "vibrant orange",
    "cosmic black",
    "ethereal white",
    "energetic green",
    "harmonic gold",
    "transcendent violet"
  ],
  compositionGuidelines: [
    // Kandinsky's Compositional Approach
    "musical rhythm",
    "dynamic balance",
    "spiritual harmony",
    "geometric orchestration",
    "intuitive arrangement",
    "cosmic organization",
    "energetic flow",
    "symbolic placement",
    "metaphysical space",
    "rhythmic movement",
    "abstract narrative",
    "emotional mapping",
    "spiritual geometry",
    "synesthetic composition",
    "dynamic tension"
  ],
  moodAndTone: "Create a spiritually resonant Kandinsky-style interpretation that embodies his pioneering approach to abstract art and its connection to music and spirituality. The execution must demonstrate his characteristic synthesis of geometric and organic forms with dynamic movement and color relationships. Every element should contribute to a sense of cosmic harmony and spiritual resonance, rendered with emotional intensity and rhythmic energy.",
  references: [
    "Kandinsky's 'Composition VIII' (1923) - for geometric abstraction",
    "Kandinsky's 'Yellow-Red-Blue' (1925) - for color relationships",
    "Kandinsky's 'Several Circles' (1926) - for cosmic harmony",
    "Kandinsky's 'On White II' (1923) - for dynamic composition",
    "Kandinsky's 'Composition X' (1939) - for spiritual abstraction",
    "Kandinsky's 'Points' (1920) - for geometric elements",
    "Kandinsky's 'Blue Segment' (1921) - for color theory",
    "Kandinsky's 'Black Lines' (1913) - for linear dynamics",
    "Kandinsky's 'Composition VII' (1913) - for complex harmony",
    "Kandinsky's 'Small Worlds' (1922) - for cosmic elements"
  ],
  avoidElements: [
    // Anti-Kandinsky Elements
    "rigid geometry",
    "static composition",
    "photographic realism",
    "literal representation",
    "decorative patterns",
    "symmetrical balance",
    "commercial aesthetic",
    "narrative illustration",
    "conventional perspective",
    "traditional space",
    "mechanical precision",
    "mundane subjects",
    "realistic rendering",
    "fixed viewpoint",
    "literal imagery",
    // Style Elements to Avoid
    "pop art elements",
    "minimalist reduction",
    "photorealistic detail",
    "academic technique",
    "commercial style",
    // General Elements to Avoid
    "literal narrative",
    "conventional space",
    "decorative effects",
    "traditional perspective",
    "realistic representation"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Vasily Kandinsky's pioneering abstraction, with spiritual resonance and musical synesthesia. Create a dynamic interpretation with ",
    prompt_suffix: ". Use Kandinsky's characteristic geometric and organic forms, rhythmic movement, and cosmic harmony. Style of Composition VIII and Several Circles.",
    negative_prompt: "rigid, static, realistic, literal, decorative, symmetrical, commercial, narrative, conventional, mechanical, mundane, photorealistic, traditional",
    num_inference_steps: 40,
    guidance_scale: 11.0
  }
}; 