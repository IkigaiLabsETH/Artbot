import { ArtDirection } from '../types/ArtDirection.js';

export const xcopyStyle: ArtDirection = {
  styleEmphasis: [
    // XCOPY's Distinctive Style
    "glitch art",
    "crypto punk aesthetic",
    "dark surrealism",
    "digital expressionism",
    "memento mori themes",
    "raw digital emotion",
    "cryptoart pioneering",
    "animated distortion",
    "psychological horror",
    "digital decay",
    "existential commentary",
    "punk rock attitude",
    "digital minimalism",
    "death themes",
    "social critique"
  ],
  visualElements: [
    // XCOPY's Visual Language
    "glitch effects",
    "skull motifs",
    "distorted faces",
    "neon accents",
    "static noise",
    "digital artifacts",
    "harsh contrasts",
    "flickering elements",
    "corrupted imagery",
    "bold typography",
    "death symbols",
    "geometric distortion",
    "pixel sorting",
    "scan lines",
    "digital noise"
  ],
  colorPalette: [
    // XCOPY's Digital Palette
    "acid green",
    "blood red",
    "digital black",
    "glitch blue",
    "static white",
    "corrupted pink",
    "death grey",
    "neon yellow",
    "void purple",
    "error red"
  ],
  compositionGuidelines: [
    // XCOPY's Compositional Approach
    "centered focal point",
    "glitch layering",
    "asymmetric balance",
    "corrupted symmetry",
    "digital noise patterns",
    "stark contrasts",
    "minimal elements",
    "repetitive motifs",
    "animated potential",
    "negative space",
    "distorted grid",
    "broken perspective",
    "chaotic order",
    "digital decay",
    "glitch patterns"
  ],
  moodAndTone: "Create an XCOPY-style digital artwork that embodies dark surrealism and glitch aesthetics. The piece should feature stark contrasts and corrupted imagery while incorporating death themes and social commentary. Every element should contribute to a sense of digital decay and psychological unease, rendered with their signature blend of minimalism and chaos.",
  references: [
    "XCOPY's 'Right-click and Save As guy' - for iconic style",
    "XCOPY's 'Death Dip' - for death themes",
    "XCOPY's 'GLIⓉCH' - for glitch effects",
    "XCOPY's 'MAX PAIN' - for psychological intensity",
    "XCOPY's 'Overpriced JPEGs' - for crypto commentary",
    "XCOPY's 'Some Other Asshole' - for social critique",
    "XCOPY's 'Afterburn' - for animation style",
    "XCOPY's 'Depression' - for emotional depth",
    "XCOPY's 'NGMI' - for crypto culture",
    "XCOPY's 'Chaos Theory' - for compositional approach"
  ],
  avoidElements: [
    // Anti-XCOPY Elements
    "realistic rendering",
    "natural elements",
    "smooth gradients",
    "peaceful scenes",
    "traditional art",
    "clean lines",
    "organic forms",
    "decorative elements",
    "realistic lighting",
    "detailed shading",
    "harmonious composition",
    "photorealism",
    "gentle transitions",
    "soft colors",
    "balanced harmony",
    // Style Elements to Avoid
    "impressionist technique",
    "classical composition",
    "art nouveau flourishes",
    "baroque complexity",
    "watercolor effects",
    // General Elements to Avoid
    "natural scenes",
    "peaceful mood",
    "traditional media",
    "realistic portraits",
    "conventional beauty"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of XCOPY's crypto art, with glitch effects and dark surrealism. Create a stark, corrupted interpretation with ",
    prompt_suffix: ". Use XCOPY's characteristic death motifs, digital artifacts, and minimal composition. Style of Right-click and Save As guy and GLIⓉCH.",
    negative_prompt: "realistic, natural, smooth, peaceful, traditional, clean, organic, decorative, photorealistic, gentle, soft, harmonious, balanced, conventional",
    num_inference_steps: 45,
    guidance_scale: 13.0
  }
}; 