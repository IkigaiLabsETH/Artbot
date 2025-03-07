import { ArtDirection } from '../types/ArtDirection.js';

export const beepleStyle: ArtDirection = {
  styleEmphasis: [
    // Beeple's Distinctive Style
    "digital surrealism",
    "sci-fi dystopia",
    "pop culture commentary",
    "technological integration",
    "monumental scale",
    "daily creation rhythm",
    "political satire",
    "futuristic landscapes",
    "digital maximalism",
    "hyper-detailed rendering",
    "contemporary critique",
    "cinematic composition",
    "cultural mashup",
    "technological decay",
    "apocalyptic vision"
  ],
  visualElements: [
    // Beeple's Visual Language
    "massive structures",
    "floating objects",
    "holographic displays",
    "dystopian cities",
    "giant robots",
    "corporate logos",
    "political figures",
    "glowing elements",
    "mechanical beings",
    "digital artifacts",
    "pop culture icons",
    "environmental destruction",
    "futuristic vehicles",
    "abstract geometry",
    "technological debris"
  ],
  colorPalette: [
    // Beeple's Digital Palette
    "neon blue",
    "electric pink",
    "cyber green",
    "digital purple",
    "industrial grey",
    "holographic shimmer",
    "toxic waste green",
    "dystopian orange",
    "matrix black",
    "glitch white"
  ],
  compositionGuidelines: [
    // Beeple's Compositional Approach
    "monumental scale",
    "central focal point",
    "depth through atmosphere",
    "layered complexity",
    "dramatic perspective",
    "environmental storytelling",
    "technological integration",
    "cultural juxtaposition",
    "structural hierarchy",
    "atmospheric fog",
    "volumetric lighting",
    "digital distortion",
    "geometric foundation",
    "forced perspective",
    "environmental scale"
  ],
  moodAndTone: "Create a Beeple-style digital artwork that combines technological dystopia with contemporary cultural commentary. The piece should feature monumental scale and hyper-detailed elements while incorporating relevant pop culture or political references. Every component should contribute to a sense of digital maximalism and future shock, rendered with his signature blend of the sublime and the satirical.",
  references: [
    "Beeple's 'Everydays' series - for daily creative rhythm",
    "Beeple's 'Human One' - for physical-digital integration",
    "Beeple's 'Zero Day' - for dystopian atmosphere",
    "Beeple's 'Abundance' - for technological commentary",
    "Beeple's 'First 5000 Days' - for digital art evolution",
    "Beeple's 'Corporate Headquarters' - for architectural scale",
    "Beeple's 'Political Works' - for satirical approach",
    "Beeple's 'Manifest Destiny' - for environmental themes",
    "Beeple's 'Tech Giants' - for corporate critique",
    "Beeple's 'Pandemic Works' - for contemporary response"
  ],
  avoidElements: [
    // Anti-Beeple Elements
    "minimalist design",
    "traditional media simulation",
    "natural realism",
    "historical accuracy",
    "subtle composition",
    "pastoral scenes",
    "romantic imagery",
    "abstract expressionism",
    "vintage effects",
    "painterly technique",
    "delicate details",
    "classical composition",
    "organic forms",
    "traditional perspective",
    "muted colors",
    // Style Elements to Avoid
    "impressionist technique",
    "classical realism",
    "art nouveau style",
    "minimalist aesthetic",
    "watercolor effects",
    // General Elements to Avoid
    "subtle lighting",
    "traditional framing",
    "natural color schemes",
    "historical settings",
    "conventional scale"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Beeple's digital art, with monumental scale and dystopian atmosphere. Create a hyper-detailed interpretation with ",
    prompt_suffix: ". Use Beeple's characteristic technological elements, pop culture references, and maximalist composition. Style of Everydays and Zero Day.",
    negative_prompt: "minimal, traditional, natural, historical, subtle, pastoral, romantic, abstract, vintage, painterly, delicate, classical, organic, conventional",
    num_inference_steps: 50,
    guidance_scale: 12.0
  }
}; 