import { ArtDirection } from '../types/ArtDirection.js';

export const bourdinStyle: ArtDirection = {
  styleEmphasis: [
    // Bourdin's Distinctive Style
    "provocative fashion surrealism",
    "high-gloss commercial aesthetic",
    "dramatic narrative tension",
    "theatrical staging",
    "bold color saturation",
    "erotic suggestion",
    "mysterious storytelling",
    "luxurious surface quality",
    "cinematic drama",
    "psychological intensity",
    "fetishistic detail",
    "radical cropping",
    "glamorous artifice",
    "seductive discomfort",
    "sophisticated provocation"
  ],
  visualElements: [
    // Bourdin's Visual Language
    "dramatic lighting",
    "saturated color fields",
    "fragmented bodies",
    "luxury objects",
    "high heels and legs",
    "mirror reflections",
    "blood-red accents",
    "mannequin elements",
    "fashion props",
    "glossy surfaces",
    "theatrical shadows",
    "compressed space",
    "partial figures",
    "dramatic poses",
    "architectural frames"
  ],
  colorPalette: [
    // Bourdin's Bold Palette
    "blood red",
    "electric blue",
    "deep black",
    "hot pink",
    "acid green",
    "rich burgundy",
    "metallic silver",
    "deep purple",
    "vibrant yellow",
    "glossy white"
  ],
  compositionGuidelines: [
    // Bourdin's Compositional Approach
    "radical cropping",
    "dramatic framing",
    "compressed space",
    "theatrical staging",
    "geometric precision",
    "dynamic tension",
    "bold negative space",
    "diagonal energy",
    "asymmetrical balance",
    "psychological framing",
    "dramatic scale",
    "spatial compression",
    "edge tension",
    "provocative angles",
    "narrative framing"
  ],
  moodAndTone: "Create a provocative Bourdin-style fashion interpretation that embodies his revolutionary approach to commercial imagery. The execution must demonstrate his characteristic high-gloss aesthetic and psychological tension. Every element should contribute to a sense of seductive unease, rendered with his signature theatrical drama and sophisticated provocation.",
  references: [
    "Bourdin's Charles Jourdan campaigns (1970s) - for theatrical staging",
    "Bourdin's Vogue Paris editorials - for provocative narrative",
    "Bourdin's Pentax Calendar (1980) - for color saturation",
    "Bourdin's Bloomingdale's catalog (1976) - for radical cropping",
    "Bourdin's French Vogue covers - for dramatic composition",
    "Bourdin's Roland Pierre campaigns - for psychological tension",
    "Bourdin's Versace advertisements - for luxurious surfaces",
    "Bourdin's Chanel beauty shots - for glamorous artifice",
    "Bourdin's Issey Miyake series - for geometric precision",
    "Bourdin's self-portraits - for mysterious narrative"
  ],
  avoidElements: [
    // Anti-Bourdin Elements
    "natural lighting",
    "casual poses",
    "documentary style",
    "candid moments",
    "soft focus",
    "gentle transitions",
    "muted colors",
    "traditional composition",
    "comfortable spaces",
    "relaxed atmosphere",
    "natural gestures",
    "organic flow",
    "conventional beauty",
    "predictable framing",
    "safe compositions",
    // Style Elements to Avoid
    "impressionistic effects",
    "painterly technique",
    "abstract expression",
    "romantic softness",
    "pastoral scenes",
    // General Elements to Avoid
    "conservative approach",
    "traditional harmony",
    "comfortable viewing",
    "expected relationships",
    "conventional narrative"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Guy Bourdin's fashion photography, with theatrical drama and provocative staging. Create a high-fashion interpretation with ",
    prompt_suffix: ". Use Bourdin's characteristic saturated colors, radical cropping, and psychological tension. Style of his Charles Jourdan campaigns and Vogue Paris editorials.",
    negative_prompt: "natural, casual, documentary, candid, soft, gentle, muted, traditional, comfortable, relaxed, conventional, safe, predictable, conservative",
    num_inference_steps: 40,
    guidance_scale: 11.0
  }
}; 