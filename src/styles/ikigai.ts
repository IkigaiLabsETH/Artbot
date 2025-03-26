import { ArtDirection } from '../types/ArtDirection.js';

export const ikigaiStyle: ArtDirection = {
  styleEmphasis: [
    // Primary Margritte with Bourdin and Kandinsky influences
    "metaphysical surrealism",
    "paradoxical realism",
    "symbolic juxtaposition",
    "mysterious atmosphere",
    "theatrical staging",
    "geometric spirituality",
    "poetic displacement",
    "dreamlike composition",
    "philosophical questioning",
    "spatial illusion",
    "dramatic tension",
    "harmonious abstraction",
    "symbolic resonance",
    "temporal displacement",
    "spiritual geometry"
  ],
  visualElements: [
    // Visual Language Elements
    "floating objects",
    "impossible windows",
    "mysterious doorways",
    "dramatic shadows",
    "geometric forms",
    "billowing curtains",
    "clouded skies",
    "mirror reflections",
    "levitating stones",
    "spiritual symbols",
    "theatrical lighting",
    "geometric patterns",
    "surreal landscapes",
    "metaphysical props",
    "symbolic objects"
  ],
  colorPalette: [
    // Margritte-Bourdin-Kandinsky Fusion
    "belgian sky blue",
    "deep twilight",
    "dramatic red",
    "spiritual yellow",
    "metaphysical green",
    "mysterious grey",
    "theatrical gold",
    "surreal azure",
    "geometric ultramarine",
    "philosophical brown",
    "symbolic white",
    "mystical violet"
  ],
  compositionGuidelines: [
    // Compositional Principles
    "paradoxical placement",
    "dramatic staging",
    "geometric balance",
    "mysterious depth",
    "symbolic framing",
    "theatrical lighting",
    "spiritual harmony",
    "surreal scale",
    "metaphysical perspective",
    "poetic arrangement",
    "dramatic tension",
    "geometric rhythm",
    "philosophical space",
    "temporal discord",
    "symbolic resonance"
  ],
  moodAndTone: "Create a deeply surreal and metaphysical atmosphere in Margritte's tradition, where familiar objects become mysterious through paradoxical placement and symbolic resonance. Incorporate Bourdin's dramatic staging and theatrical lighting to enhance the narrative tension, while using Kandinsky's geometric spirituality to add harmonic structure. Each piece should challenge perception through impossible juxtapositions while maintaining a poetic and philosophical depth that questions reality itself.",
  references: [
    // Master Influences
    "Margritte's metaphysical paradoxes and symbolic imagery",
    "Margritte's mysterious atmospheres and impossible scenarios",
    "Bourdin's dramatic staging and theatrical lighting",
    "Bourdin's narrative tension and composition",
    "Kandinsky's spiritual geometry and harmony",
    "Kandinsky's dynamic forms and color relationships",
    "Margritte's window motifs and sky treatments",
    "Margritte's displacement of ordinary objects",
    "Bourdin's use of dramatic color and shadow",
    "Kandinsky's abstract spiritual elements"
  ],
  avoidElements: [
    // Elements to Avoid
    "literal surrealism",
    "obvious symbolism",
    "random juxtaposition",
    "excessive drama",
    "decorative geometry",
    "cliché imagery",
    "forced mystery",
    "shallow philosophy",
    "predictable composition",
    "imitative surrealism",
    "theatrical excess",
    "rigid geometry",
    "obvious narrative",
    "superficial staging",
    "meaningless symbols"
  ],
  modelConfig: {
    prompt_prefix: "In the metaphysical surrealist style of Margritte, with Bourdin's dramatic staging and Kandinsky's spiritual geometry. Create a mysterious and philosophical interpretation with ",
    prompt_suffix: ". Use paradoxical placement, theatrical lighting, and geometric harmony. Style emphasizing symbolic resonance and impossible realities.",
    negative_prompt: "literal, obvious, random, excessive, decorative, cliché, forced, shallow, predictable, imitative, theatrical, rigid, superficial",
    num_inference_steps: 50,
    guidance_scale: 12.5
  }
};