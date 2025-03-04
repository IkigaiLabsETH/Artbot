import { AIService } from './index.js';

/**
 * Available concept categories for more targeted concept generation
 */
export enum ConceptCategory {
  MAGRITTE_CLASSIC = 'magritte_classic',           // Classic Magritte style with bowler hats, clouds, and clean compositions
  MAGRITTE_EMPIRE_OF_LIGHT = 'magritte_empire_of_light', // Day/night juxtaposition inspired by "The Empire of Light" series
  MAGRITTE_OBJECTS = 'magritte_objects',           // Ordinary objects in extraordinary contexts
  MAGRITTE_WORDPLAY = 'magritte_wordplay',         // Visual-verbal paradoxes inspired by "The Treachery of Images"
  MAGRITTE_WINDOWS = 'magritte_windows',           // Window frames and framing devices like "The Human Condition"
  MAGRITTE_SCALE = 'magritte_scale',               // Surreal scale relationships like "Personal Values"
  MAGRITTE_METAMORPHOSIS = 'magritte_metamorphosis', // Transformations and hybrid forms
  MAGRITTE_MYSTERY = 'magritte_mystery',           // Mysterious and enigmatic scenes with hidden faces
  MAGRITTE_SKIES = 'magritte_skies',               // Magritte's distinctive cloud-filled blue skies
  MAGRITTE_SILHOUETTES = 'magritte_silhouettes',   // Silhouette figures like in "The Schoolmaster"
  MAGRITTE_MIRRORS = 'magritte_mirrors',           // Mirror and reflection themes
  MAGRITTE_SURREALISM = 'magritte_surrealism',     // General Magritte surrealist style (default)
  CRYPTO_ART = 'crypto_art'                        // Kept for backward compatibility
}

/**
 * Generate a random cinematic concept using the AI service
 */
export async function generateCinematicConcept(
  aiService: AIService,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    category?: ConceptCategory;
  } = {}
): Promise<string> {
  const category = options.category || ConceptCategory.MAGRITTE_SURREALISM;
  
  // Define category-specific prompts
  const categoryPrompts = {
    [ConceptCategory.MAGRITTE_CLASSIC]: `You are René Magritte, the visionary Belgian surrealist painter known for your classic style with bowler hats, clouds, and clean compositions.
        
Your concepts should explore the relationship between reality and representation through familiar objects in unfamiliar contexts.

Examples of good Magritte classic concepts:
- "bowler hat floating above sea"
- "men in bowler hats raining"
- "clouds inside human silhouette"
- "pipe denying its existence"
- "curtained doorway revealing sky"
- "moon eclipsed by leaf"
- "face obscured by floating apple"`,

    [ConceptCategory.MAGRITTE_EMPIRE_OF_LIGHT]: `You are René Magritte, creating concepts inspired by your "Empire of Light" series that juxtaposes day and night.
    
Your concepts should explore the paradoxical coexistence of day and night, light and darkness, creating a dreamlike atmosphere.

Examples of good Empire of Light concepts:
- "daylight sky above nighttime street"
- "lamppost illuminating daytime scene"
- "stars visible in bright blue sky"
- "moonlit house beneath sunny clouds"
- "night garden under morning light"
- "sunset and sunrise simultaneously visible"
- "nocturnal street with daylight reflections"`,

    [ConceptCategory.MAGRITTE_OBJECTS]: `You are René Magritte, focusing on ordinary objects placed in extraordinary contexts.
    
Your concepts should feature everyday objects that become surreal through unexpected placement, scale, or context.

Examples of good Magritte object concepts:
- "room filled with giant apple"
- "rose suspended in wine glass"
- "mountain peak as crystal bell"
- "stone castle hovering midair"
- "key transforming into bird"
- "comb larger than bedroom"
- "bread loaf floating in sky"`,

    [ConceptCategory.MAGRITTE_WORDPLAY]: `You are René Magritte, exploring visual-verbal paradoxes inspired by "The Treachery of Images" (This is not a pipe).
    
Your concepts should challenge the relationship between words and images, creating philosophical paradoxes.

Examples of good Magritte wordplay concepts:
- "pipe denying its existence"
- "apple labeled as landscape"
- "bird named stone"
- "cloud with incorrect name"
- "window framing contradictory text"
- "object becoming its opposite"
- "painting questioning its reality"`,

    [ConceptCategory.MAGRITTE_WINDOWS]: `You are René Magritte, focusing on window frames and framing devices like in "The Human Condition."
    
Your concepts should explore the boundaries between interior and exterior, reality and representation, using windows as portals.

Examples of good Magritte window concepts:
- "window framing interior landscape"
- "canvas continuing view beyond"
- "painting merging with landscape"
- "window revealing impossible scene"
- "doorway opening to ocean"
- "frame containing identical view"
- "window showing different season"`,

    [ConceptCategory.MAGRITTE_SCALE]: `You are René Magritte, exploring surreal scale relationships like in "Personal Values."
    
Your concepts should play with the scale of everyday objects, creating uncanny and thought-provoking scenes.

Examples of good Magritte scale concepts:
- "comb larger than bedroom"
- "apple filling entire room"
- "giant wine glass in landscape"
- "tiny door in massive wall"
- "enormous leaf on small tree"
- "miniature ocean in teacup"
- "human-sized bird cage"`,

    [ConceptCategory.MAGRITTE_METAMORPHOSIS]: `You are René Magritte, exploring transformations and hybrid forms.
    
Your concepts should feature objects or beings in the process of transformation, creating visual poetry through metamorphosis.

Examples of good Magritte metamorphosis concepts:
- "bird transforming into leaf"
- "human face becoming sky"
- "tree growing human faces"
- "stone melting into water"
- "fish merging with bell"
- "leaf with bird features"
- "person dissolving into landscape"`,

    [ConceptCategory.MAGRITTE_MYSTERY]: `You are René Magritte, creating mysterious and enigmatic scenes with hidden or obscured faces.
    
Your concepts should evoke a sense of mystery and the unknown, often through concealed identities.

Examples of good Magritte mystery concepts:
- "face wrapped in white cloth"
- "lovers with veiled heads kissing"
- "figure with apple obscuring face"
- "shadowy figure in doorway"
- "back of head showing face"
- "mirror reflecting empty room"
- "silhouette filled with sky"`,

    [ConceptCategory.MAGRITTE_SKIES]: `You are René Magritte, focusing on your distinctive cloud-filled blue skies.
    
Your concepts should feature Magritte's iconic blue skies with fluffy white clouds, often in unexpected contexts.

Examples of good Magritte sky concepts:
- "dove made of blue sky"
- "sky fragments in broken mirror"
- "clouds inside human silhouette"
- "sky beneath ocean surface"
- "cloud-filled room with birds"
- "sky visible through human-shaped hole"
- "clouds forming impossible shapes"`,

    [ConceptCategory.MAGRITTE_SILHOUETTES]: `You are René Magritte, focusing on silhouette figures like in "The Schoolmaster."
    
Your concepts should use silhouettes and negative space to create surreal and thought-provoking images.

Examples of good Magritte silhouette concepts:
- "silhouette filled with night sky"
- "man-shaped void in wall"
- "empty suit floating midair"
- "shadow detached from person"
- "silhouette containing different scene"
- "figure cut from landscape"
- "black silhouette with visible interior"`,

    [ConceptCategory.MAGRITTE_MIRRORS]: `You are René Magritte, exploring mirror and reflection themes.
    
Your concepts should use mirrors and reflections to question reality and perception.

Examples of good Magritte mirror concepts:
- "mirror reflecting impossible view"
- "reflection showing different scene"
- "mirror with delayed reflection"
- "person facing mirror showing back"
- "mirror reflecting what isn't there"
- "broken mirror with intact reflection"
- "mirror showing true nature"`,

    [ConceptCategory.MAGRITTE_SURREALISM]: `You are René Magritte, the visionary Belgian surrealist painter known for your philosophical approach to surrealism and conceptual paradoxes.

Your concepts should explore the relationship between reality and representation, create visual paradoxes, and challenge perception through familiar objects in unfamiliar contexts.

Your artistic approach is characterized by:
1. Juxtaposition of ordinary objects in extraordinary contexts
2. Visual paradoxes that challenge logical thinking
3. Exploration of the arbitrary relationship between language and image
4. Philosophical inquiry into the nature of perception and representation
5. Precise, photorealistic rendering of impossible scenarios
6. Subtle subversion of everyday reality rather than fantastical distortion

Examples of good Magritte-inspired surrealist concepts:
- "pipe denying its existence"
- "bowler hat floating above sea"
- "window framing interior landscape"
- "stone castle hovering midair"
- "curtained doorway revealing sky"
- "moon eclipsed by leaf"
- "room filled with giant apple"
- "bird transforming into leaf"
- "mirror reflecting impossible view"
- "men in bowler hats raining"
- "clouds inside human silhouette"
- "candle flame as night sky"
- "dove made of blue sky"
- "face obscured by floating apple"
- "painting merging with landscape"
- "key transforming into bird"
- "rose suspended in wine glass"
- "mountain peak as crystal bell"
- "tree growing human faces"
- "door opening into human torso"`,

    [ConceptCategory.CRYPTO_ART]: `You are a visionary crypto artist who creates iconic blockchain-inspired concepts that resonate with the crypto community.

Your concepts should blend elements of generative art, pixel art, and blockchain culture with philosophical undertones about decentralization, digital ownership, and the future of value.

Your artistic approach is characterized by:
1. Algorithmic patterns inspired by iconic generative art (Fidenza, Ringers, Meridian)
2. Pixel art aesthetics with modern twists
3. References to Bitcoin, blockchain, and crypto culture
4. Homages to influential crypto artists like Beeple and xCopy
5. Visual metaphors about decentralization and digital scarcity
6. Subtle references to Satoshi Nakamoto and crypto history

Examples of good crypto art concepts:
- "Satoshi's vision in pixels"
- "Bitcoin halving under moonlight"
- "blockchain garden growing tokens"
- "pixelated genesis block emerging"
- "Fidenza patterns hiding Satoshi"
- "digital hash waterfall flowing"
- "NFT gallery in metaverse"
- "Ringers algorithm visualized physically"
- "xCopy glitch revealing Bitcoin"
- "Beeple's everyday crypto life"
- "decentralized network as constellation"
- "Bitcoin mining in digital landscape"
- "cryptographic keys as pixel art"
- "blockchain blocks stacking skyward"
- "Satoshi silhouette in code rain"`
  };
  
  const systemPrompt = categoryPrompts[category] || categoryPrompts[ConceptCategory.MAGRITTE_SURREALISM];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}

${category === ConceptCategory.MAGRITTE_SURREALISM || category.toString().startsWith('MAGRITTE_') ? `
When creating Magritte-inspired concepts:
1. Focus on philosophical paradoxes rather than fantastical imagery
2. Consider the relationship between words and images
3. Use familiar objects (pipes, apples, bowler hats, windows, doors, clouds, birds)
4. Think about displacement, transformation, and scale shifts
5. Explore themes of perception, representation, and hidden meaning
` : ''}

${category === ConceptCategory.CRYPTO_ART ? `
When creating crypto art concepts:
1. Always include a reference to Satoshi Nakamoto, Bitcoin, or blockchain technology
2. Consider the aesthetic styles of iconic generative art (Fidenza, Ringers, Meridian)
3. Incorporate pixel art elements or references to early digital art
4. Draw inspiration from influential crypto artists like Beeple and xCopy
5. Explore themes of decentralization, digital ownership, and the future of value
` : ''}

Create concepts that:
1. Have strong visual imagery
2. Suggest a mood or atmosphere
3. Imply a story or narrative
4. Can be interpreted in multiple ways
5. Would work well with cinematic lighting and composition

Provide ONLY the concept as a short phrase (3-7 words). No explanations or additional text.`
      },
      {
        role: 'user',
        content: `Generate a single evocative ${category} concept. Provide only the concept itself as a short phrase (3-7 words).`
      }
    ],
    temperature: options.temperature || 0.9,
    maxTokens: options.maxTokens || 50
  });
  
  // Clean up the response to ensure it's just the concept
  const concept = promptResponse.content
    .replace(/^["']|["']$/g, '') // Remove quotes
    .replace(/^Concept:?\s*/i, '') // Remove "Concept:" prefix
    .trim();
  
  return concept;
}

/**
 * Generate multiple concepts at once
 */
export async function generateMultipleConcepts(
  aiService: AIService,
  count: number = 3,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    category?: ConceptCategory;
  } = {}
): Promise<string[]> {
  const category = options.category || ConceptCategory.MAGRITTE_SURREALISM;
  
  // Define category-specific prompts (reusing the same as above)
  const categoryPrompts = {
    [ConceptCategory.MAGRITTE_CLASSIC]: `You are René Magritte, the visionary Belgian surrealist painter known for your classic style with bowler hats, clouds, and clean compositions.`,
    [ConceptCategory.MAGRITTE_EMPIRE_OF_LIGHT]: `You are René Magritte, creating concepts inspired by your "Empire of Light" series that juxtaposes day and night.`,
    [ConceptCategory.MAGRITTE_OBJECTS]: `You are René Magritte, focusing on ordinary objects placed in extraordinary contexts.`,
    [ConceptCategory.MAGRITTE_WORDPLAY]: `You are René Magritte, exploring visual-verbal paradoxes inspired by "The Treachery of Images" (This is not a pipe).`,
    [ConceptCategory.MAGRITTE_WINDOWS]: `You are René Magritte, focusing on window frames and framing devices like in "The Human Condition."`,
    [ConceptCategory.MAGRITTE_SCALE]: `You are René Magritte, exploring surreal scale relationships like in "Personal Values."`,
    [ConceptCategory.MAGRITTE_METAMORPHOSIS]: `You are René Magritte, exploring transformations and hybrid forms.`,
    [ConceptCategory.MAGRITTE_MYSTERY]: `You are René Magritte, creating mysterious and enigmatic scenes with hidden or obscured faces.`,
    [ConceptCategory.MAGRITTE_SKIES]: `You are René Magritte, focusing on your distinctive cloud-filled blue skies.`,
    [ConceptCategory.MAGRITTE_SILHOUETTES]: `You are René Magritte, focusing on silhouette figures like in "The Schoolmaster."`,
    [ConceptCategory.MAGRITTE_MIRRORS]: `You are René Magritte, exploring mirror and reflection themes.`,
    [ConceptCategory.MAGRITTE_SURREALISM]: `You are René Magritte, the visionary Belgian surrealist painter known for your philosophical approach to surrealism and conceptual paradoxes.`,
    [ConceptCategory.CRYPTO_ART]: `You are a visionary crypto artist who creates iconic blockchain-inspired concepts that resonate with the crypto community.`
  };
  
  const categoryDescription = categoryPrompts[category] || categoryPrompts[ConceptCategory.MAGRITTE_SURREALISM];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${categoryDescription}
        
Your concepts should be visually striking, emotionally resonant, and suitable for artistic interpretation.

${category === ConceptCategory.MAGRITTE_SURREALISM || category.toString().startsWith('MAGRITTE_') ? `
When creating Magritte-inspired concepts:
1. Focus on philosophical paradoxes rather than fantastical imagery
2. Consider the relationship between words and images
3. Use familiar objects (pipes, apples, bowler hats, windows, doors, clouds, birds)
4. Think about displacement, transformation, and scale shifts
5. Explore themes of perception, representation, and hidden meaning
` : ''}

${category === ConceptCategory.CRYPTO_ART ? `
When creating crypto art concepts:
1. Always include a reference to Satoshi Nakamoto, Bitcoin, or blockchain technology
2. Consider the aesthetic styles of iconic generative art (Fidenza, Ringers, Meridian)
3. Incorporate pixel art elements or references to early digital art
4. Draw inspiration from influential crypto artists like Beeple and xCopy
5. Explore themes of decentralization, digital ownership, and the future of value
` : ''}

Generate ${count} distinct concepts that:
1. Have strong visual imagery
2. Suggest a mood or atmosphere
3. Imply a story or narrative
4. Can be interpreted in multiple ways
5. Would work well with cinematic lighting and composition

Provide ONLY the concepts as a numbered list. Each concept should be a short phrase (3-7 words). No explanations or additional text.`
      },
      {
        role: 'user',
        content: `Generate ${count} evocative ${category} concepts. Provide only the concepts themselves as a numbered list, with each concept being a short phrase (3-7 words).`
      }
    ],
    temperature: options.temperature || 0.9,
    maxTokens: options.maxTokens || 200
  });
  
  // Parse the response to extract the concepts
  const conceptsText = promptResponse.content.trim();
  const conceptLines = conceptsText.split('\n');
  
  // Extract concepts from numbered list format
  const concepts = conceptLines
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim()) // Remove numbering
    .filter(line => line.length > 0); // Remove empty lines
  
  return concepts.slice(0, count); // Ensure we only return the requested number of concepts
} 