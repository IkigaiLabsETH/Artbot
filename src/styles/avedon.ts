import { ArtDirection } from '../types/ArtDirection.js';

export const avedonStyle: ArtDirection = {
  styleEmphasis: [
    // Avedon's Distinctive Style
    "minimalist portraiture",
    "stark white background",
    "emotional intensity",
    "psychological revelation",
    "dramatic presence",
    "elegant simplicity",
    "fashion authority",
    "character exposure",
    "gestural power",
    "timeless elegance",
    "dynamic energy",
    "cultural iconography",
    "personal truth",
    "modernist clarity",
    "expressive movement"
  ],
  visualElements: [
    // Avedon's Visual Language
    "seamless background",
    "sharp detail",
    "dramatic contrast",
    "expressive gesture",
    "revealing pose",
    "facial intensity",
    "body language",
    "minimal props",
    "fashion elements",
    "cultural symbols",
    "emotional markers",
    "dynamic movement",
    "elegant lines",
    "textural detail",
    "spatial tension"
  ],
  colorPalette: [
    // Avedon's Classic Palette
    "pure white",
    "deep black",
    "silver tone",
    "fashion grey",
    "elegant shadow",
    "stark highlight",
    "modernist tone",
    "crisp contrast",
    "refined shade",
    "timeless monochrome"
  ],
  compositionGuidelines: [
    // Avedon's Compositional Approach
    "minimal setting",
    "dramatic isolation",
    "elegant framing",
    "psychological space",
    "gestural emphasis",
    "fashion awareness",
    "dynamic balance",
    "emotional proximity",
    "cultural context",
    "personal presence",
    "modernist clarity",
    "spatial purity",
    "character focus",
    "expressive tension",
    "timeless arrangement"
  ],
  moodAndTone: "Create a striking Avedon-style interpretation that embodies his minimalist approach to portraiture and fashion photography. The execution must demonstrate his characteristic ability to reveal the essence of subjects through stark simplicity and emotional intensity. Every element should contribute to a sense of timeless elegance and psychological revelation, rendered with modernist clarity and dramatic presence.",
  references: [
    "Avedon's 'Dovima with Elephants' (1955) - for fashion elegance",
    "Avedon's 'Ronald Fischer, Beekeeper' (1981) - for character revelation",
    "Avedon's 'Marilyn Monroe' (1957) - for psychological depth",
    "Avedon's 'The American West' series (1979-84) - for stark portraiture",
    "Avedon's 'Nastassja Kinski and the Serpent' (1981) - for iconic imagery",
    "Avedon's 'Ezra Pound' (1958) - for emotional intensity",
    "Avedon's 'The Beatles Portfolio' (1967) - for cultural documentation",
    "Avedon's 'Veruschka' series (1967) - for fashion movement",
    "Avedon's 'Andy Warhol and Members of the Factory' (1969) - for group dynamics",
    "Avedon's 'Samuel Beckett' (1969) - for minimalist power"
  ],
  avoidElements: [
    // Anti-Avedon Elements
    "cluttered backgrounds",
    "environmental context",
    "casual poses",
    "natural settings",
    "soft focus",
    "romantic blur",
    "decorative elements",
    "complex props",
    "busy compositions",
    "atmospheric effects",
    "candid moments",
    "documentary style",
    "street photography",
    "natural lighting",
    "casual atmosphere",
    // Style Elements to Avoid
    "photojournalistic approach",
    "environmental portraits",
    "lifestyle photography",
    "casual snapshots",
    "vernacular style",
    // General Elements to Avoid
    "uncontrolled settings",
    "natural backgrounds",
    "casual documentation",
    "environmental context",
    "spontaneous moments"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Richard Avedon's portrait photography, with minimalist backgrounds and psychological intensity. Create an elegant interpretation with ",
    prompt_suffix: ". Use Avedon's characteristic stark white background, sharp detail, and dramatic presence. Style of Dovima with Elephants and The American West series.",
    negative_prompt: "cluttered, environmental, casual, natural, soft, romantic, decorative, complex, busy, atmospheric, candid, documentary, street, uncontrolled, spontaneous",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 