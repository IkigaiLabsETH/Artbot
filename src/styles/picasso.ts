import { ArtDirection } from '../types/ArtDirection.js';

export const picassoStyle: ArtDirection = {
  styleEmphasis: [
    // Picasso's Distinctive Style
    "bold geometric abstraction",
    "multiple simultaneous perspectives",
    "fragmented angular forms",
    "characteristic Cubist deconstruction",
    "flattened picture plane",
    "dramatic form distortion",
    "interlocking geometric shapes",
    "bold modernist simplification",
    "characteristic planar shifts",
    "angular figure treatment",
    "spatial discontinuity",
    "radical form reinvention",
    "dynamic compositional tension",
    "aggressive line work",
    "revolutionary spatial relationships"
  ],
  visualElements: [
    // Picasso's Visual Language
    "fractured geometric planes",
    "bold angular shapes",
    "overlapping faceted forms",
    "dramatic line distortions",
    "multiple viewpoint synthesis",
    "sharp geometric edges",
    "intersecting planes of color",
    "radical spatial compression",
    "characteristic Cubist grid",
    "bold form fragmentation",
    "dynamic negative spaces",
    "geometric pattern integration",
    "aggressive shape relationships",
    "modernist spatial layering",
    "revolutionary perspective breaks"
  ],
  colorPalette: [
    // Picasso's Bold Palette
    "earthy ochre (raw sienna)",
    "deep burnt umber",
    "cool slate grey",
    "warm terracotta",
    "stark charcoal black",
    "muted olive green",
    "rich burnt sienna",
    "cool pewter grey",
    "warm sand tones",
    "bold indigo accents"
  ],
  compositionGuidelines: [
    // Picasso's Compositional Approach
    "radical spatial reorganization",
    "dynamic geometric structuring",
    "aggressive plane intersection",
    "bold asymmetrical balance",
    "multiple viewpoint integration",
    "dramatic spatial compression",
    "geometric pattern rhythm",
    "angular form relationships",
    "revolutionary space division",
    "interlocking shape design",
    "dynamic tension creation",
    "bold compositional breaks",
    "geometric mass distribution",
    "radical perspective shifts",
    "aggressive spatial layering"
  ],
  moodAndTone: "Create a bold Picasso-style modernist interpretation that embodies his revolutionary approach to form and space. The execution must demonstrate his characteristic geometric abstraction and radical deconstruction of form. Every element should be dramatically simplified and reconstructed through multiple simultaneous viewpoints, with aggressive angular treatment and bold geometric relationships.",
  references: [
    "Picasso's 'Les Demoiselles d'Avignon' (1907) - for revolutionary form treatment",
    "Picasso's 'Girl with Mandolin' (1910) - for geometric abstraction",
    "Picasso's 'The Weeping Woman' (1937) - for emotional distortion",
    "Picasso's 'Three Musicians' (1921) - for bold geometric composition",
    "Picasso's 'Portrait of Ambroise Vollard' (1910) - for Cubist fragmentation",
    "Picasso's 'Still Life with Chair Caning' (1912) - for spatial innovation",
    "Picasso's 'Guitar' (1913) - for geometric simplification",
    "Picasso's 'The Dream' (1932) - for form distortion",
    "Picasso's 'Guernica' (1937) - for dramatic angular treatment",
    "Picasso's 'Bull' (1945) - for progressive abstraction"
  ],
  avoidElements: [
    // Anti-Picasso Elements
    "naturalistic representation",
    "traditional perspective",
    "photographic accuracy",
    "realistic modeling",
    "conventional proportions",
    "academic technique",
    "literal space depiction",
    "atmospheric perspective",
    "realistic light effects",
    "conventional anatomy",
    "traditional volume",
    "photorealistic detail",
    "linear perspective",
    "natural coloring",
    "realistic textures",
    // Style Elements to Avoid
    "impressionistic effects",
    "romantic softness",
    "delicate brushwork",
    "subtle gradations",
    "gentle transitions",
    "refined finish",
    "careful blending",
    "precise detail",
    "controlled edges",
    // General Elements to Avoid
    "commercial aesthetics",
    "decorative prettiness",
    "sentimental treatment",
    "conventional beauty",
    "traditional harmony"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Pablo Picasso's Cubist period, with geometric fragmentation, multiple perspectives, and bold angular forms. Create a Cubist interpretation with ",
    prompt_suffix: ". Use Picasso's characteristic angular distortions, overlapping planes, and dramatic geometric simplification. Style of Les Demoiselles d'Avignon and Girl with Mandolin.",
    negative_prompt: "photorealistic, smooth, natural, traditional perspective, realistic anatomy, detailed textures, conventional proportions, soft edges, gentle transitions, decorative, sentimental",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 