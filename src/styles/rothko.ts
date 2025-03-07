import { ArtDirection } from '../types/ArtDirection.js';

export const rothkoStyle: ArtDirection = {
  styleEmphasis: [
    // Rothko's Distinctive Style
    "color field abstraction",
    "luminous rectangles",
    "floating color planes",
    "atmospheric depth",
    "spiritual transcendence",
    "emotional resonance",
    "subtle color transitions",
    "meditative presence",
    "ethereal layering",
    "chromatic intensity",
    "contemplative space",
    "color relationships",
    "painterly abstraction",
    "spiritual expression",
    "psychological depth"
  ],
  visualElements: [
    // Rothko's Visual Language
    "soft-edged rectangles",
    "floating color blocks",
    "translucent layers",
    "atmospheric veils",
    "luminous surfaces",
    "horizontal bands",
    "feathered edges",
    "color field divisions",
    "subtle gradients",
    "ethereal boundaries",
    "glowing forms",
    "layered transparency",
    "diffused light",
    "color saturation",
    "spatial depth"
  ],
  colorPalette: [
    // Rothko's Emotional Palette
    "deep maroon",
    "luminous orange",
    "dark crimson",
    "ethereal blue",
    "rich brown",
    "glowing yellow",
    "deep purple",
    "intense black",
    "vibrant red",
    "mysterious green"
  ],
  compositionGuidelines: [
    // Rothko's Compositional Approach
    "stacked rectangles",
    "floating forms",
    "vertical orientation",
    "balanced proportions",
    "atmospheric space",
    "subtle transitions",
    "layered transparency",
    "spiritual presence",
    "meditative structure",
    "color relationships",
    "ethereal balance",
    "psychological space",
    "contemplative harmony",
    "emotional resonance",
    "transcendent composition"
  ],
  moodAndTone: "Create a profound Rothko-style color field interpretation that embodies his pursuit of spiritual and emotional transcendence through pure color relationships. The execution must demonstrate his characteristic luminous rectangles and atmospheric depth. Every element should contribute to a sense of meditative presence and psychological resonance, rendered with subtle transitions and ethereal layering.",
  references: [
    "Rothko's 'Orange and Yellow' (1956) - for luminous color relationships",
    "Rothko's 'Four Darks in Red' (1958) - for deep emotional resonance",
    "Rothko's 'Blue and Grey' (1962) - for atmospheric depth",
    "Rothko's 'Black on Maroon' (1958) - for spiritual presence",
    "Rothko's 'White Center' (1950) - for floating forms",
    "Rothko's 'No. 61 (Rust and Blue)' (1953) - for color intensity",
    "Rothko's 'Ochre and Red on Red' (1954) - for layered transparency",
    "Rothko's 'Green and Tangerine on Red' (1956) - for chromatic balance",
    "Rothko's 'Black, Red and Black' (1968) - for psychological depth",
    "Rothko Chapel murals (1964-67) - for spiritual meditation"
  ],
  avoidElements: [
    // Anti-Rothko Elements
    "hard edges",
    "geometric precision",
    "representational forms",
    "linear elements",
    "sharp contrasts",
    "decorative patterns",
    "narrative content",
    "pictorial imagery",
    "textural effects",
    "gestural marks",
    "graphic elements",
    "defined shapes",
    "illustrative details",
    "mechanical technique",
    "commercial aesthetic",
    // Style Elements to Avoid
    "pop art elements",
    "minimalist reduction",
    "surrealist imagery",
    "cubist fragmentation",
    "expressionist gesture",
    // General Elements to Avoid
    "representational imagery",
    "narrative elements",
    "decorative effects",
    "commercial style",
    "illustrative approach"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Mark Rothko's color field painting, with luminous rectangles and atmospheric depth. Create a meditative interpretation with ",
    prompt_suffix: ". Use Rothko's characteristic floating color planes, subtle transitions, and spiritual presence. Style of Orange and Yellow and the Rothko Chapel murals.",
    negative_prompt: "hard edge, geometric, representational, linear, sharp, decorative, narrative, pictorial, textural, gestural, graphic, mechanical, commercial, illustrative",
    num_inference_steps: 40,
    guidance_scale: 11.0
  }
}; 