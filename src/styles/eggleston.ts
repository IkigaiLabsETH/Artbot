import { ArtDirection } from '../types/ArtDirection.js';

export const egglestonStyle: ArtDirection = {
  styleEmphasis: [
    // Eggleston's Distinctive Style
    "democratic vision",
    "saturated color",
    "everyday sublime",
    "southern aesthetic",
    "vernacular beauty",
    "found composition",
    "banal transcendence",
    "color intensity",
    "ordinary magic",
    "americana details",
    "chromatic drama",
    "quotidian poetry",
    "democratic forest",
    "visual democracy",
    "mundane revelation"
  ],
  visualElements: [
    // Eggleston's Visual Language
    "vivid colors",
    "everyday objects",
    "americana scenes",
    "domestic details",
    "found arrangements",
    "ordinary moments",
    "southern light",
    "cultural artifacts",
    "vernacular signs",
    "local architecture",
    "consumer objects",
    "automotive details",
    "suburban scenes",
    "regional markers",
    "commercial elements"
  ],
  colorPalette: [
    // Eggleston's Saturated Palette
    "dye-transfer red",
    "southern sky blue",
    "americana yellow",
    "suburban green",
    "neon accent",
    "chrome highlight",
    "vintage pastel",
    "commercial color",
    "local tone",
    "saturated primary"
  ],
  compositionGuidelines: [
    // Eggleston's Compositional Approach
    "democratic framing",
    "found geometry",
    "color relationship",
    "everyday angle",
    "vernacular view",
    "spatial tension",
    "chromatic balance",
    "diagonal energy",
    "object focus",
    "cultural context",
    "regional perspective",
    "domestic scale",
    "commercial space",
    "local detail",
    "americana composition"
  ],
  moodAndTone: "Create a penetrating Eggleston-style interpretation that embodies his democratic approach to color photography and the elevation of everyday scenes. The execution must demonstrate his characteristic ability to reveal the extraordinary in the ordinary through saturated color and precise composition. Every element should contribute to a sense of vernacular beauty and chromatic intensity, rendered with democratic vision and poetic observation.",
  references: [
    "Eggleston's 'The Red Ceiling' (1973) - for color intensity",
    "Eggleston's 'Tricycle' (1970) - for perspective and ordinary subjects",
    "Eggleston's 'Greenwood, Mississippi' (1973) - for southern aesthetic",
    "Eggleston's 'Los Alamos' series (1965-74) - for americana documentation",
    "Eggleston's 'Memphis' series (1969-70) - for local culture",
    "Eggleston's 'Democratic Forest' series (1983-86) - for democratic vision",
    "Eggleston's 'Paris' series (2006-08) - for found composition",
    "Eggleston's 'Stranded in Canton' (1973) - for southern atmosphere",
    "Eggleston's 'Election Eve' (1976) - for vernacular documentation",
    "Eggleston's 'Chromes' series (1969-74) - for color mastery"
  ],
  avoidElements: [
    // Anti-Eggleston Elements
    "black and white",
    "staged scenes",
    "studio settings",
    "artificial lighting",
    "fashion aesthetic",
    "commercial gloss",
    "dramatic posing",
    "controlled environments",
    "classical composition",
    "artistic pretense",
    "technical perfection",
    "formal arrangement",
    "stylized effects",
    "conceptual abstraction",
    "manufactured drama",
    // Style Elements to Avoid
    "monochrome treatment",
    "studio manipulation",
    "artificial staging",
    "formal portraiture",
    "technical precision",
    // General Elements to Avoid
    "controlled settings",
    "artistic pretension",
    "commercial polish",
    "classical beauty",
    "manufactured scenes"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of William Eggleston's color photography, with democratic vision and saturated hues. Create a vernacular interpretation with ",
    prompt_suffix: ". Use Eggleston's characteristic color intensity, everyday subjects, and found composition. Style of The Red Ceiling and Democratic Forest.",
    negative_prompt: "black and white, staged, studio, artificial, fashion, commercial, dramatic, controlled, classical, pretentious, technical, formal, stylized, conceptual, manufactured",
    num_inference_steps: 40,
    guidance_scale: 11.5
  }
}; 