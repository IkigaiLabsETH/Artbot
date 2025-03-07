import { ArtDirection } from '../types/ArtDirection.js';

export const arbusStyle: ArtDirection = {
  styleEmphasis: [
    // Arbus's Distinctive Style
    "confrontational portraiture",
    "marginal subjects",
    "psychological intensity",
    "direct gaze",
    "social outsiders",
    "intimate observation",
    "unflinching honesty",
    "human peculiarity",
    "stark authenticity",
    "social documentation",
    "individual identity",
    "cultural margins",
    "human dignity",
    "psychological depth",
    "societal reflection"
  ],
  visualElements: [
    // Arbus's Visual Language
    "frontal poses",
    "direct eye contact",
    "natural environments",
    "personal spaces",
    "revealing details",
    "intimate distance",
    "social context",
    "character elements",
    "environmental portraits",
    "telling gestures",
    "domestic settings",
    "personal artifacts",
    "social markers",
    "cultural signifiers",
    "identity symbols"
  ],
  colorPalette: [
    // Arbus's Documentary Palette
    "stark black",
    "documentary grey",
    "intimate shadow",
    "personal light",
    "social tone",
    "domestic white",
    "psychological grey",
    "natural shadow",
    "cultural tone",
    "authentic highlight"
  ],
  compositionGuidelines: [
    // Arbus's Compositional Approach
    "direct framing",
    "psychological space",
    "intimate distance",
    "environmental context",
    "revealing placement",
    "social positioning",
    "character emphasis",
    "personal scale",
    "domestic framing",
    "cultural context",
    "identity focus",
    "social perspective",
    "human presence",
    "emotional space",
    "authentic positioning"
  ],
  moodAndTone: "Create a penetrating Arbus-style interpretation that embodies her unflinching approach to portraiture and social documentation. The execution must demonstrate her characteristic ability to reveal the extraordinary in the seemingly ordinary, with direct and intimate observation. Every element should contribute to a sense of psychological depth and human dignity, rendered with stark authenticity and empathetic observation.",
  references: [
    "Arbus's 'Child with Toy Hand Grenade in Central Park' (1962) - for psychological intensity",
    "Arbus's 'Identical Twins, Roselle, New Jersey' (1967) - for direct portraiture",
    "Arbus's 'Jewish Giant at Home with His Parents' (1967) - for social context",
    "Arbus's 'A Young Brooklyn Family Going for a Sunday Outing' (1966) - for cultural documentation",
    "Arbus's 'Puerto Rican Woman with Beauty Mark' (1965) - for individual dignity",
    "Arbus's 'Mexican Dwarf in His Hotel Room' (1970) - for intimate observation",
    "Arbus's 'A Family on Their Lawn One Sunday in Westchester' (1968) - for social commentary",
    "Arbus's 'Untitled (1)' (1970-71) - for human peculiarity",
    "Arbus's 'Woman with Pearl Necklace and Earrings' (1967) - for psychological depth",
    "Arbus's 'Boy with a Straw Hat Waiting to March in a Pro-War Parade' (1967) - for cultural identity"
  ],
  avoidElements: [
    // Anti-Arbus Elements
    "glamorous poses",
    "commercial aesthetics",
    "flattering angles",
    "idealized beauty",
    "social conformity",
    "superficial charm",
    "conventional beauty",
    "artificial perfection",
    "marketing appeal",
    "fashion aesthetic",
    "commercial polish",
    "social pretense",
    "artificial grace",
    "mainstream appeal",
    "conventional charm",
    // Style Elements to Avoid
    "romantic softness",
    "commercial gloss",
    "fashion posing",
    "beauty retouching",
    "glamour effects",
    // General Elements to Avoid
    "social conformity",
    "conventional beauty",
    "commercial appeal",
    "mainstream aesthetics",
    "artificial charm"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Diane Arbus's portrait photography, with direct observation and psychological depth. Create an unflinching interpretation with ",
    prompt_suffix: ". Use Arbus's characteristic frontal composition, natural environments, and penetrating observation. Style of Child with Toy Hand Grenade and Identical Twins.",
    negative_prompt: "glamorous, commercial, flattering, idealized, conformist, superficial, conventional, artificial, marketed, fashionable, polished, pretentious, mainstream",
    num_inference_steps: 40,
    guidance_scale: 11.5
  }
}; 