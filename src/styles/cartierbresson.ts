import { ArtDirection } from '../types/ArtDirection.js';

export const cartierBressonStyle: ArtDirection = {
  styleEmphasis: [
    // Cartier-Bresson's Distinctive Style
    "decisive moment",
    "geometric composition",
    "candid observation",
    "street photography",
    "humanist perspective",
    "visual geometry",
    "spontaneous capture",
    "narrative timing",
    "compositional harmony",
    "photographic intuition",
    "dynamic balance",
    "human condition",
    "urban observation",
    "natural authenticity",
    "poetic realism"
  ],
  visualElements: [
    // Cartier-Bresson's Visual Language
    "precise framing",
    "geometric patterns",
    "human gestures",
    "urban scenes",
    "natural light",
    "decisive action",
    "architectural elements",
    "street life",
    "candid moments",
    "dynamic movement",
    "shadow play",
    "environmental context",
    "human interaction",
    "spatial relationships",
    "urban geometry"
  ],
  colorPalette: [
    // Cartier-Bresson's Classic Palette
    "rich black",
    "silver grey",
    "deep shadow",
    "bright highlight",
    "street tone",
    "architectural white",
    "urban grey",
    "natural light",
    "shadow black",
    "documentary tone"
  ],
  compositionGuidelines: [
    // Cartier-Bresson's Compositional Approach
    "golden ratio",
    "geometric balance",
    "dynamic tension",
    "decisive timing",
    "natural framing",
    "visual rhythm",
    "spatial harmony",
    "human scale",
    "architectural lines",
    "street perspective",
    "intuitive composition",
    "moment capture",
    "environmental context",
    "urban geometry",
    "narrative framing"
  ],
  moodAndTone: "Create a precise Cartier-Bresson-style interpretation that embodies his mastery of the decisive moment and geometric composition. The execution must demonstrate his characteristic ability to capture spontaneous human moments within perfectly balanced frames. Every element should contribute to a sense of visual harmony and narrative timing, rendered with documentary authenticity and poetic observation.",
  references: [
    "Cartier-Bresson's 'Behind the Gare Saint-Lazare' (1932) - for decisive moment",
    "Cartier-Bresson's 'Hyères, France' (1932) - for geometric composition",
    "Cartier-Bresson's 'Rue Mouffetard' (1954) - for human joy",
    "Cartier-Bresson's 'Seville' (1933) - for geometric patterns",
    "Cartier-Bresson's 'Valencia' (1933) - for visual rhythm",
    "Cartier-Bresson's 'Athens' (1953) - for architectural geometry",
    "Cartier-Bresson's 'Shanghai' (1948) - for street life",
    "Cartier-Bresson's 'Aquila' (1951) - for human scale",
    "Cartier-Bresson's 'Brussels' (1932) - for urban observation",
    "Cartier-Bresson's 'Madrid' (1933) - for shadow play"
  ],
  avoidElements: [
    // Anti-Cartier-Bresson Elements
    "posed portraits",
    "artificial lighting",
    "digital effects",
    "staged scenes",
    "studio settings",
    "heavy manipulation",
    "forced composition",
    "artificial color",
    "dramatic filters",
    "unnatural elements",
    "commercial aesthetic",
    "excessive editing",
    "artificial drama",
    "technical perfection",
    "controlled situations",
    // Style Elements to Avoid
    "HDR effects",
    "heavy processing",
    "artificial bokeh",
    "extreme contrast",
    "digital artifacts",
    // General Elements to Avoid
    "artificial perfection",
    "technical manipulation",
    "studio control",
    "digital enhancement",
    "post-processing effects"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Henri Cartier-Bresson's street photography, with decisive moment capture and geometric composition. Create a spontaneous interpretation with ",
    prompt_suffix: ". Use Cartier-Bresson's characteristic framing, natural light, and human observation. Style of Behind the Gare Saint-Lazare and Hyères, France.",
    negative_prompt: "posed, artificial, digital, staged, studio, manipulated, forced, unnatural, commercial, technical, controlled, processed, enhanced, perfect",
    num_inference_steps: 40,
    guidance_scale: 11.0
  }
}; 