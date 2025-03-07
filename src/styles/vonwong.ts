import { ArtDirection } from '../types/ArtDirection.js';

export const vonWongStyle: ArtDirection = {
  styleEmphasis: [
    // Von Wong's Distinctive Style
    "epic scale",
    "environmental message",
    "surreal reality",
    "technical mastery",
    "dramatic staging",
    "social impact",
    "conceptual narrative",
    "impossible scenes",
    "environmental activism",
    "creative engineering",
    "visual spectacle",
    "conservation focus",
    "artistic innovation",
    "cultural commentary",
    "technical innovation"
  ],
  visualElements: [
    // Von Wong's Visual Language
    "epic lighting",
    "environmental elements",
    "impossible poses",
    "recycled materials",
    "dramatic scale",
    "natural wonders",
    "technical rigging",
    "conservation symbols",
    "human elements",
    "environmental context",
    "artistic engineering",
    "dramatic atmosphere",
    "social symbols",
    "natural phenomena",
    "creative technology"
  ],
  colorPalette: [
    // Von Wong's Epic Palette
    "dramatic blue",
    "environmental green",
    "ocean depth",
    "natural earth",
    "conservation gold",
    "dramatic red",
    "technical silver",
    "atmospheric tone",
    "elemental contrast",
    "natural highlight"
  ],
  compositionGuidelines: [
    // Von Wong's Compositional Approach
    "epic scale",
    "environmental context",
    "dramatic staging",
    "impossible angles",
    "technical precision",
    "natural integration",
    "conservation focus",
    "human element",
    "artistic engineering",
    "dramatic perspective",
    "social narrative",
    "creative rigging",
    "environmental harmony",
    "conceptual balance",
    "technical innovation"
  ],
  moodAndTone: "Create an epic Von Wong-style interpretation that embodies his innovative approach to environmental activism and technical mastery. The execution must demonstrate his characteristic ability to create impossible scenes with powerful messages through dramatic staging and creative engineering. Every element should contribute to a sense of epic scale and social impact, rendered with technical excellence and artistic vision.",
  references: [
    "Von Wong's 'Mermaids Hate Plastic' - for environmental activism",
    "Von Wong's 'Storm Chaser' - for epic scale",
    "Von Wong's 'Shark Shepherd' - for conservation message",
    "Von Wong's 'Battery Waterfall' - for recycling awareness",
    "Von Wong's 'Underwater Realm' - for technical innovation",
    "Von Wong's 'Desert Winds' - for dramatic staging",
    "Von Wong's 'E-Waste Crisis' - for social impact",
    "Von Wong's 'Strawpocalypse' - for environmental art",
    "Von Wong's 'Shark Paradise' - for ocean conservation",
    "Von Wong's 'Burning Man' - for creative engineering"
  ],
  avoidElements: [
    // Anti-Von Wong Elements
    "casual snapshots",
    "simple setups",
    "minimal production",
    "natural poses",
    "ordinary scenes",
    "basic lighting",
    "conventional angles",
    "standard techniques",
    "everyday moments",
    "documentary style",
    "candid capture",
    "traditional approach",
    "simple composition",
    "basic effects",
    "standard practice",
    // Style Elements to Avoid
    "snapshot aesthetic",
    "casual documentation",
    "simple staging",
    "conventional lighting",
    "basic technique",
    // General Elements to Avoid
    "ordinary approach",
    "simple execution",
    "basic production",
    "standard methods",
    "conventional practice"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Benjamin Von Wong's Hasselblad photography, with epic scale and environmental message. Create an impossible interpretation with ",
    prompt_suffix: ". Use Von Wong's characteristic technical mastery, dramatic staging, and conservation focus. Style of Mermaids Hate Plastic and Storm Chaser.",
    negative_prompt: "casual, simple, minimal, natural, ordinary, basic, conventional, standard, everyday, documentary, candid, traditional",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 