import { ArtworkIdea } from '../types/index.js';

/**
 * Enhances a basic prompt with artistic details for better image generation
 * @param idea The artwork idea to generate a prompt for
 * @returns An enhanced prompt string
 */
export function enhancePrompt(idea: ArtworkIdea): string {
  // Start with the basic concept
  let enhancedPrompt = idea.concept;
  
  // Add style details
  enhancedPrompt = addStyleDetails(enhancedPrompt, idea.style);
  
  // Add medium-specific details
  enhancedPrompt = addMediumDetails(enhancedPrompt, idea.medium);
  
  // Add composition guidance
  enhancedPrompt = addCompositionGuidance(enhancedPrompt);
  
  // Add quality boosters
  enhancedPrompt = addQualityBoosters(enhancedPrompt);
  
  return enhancedPrompt;
}

/**
 * Adds style-specific details to the prompt
 */
function addStyleDetails(prompt: string, style: string): string {
  const styleDetails: Record<string, string> = {
    'Impressionism': 'with loose brushstrokes, vibrant colors, emphasis on light and movement, in the style of Monet and Renoir',
    'Cubism': 'with geometric shapes, multiple perspectives, fragmented forms, in the style of Picasso and Braque',
    'Surrealism': 'with dreamlike imagery, unexpected juxtapositions, subconscious elements, in the style of Dali and Magritte',
    'Abstract Expressionism': 'with emotional, gestural brushwork, non-representational forms, in the style of Pollock and de Kooning',
    'Pop Art': 'with bold colors, popular culture references, commercial imagery, in the style of Warhol and Lichtenstein',
    'Minimalism': 'with simplified forms, limited color palette, geometric precision, in the style of Judd and Martin',
    'Renaissance': 'with realistic proportions, perspective, classical themes, in the style of da Vinci and Michelangelo',
    'Baroque': 'with dramatic lighting, rich colors, dynamic composition, in the style of Caravaggio and Rubens',
    'Art Nouveau': 'with organic, flowing lines, decorative elements, natural forms, in the style of Mucha and Klimt',
    'Contemporary': 'with modern techniques, innovative approach, current cultural references',
    'Digital': 'with digital precision, vibrant colors, modern aesthetic',
    'Photorealistic': 'with extreme detail, perfect lighting, indistinguishable from photography',
    'Anime': 'with stylized features, vibrant colors, expressive eyes, in Japanese animation style',
    'Pixel Art': 'with visible pixels, limited color palette, retro gaming aesthetic',
    'Vaporwave': 'with retro computing aesthetics, glitch elements, pastel colors, 80s and 90s nostalgia',
    'Cyberpunk': 'with neon colors, futuristic technology, urban dystopia, high tech low life aesthetic',
    'Steampunk': 'with Victorian-era aesthetics, brass machinery, steam-powered technology',
    'Gothic': 'with dark themes, ornate details, medieval influences, dramatic lighting',
    'Art Deco': 'with geometric patterns, bold colors, luxurious materials, symmetrical designs',
  };
  
  // If we have specific details for this style, add them
  if (styleDetails[style]) {
    return `${prompt}, ${styleDetails[style]}`;
  }
  
  // Generic style addition
  return `${prompt}, in ${style} style`;
}

/**
 * Adds medium-specific details to the prompt
 */
function addMediumDetails(prompt: string, medium: string): string {
  const mediumDetails: Record<string, string> = {
    'Oil Painting': 'oil painting with visible brushstrokes, rich textures, and depth',
    'Watercolor': 'watercolor with transparent washes, soft edges, and flowing colors',
    'Acrylic': 'acrylic painting with vibrant colors, sharp details, and smooth texture',
    'Digital': 'digital art with clean lines, perfect gradients, and high resolution',
    'Photography': 'photographic quality with perfect lighting, depth of field, and realistic details',
    'Sculpture': 'sculptural form with three-dimensional presence, texture, and volume',
    'Pencil Drawing': 'detailed pencil drawing with fine lines, shading, and texture',
    'Charcoal': 'expressive charcoal drawing with rich blacks, smudged textures, and dramatic contrasts',
    'Pastel': 'soft pastel artwork with velvety textures, blended colors, and luminous quality',
    'Ink': 'ink drawing with bold lines, precise details, and strong contrasts',
    'Collage': 'mixed media collage with layered elements, varied textures, and diverse materials',
    'Pixel Art': 'pixel art with visible grid, limited palette, and retro gaming aesthetic',
    '3D Render': '3D rendered image with realistic lighting, textures, and perspective',
    'Vector': 'vector illustration with clean lines, flat colors, and scalable precision',
    'Gouache': 'gouache painting with opaque colors, matte finish, and graphic quality',
    'Mixed Media': 'mixed media artwork combining multiple techniques and materials',
  };
  
  // If we have specific details for this medium, add them
  if (mediumDetails[medium]) {
    return `${prompt}, ${mediumDetails[medium]}`;
  }
  
  // Generic medium addition
  return `${prompt}, ${medium} medium`;
}

/**
 * Adds composition guidance to the prompt
 */
function addCompositionGuidance(prompt: string): string {
  const compositions = [
    'with balanced composition',
    'with dynamic composition',
    'with rule of thirds composition',
    'with golden ratio composition',
    'with symmetrical composition',
    'with asymmetrical balance',
    'with central focus',
    'with dramatic perspective',
    'with atmospheric depth',
    'with cinematic framing',
  ];
  
  // Randomly select a composition guidance
  const randomComposition = compositions[Math.floor(Math.random() * compositions.length)];
  return `${prompt}, ${randomComposition}`;
}

/**
 * Adds quality boosters to the prompt
 */
function addQualityBoosters(prompt: string): string {
  const boosters = [
    'highly detailed',
    'masterful technique',
    'professional quality',
    'award-winning',
    'museum quality',
    'perfect lighting',
    'intricate details',
    'stunning colors',
    'masterpiece',
    'trending on artstation',
    '8k resolution',
    'photorealistic',
    'hyperrealistic',
    'studio quality',
  ];
  
  // Randomly select 2-3 quality boosters
  const boosterCount = Math.floor(Math.random() * 2) + 2; // 2-3 boosters
  const selectedBoosters = [];
  
  for (let i = 0; i < boosterCount; i++) {
    const randomIndex = Math.floor(Math.random() * boosters.length);
    selectedBoosters.push(boosters[randomIndex]);
    boosters.splice(randomIndex, 1); // Remove the selected booster to avoid duplicates
    
    if (boosters.length === 0) break;
  }
  
  return `${prompt}, ${selectedBoosters.join(', ')}`;
}

/**
 * Generates a negative prompt to avoid common issues in generated images
 */
export function generateNegativePrompt(): string {
  return 'low quality, bad anatomy, worst quality, low resolution, blurry, distorted proportions, disfigured, deformed, amateur, poorly drawn, ugly, text, watermark, signature, extra limbs, missing limbs, cropped image, out of frame, draft, tesla logo, tesla badge, tesla emblem, tesla brand symbol, tesla wordmark, gas station, exhaust pipe, fuel cap, internal combustion, gasoline';
} 