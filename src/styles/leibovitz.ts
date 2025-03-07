import { ArtDirection } from '../types/ArtDirection.js';

export const leibovitzStyle: ArtDirection = {
  styleEmphasis: [
    // Leibovitz's Distinctive Style
    "dramatic portraiture",
    "narrative staging",
    "celebrity intimacy",
    "theatrical lighting",
    "conceptual storytelling",
    "cultural iconography",
    "emotional resonance",
    "cinematic scale",
    "personal revelation",
    "artistic collaboration",
    "visual storytelling",
    "cultural commentary",
    "celebrity access",
    "dramatic presence",
    "iconic moments"
  ],
  visualElements: [
    // Leibovitz's Visual Language
    "dramatic lighting",
    "environmental context",
    "narrative props",
    "symbolic elements",
    "cultural references",
    "personal details",
    "theatrical staging",
    "emotional gestures",
    "iconic poses",
    "character elements",
    "costume design",
    "set decoration",
    "location significance",
    "atmospheric effects",
    "dramatic scale"
  ],
  colorPalette: [
    // Leibovitz's Dramatic Palette
    "theatrical black",
    "cinematic blue",
    "dramatic red",
    "moody shadow",
    "golden light",
    "atmospheric tone",
    "rich contrast",
    "emotional color",
    "narrative shade",
    "iconic highlight"
  ],
  compositionGuidelines: [
    // Leibovitz's Compositional Approach
    "dramatic framing",
    "narrative space",
    "theatrical staging",
    "emotional proximity",
    "cultural context",
    "iconic positioning",
    "character emphasis",
    "environmental scale",
    "symbolic arrangement",
    "personal perspective",
    "cinematic balance",
    "dramatic tension",
    "story focus",
    "cultural framing",
    "intimate distance"
  ],
  moodAndTone: "Create a powerful Leibovitz-style interpretation that embodies her theatrical approach to portrait photography and cultural documentation. The execution must demonstrate her characteristic ability to reveal both the iconic and intimate aspects of subjects through dramatic staging and lighting. Every element should contribute to a sense of narrative depth and emotional resonance, rendered with cinematic scale and personal insight.",
  references: [
    "Leibovitz's 'John Lennon and Yoko Ono' (1980) - for intimate portraiture",
    "Leibovitz's 'Whoopi Goldberg' (1984) - for conceptual portraiture",
    "Leibovitz's 'Queen Elizabeth II' (2007) - for formal portraiture",
    "Leibovitz's 'Demi Moore' (1991) - for controversial imagery",
    "Leibovitz's 'Keith Haring' (1986) - for artistic documentation",
    "Leibovitz's 'Meryl Streep' (1981) - for theatrical portraiture",
    "Leibovitz's 'Leonardo DiCaprio' (1997) - for celebrity access",
    "Leibovitz's 'American Olympic Athletes' (1996) - for athletic portraiture",
    "Leibovitz's 'Susan Sontag' (1989) - for personal intimacy",
    "Leibovitz's 'Mikhail Baryshnikov' (1990) - for movement capture"
  ],
  avoidElements: [
    // Anti-Leibovitz Elements
    "casual snapshots",
    "unplanned moments",
    "candid photography",
    "vernacular style",
    "snapshot aesthetic",
    "amateur approach",
    "documentary realism",
    "street photography",
    "found moments",
    "spontaneous capture",
    "technical imperfection",
    "casual composition",
    "uncontrolled lighting",
    "random framing",
    "accidental elements",
    // Style Elements to Avoid
    "photojournalistic style",
    "snapshot moments",
    "casual documentation",
    "unplanned scenes",
    "amateur aesthetic",
    // General Elements to Avoid
    "uncontrolled situations",
    "casual approach",
    "random documentation",
    "spontaneous moments",
    "technical flaws"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Annie Leibovitz's portrait photography, with dramatic staging and theatrical lighting. Create an iconic interpretation with ",
    prompt_suffix: ". Use Leibovitz's characteristic narrative approach, cultural references, and cinematic scale. Style of John Lennon and Yoko Ono and Whoopi Goldberg portraits.",
    negative_prompt: "casual, unplanned, candid, vernacular, amateur, documentary, street, found, spontaneous, imperfect, random, uncontrolled, accidental",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 