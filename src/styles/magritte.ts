import { ArtDirection } from '../types/ArtDirection.js';

export const magritteStyle: ArtDirection = {
  styleEmphasis: [
    // Magritte's Distinctive Style
    "philosophical surrealism",
    "precise photorealistic technique",
    "metaphysical questioning",
    "dreamlike clarity",
    "conceptual juxtaposition",
    "poetic surrealism",
    "mysterious atmosphere",
    "symbolic resonance",
    "paradoxical imagery",
    "clean technical execution",
    "enigmatic presence",
    "metaphysical stillness",
    "surreal logic",
    "precise object relationships",
    "contemplative composition"
  ],
  visualElements: [
    // Magritte's Visual Language
    "floating objects",
    "impossible scale relationships",
    "mysterious windows",
    "curtains and frames",
    "clouds and sky elements",
    "bowler hats",
    "men in suits",
    "birds and stones",
    "mirrors and reflections",
    "pipes and everyday objects",
    "architectural elements",
    "precise shadows",
    "clean surfaces",
    "metaphysical spaces",
    "surreal landscapes"
  ],
  colorPalette: [
    // Magritte's Refined Palette
    "deep sky blue",
    "crisp daylight blue",
    "clean grey tones",
    "pure black",
    "pristine white",
    "subtle earth tones",
    "clear cloud white",
    "precise shadow tones",
    "clean highlight blue",
    "pure neutral tones"
  ],
  compositionGuidelines: [
    // Magritte's Compositional Approach
    "perfect central positioning",
    "clean spatial organization",
    "precise object placement",
    "balanced surreal elements",
    "clear figure-ground relationship",
    "metaphysical depth",
    "enigmatic framing",
    "philosophical staging",
    "precise symmetry",
    "contemplative space",
    "clean compositional lines",
    "surreal spatial logic",
    "careful object isolation",
    "mysterious depth",
    "paradoxical perspective"
  ],
  moodAndTone: "Create a precise Magritte-style surrealist interpretation that embodies his philosophical questioning of reality. The execution must demonstrate his characteristic pristine technique and conceptual depth. Every element should contribute to a sense of metaphysical mystery, rendered with his signature clean, dreamlike clarity.",
  references: [
    "Magritte's 'The Son of Man' (1964) - for mysterious presence",
    "Magritte's 'The False Mirror' (1929) - for surreal eye treatment",
    "Magritte's 'The Treachery of Images' (1929) - for conceptual depth",
    "Magritte's 'The Empire of Light' (1953-54) - for paradoxical light",
    "Magritte's 'The Human Condition' (1933) - for metaphysical space",
    "Magritte's 'Time Transfixed' (1938) - for surreal logic",
    "Magritte's 'The Blank Signature' (1965) - for clean execution",
    "Magritte's 'The Key to Dreams' (1930) - for symbolic relationships",
    "Magritte's 'Personal Values' (1952) - for scale relationships",
    "Magritte's 'The Castle of the Pyrenees' (1959) - for impossible juxtaposition"
  ],
  avoidElements: [
    // Anti-Magritte Elements
    "expressionistic effects",
    "loose brushwork",
    "textural experimentation",
    "abstract forms",
    "gestural marks",
    "emotional expression",
    "chaotic composition",
    "random elements",
    "aggressive distortion",
    "messy technique",
    "imperfect execution",
    "rough surfaces",
    "visible brushstrokes",
    "painterly effects",
    "spontaneous elements",
    // Style Elements to Avoid
    "impressionistic style",
    "abstract expressionism",
    "cubist fragmentation",
    "fauvist color",
    "pointillist technique",
    // General Elements to Avoid
    "emotional drama",
    "dynamic movement",
    "temporal effects",
    "narrative action",
    "decorative elements"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of René Magritte's surrealism, with pristine execution and philosophical depth. Create a surrealist interpretation with ",
    prompt_suffix: ". Use Magritte's characteristic clean technique, metaphysical questioning, and dreamlike clarity. Style of The Son of Man and The Empire of Light.",
    negative_prompt: "expressionistic, loose, textural, abstract, gestural, emotional, chaotic, random, aggressive, messy, imperfect, rough, visible brushstrokes, painterly",
    num_inference_steps: 40,
    guidance_scale: 10.0
  }
}; 