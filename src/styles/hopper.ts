import { ArtDirection } from '../types/ArtDirection.js';

export const hopperStyle: ArtDirection = {
  styleEmphasis: [
    // Hopper's Distinctive Style
    "psychological realism",
    "urban solitude",
    "dramatic light and shadow",
    "architectural geometry",
    "emotional isolation",
    "contemplative atmosphere",
    "modern alienation",
    "stark compositional clarity",
    "cinematic framing",
    "quiet tension",
    "architectural detail",
    "psychological narrative",
    "american scene painting",
    "urban observation",
    "modern life meditation"
  ],
  visualElements: [
    // Hopper's Visual Language
    "strong diagonal light",
    "empty interior spaces",
    "urban architecture",
    "solitary figures",
    "large windows",
    "stark shadows",
    "geometric forms",
    "morning light",
    "evening scenes",
    "city storefronts",
    "empty restaurants",
    "hotel rooms",
    "office spaces",
    "gas stations",
    "coastal scenes"
  ],
  colorPalette: [
    // Hopper's Atmospheric Palette
    "early morning yellow",
    "late afternoon gold",
    "deep shadow blue",
    "architectural white",
    "urban grey",
    "warm sunlight",
    "cool shadow tones",
    "muted green",
    "brick red",
    "pale blue sky"
  ],
  compositionGuidelines: [
    // Hopper's Compositional Approach
    "strong geometric structure",
    "dramatic light angles",
    "architectural framing",
    "psychological space",
    "stark simplification",
    "careful observation",
    "cinematic viewpoint",
    "contemplative distance",
    "urban isolation",
    "geometric division",
    "architectural detail",
    "spatial tension",
    "modern emptiness",
    "precise perspective",
    "narrative framing"
  ],
  moodAndTone: "Create a contemplative Hopper-style interpretation that embodies his masterful observation of modern American life and urban solitude. The execution must demonstrate his characteristic use of light and shadow, architectural geometry, and psychological atmosphere. Every element should contribute to a sense of quiet isolation and modern alienation, rendered with his signature clarity and emotional resonance.",
  references: [
    "Hopper's 'Nighthawks' (1942) - for urban isolation and night scenes",
    "Hopper's 'Early Sunday Morning' (1930) - for architectural treatment",
    "Hopper's 'Room in New York' (1932) - for interior spaces",
    "Hopper's 'Office at Night' (1940) - for dramatic lighting",
    "Hopper's 'Morning Sun' (1952) - for solitary figures",
    "Hopper's 'Automat' (1927) - for psychological atmosphere",
    "Hopper's 'Gas' (1940) - for American landscape",
    "Hopper's 'New York Movie' (1939) - for interior lighting",
    "Hopper's 'House by the Railroad' (1925) - for architectural isolation",
    "Hopper's 'Cape Cod Morning' (1950) - for window scenes"
  ],
  avoidElements: [
    // Anti-Hopper Elements
    "busy scenes",
    "crowded spaces",
    "chaotic composition",
    "abstract forms",
    "expressionist distortion",
    "decorative elements",
    "romantic atmosphere",
    "sentimental treatment",
    "impressionist effects",
    "loose brushwork",
    "emotional excess",
    "narrative drama",
    "fantasy elements",
    "surreal distortion",
    "excessive detail",
    // Style Elements to Avoid
    "abstract expressionism",
    "impressionist technique",
    "cubist fragmentation",
    "surrealist elements",
    "pop art style",
    // General Elements to Avoid
    "emotional drama",
    "busy narrative",
    "decorative detail",
    "romantic mood",
    "fantasy elements"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Edward Hopper's American realism, with dramatic light and shadow and urban solitude. Create a contemplative interpretation with ",
    prompt_suffix: ". Use Hopper's characteristic architectural geometry, psychological atmosphere, and precise observation. Style of Nighthawks and Early Sunday Morning.",
    negative_prompt: "busy, crowded, chaotic, abstract, expressionist, decorative, romantic, sentimental, impressionist, loose, emotional, dramatic, fantasy, surreal",
    num_inference_steps: 40,
    guidance_scale: 11.0
  }
}; 