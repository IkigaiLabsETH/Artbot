import { ArtDirection } from '../types/ArtDirection.js';

export const cooperGorferStyle: ArtDirection = {
  styleEmphasis: [
    // Cooper & Gorfer's Distinctive Style
    "painterly portraiture",
    "narrative layering",
    "cultural storytelling",
    "textile richness",
    "ethereal atmosphere",
    "folkloric elements",
    "feminine perspective",
    "cultural heritage",
    "dreamlike quality",
    "artistic collage",
    "symbolic detail",
    "mythological reference",
    "temporal suspension",
    "cultural identity",
    "poetic documentation"
  ],
  visualElements: [
    // Cooper & Gorfer's Visual Language
    "layered compositions",
    "textile patterns",
    "cultural artifacts",
    "traditional costumes",
    "symbolic objects",
    "natural elements",
    "architectural details",
    "historical references",
    "floating elements",
    "fabric textures",
    "cultural symbols",
    "landscape fragments",
    "decorative motifs",
    "traditional crafts",
    "heritage elements"
  ],
  colorPalette: [
    // Cooper & Gorfer's Rich Palette
    "muted gold",
    "heritage red",
    "antique blue",
    "textile brown",
    "cultural ochre",
    "traditional green",
    "folkloric purple",
    "narrative sepia",
    "historical grey",
    "symbolic earth"
  ],
  compositionGuidelines: [
    // Cooper & Gorfer's Compositional Approach
    "layered narrative",
    "cultural framing",
    "symbolic placement",
    "textile integration",
    "heritage context",
    "ethereal space",
    "traditional balance",
    "folkloric arrangement",
    "mythological structure",
    "feminine perspective",
    "cultural harmony",
    "artistic collage",
    "temporal flow",
    "identity focus",
    "poetic organization"
  ],
  moodAndTone: "Create a mesmerizing Cooper & Gorfer-style interpretation that embodies their painterly approach to cultural documentation and storytelling. The execution must demonstrate their characteristic ability to blend traditional elements with contemporary narrative through layered compositions and rich symbolism. Every element should contribute to a sense of timeless cultural heritage and poetic documentation, rendered with technical excellence and artistic vision.",
  references: [
    "Cooper & Gorfer's 'The Weather Diaries' series - for Nordic cultural exploration",
    "Cooper & Gorfer's 'I Know Not These My Hands' - for identity exploration",
    "Cooper & Gorfer's 'Interruptions' - for narrative layering",
    "Cooper & Gorfer's 'SEEK Volume 01' - for artistic documentation",
    "Cooper & Gorfer's 'My Quiet of Gold' - for cultural storytelling",
    "Cooper & Gorfer's 'Between These Folded Walls, Utopia' - for feminine perspective",
    "Cooper & Gorfer's 'Latent Identity' - for heritage exploration",
    "Cooper & Gorfer's 'The Moon Has a Deep Purse' - for symbolic narrative",
    "Cooper & Gorfer's 'Displaced' - for cultural documentation",
    "Cooper & Gorfer's 'Looking for Utopia' - for mythological reference"
  ],
  avoidElements: [
    // Anti-Cooper & Gorfer Elements
    "documentary realism",
    "candid moments",
    "street photography",
    "snapshot aesthetic",
    "journalistic approach",
    "commercial gloss",
    "fashion focus",
    "technical sterility",
    "literal representation",
    "modern minimalism",
    "urban context",
    "contemporary style",
    "digital manipulation",
    "commercial appeal",
    "trendy effects",
    // Style Elements to Avoid
    "photojournalistic style",
    "commercial fashion",
    "urban aesthetic",
    "digital effects",
    "modern minimalism",
    // General Elements to Avoid
    "contemporary trends",
    "commercial appeal",
    "digital manipulation",
    "urban context",
    "modern aesthetic"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Cooper & Gorfer's Hasselblad photography, with painterly composition and cultural narrative. Create a layered interpretation with ",
    prompt_suffix: ". Use Cooper & Gorfer's characteristic textile richness, cultural symbolism, and ethereal atmosphere. Style of The Weather Diaries and Between These Folded Walls, Utopia.",
    negative_prompt: "documentary, candid, street, snapshot, journalistic, commercial, fashion, technical, literal, minimal, urban, contemporary, digital, trendy",
    num_inference_steps: 40,
    guidance_scale: 12.0
  }
}; 