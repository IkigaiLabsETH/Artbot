import { ArtDirection } from '../types/ArtDirection.js';

export const warholStyle: ArtDirection = {
  styleEmphasis: [
    // Warhol's Distinctive Style
    "bold pop art aesthetic",
    "commercial imagery appropriation",
    "repetitive grid patterns",
    "high-contrast screen printing effect",
    "flat color blocks",
    "mass media reproduction",
    "celebrity portraiture",
    "consumer culture iconography",
    "mechanical reproduction aesthetic",
    "simplified form reduction",
    "bold graphic treatment",
    "advertising aesthetic",
    "cultural icon transformation",
    "mass production style",
    "commercial art elevation"
  ],
  visualElements: [
    // Warhol's Visual Language
    "repeated image patterns",
    "bold color overlays",
    "halftone dot patterns",
    "screen print effects",
    "photographic source material",
    "simplified portraits",
    "consumer product imagery",
    "newspaper photo treatment",
    "celebrity faces",
    "commercial packaging",
    "advertising imagery",
    "mass media elements",
    "popular culture icons",
    "brand logos and symbols",
    "mechanical reproduction marks"
  ],
  colorPalette: [
    // Warhol's Signature Palette
    "hot pink",
    "electric blue",
    "cadmium yellow",
    "neon orange",
    "metallic silver",
    "bright turquoise",
    "vibrant red",
    "acid green",
    "deep purple",
    "fluorescent colors"
  ],
  compositionGuidelines: [
    // Warhol's Compositional Approach
    "grid-based repetition",
    "symmetrical arrangement",
    "commercial layout structure",
    "advertising composition",
    "mechanical reproduction",
    "systematic organization",
    "serial imagery",
    "graphic design principles",
    "photographic foundation",
    "mass media format",
    "screen print structure",
    "promotional layout",
    "celebrity portrait framing",
    "product shot composition",
    "print media arrangement"
  ],
  moodAndTone: "Create a bold Warhol-style pop art interpretation that embodies his revolutionary approach to commercial imagery and mass production aesthetics. The execution must demonstrate his characteristic screen printing effect and use of bold, artificial colors. Every element should be treated with his signature mechanical reproduction style, emphasizing repetition, popular culture, and the aesthetics of mass media and advertising.",
  references: [
    "Warhol's 'Marilyn Diptych' (1962) - for celebrity portraiture and color",
    "Warhol's 'Campbell's Soup Cans' (1962) - for commercial imagery",
    "Warhol's 'Eight Elvises' (1963) - for repetition and silver",
    "Warhol's 'Flowers' (1964) - for screen printing technique",
    "Warhol's 'Shot Sage Blue Marilyn' (1964) - for iconic portraiture",
    "Warhol's 'Brillo Boxes' (1964) - for consumer product treatment",
    "Warhol's 'Self-Portrait' (1966) - for photographic treatment",
    "Warhol's 'Cow Wallpaper' (1966) - for pattern repetition",
    "Warhol's 'Mao' (1972) - for political imagery",
    "Warhol's 'Dollar Sign' (1981) - for commercial symbolism"
  ],
  avoidElements: [
    // Anti-Warhol Elements
    "painterly brushwork",
    "natural colors",
    "traditional techniques",
    "expressive gestures",
    "abstract expressionism",
    "emotional depth",
    "realistic rendering",
    "subtle gradients",
    "naturalistic treatment",
    "handmade qualities",
    "organic textures",
    "personal expression",
    "artistic spontaneity",
    "natural materials",
    "traditional art materials",
    // Style Elements to Avoid
    "impressionistic effects",
    "abstract expressionist gestures",
    "cubist fragmentation",
    "surrealist elements",
    "romantic style",
    // General Elements to Avoid
    "subtle effects",
    "natural phenomena",
    "emotional expression",
    "traditional art values",
    "artistic originality"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Andy Warhol's pop art, with bold screen printing effects and commercial imagery. Create a pop art interpretation with ",
    prompt_suffix: ". Use Warhol's characteristic flat colors, mechanical reproduction aesthetic, and bold graphic treatment. Style of Marilyn Diptych and Campbell's Soup Cans.",
    negative_prompt: "painterly, natural, expressive, abstract expressionism, emotional, realistic, subtle, organic, handmade, traditional art, original, unique",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 