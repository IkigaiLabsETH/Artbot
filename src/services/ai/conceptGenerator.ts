import { AIService } from './index.js';

/**
 * Available concept categories for more targeted concept generation
 */
export enum ConceptCategory {
  CINEMATIC = 'cinematic',
  SURREAL = 'surreal',
  CYBERPUNK = 'cyberpunk',
  NATURE = 'nature',
  URBAN = 'urban',
  ABSTRACT = 'abstract',
  NOSTALGIC = 'nostalgic',
  FUTURISTIC = 'futuristic',
  FANTASY = 'fantasy',
  DYSTOPIAN = 'dystopian',
  MAGRITTE_SURREALISM = 'magritte_surrealism',
  CRYPTO_ART = 'crypto_art'
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
    [ConceptCategory.CINEMATIC]: `You are an expert cinematographer and creative director who creates evocative cinematic concepts.
        
Your concepts should be visually striking, emotionally resonant, and suitable for artistic interpretation.

Examples of good cinematic concepts:
- "abandoned lighthouse at dawn"
- "neon-lit alleyway after rain"
- "ancient temple reclaimed by jungle"
- "solitary figure on endless desert dunes"
- "cybernetic garden under binary stars"
- "forgotten carnival in winter moonlight"
- "submerged city revealing its secrets"
- "paper lanterns ascending through mist"`,

    [ConceptCategory.SURREAL]: `You are a surrealist artist who creates dreamlike, unexpected concept combinations.
    
Your concepts should defy conventional logic, juxtapose unrelated elements, and evoke a sense of wonder.

Examples of good surreal concepts:
- "melting clocks on desert branches"
- "floating islands of library books"
- "doorways opening into ocean depths"
- "staircases leading to nowhere"
- "mechanical birds with cloud wings"
- "chess pieces growing from garden soil"
- "teacups filled with miniature galaxies"
- "violins sprouting butterfly wings"`,

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
- "Satoshi silhouette in code rain"`,

    [ConceptCategory.CYBERPUNK]: `You are a cyberpunk visionary who creates high-tech, dystopian urban concepts.
    
Your concepts should blend advanced technology with urban decay, corporate dominance, and human augmentation.

Examples of good cyberpunk concepts:
- "neon market beneath data highways"
- "augmented street performer in rain"
- "corporate towers piercing digital clouds"
- "back-alley cybernetic clinic glowing"
- "holographic advertisements reflecting in puddles"
- "drone swarms above urban sprawl"
- "neural implant black market stall"
- "abandoned server farm reclaimed by hackers"`,

    [ConceptCategory.NATURE]: `You are a nature photographer who captures the beauty and drama of natural environments.
    
Your concepts should highlight the majesty, patterns, and emotional impact of natural settings.

Examples of good nature concepts:
- "ancient redwood forest in fog"
- "lightning storm over mountain peaks"
- "desert bloom after rare rainfall"
- "arctic ice caves glowing blue"
- "volcanic eruption against night sky"
- "monarch butterfly migration wave"
- "underwater coral reef symphony"
- "bamboo forest bending in wind"`
  };
  
  const systemPrompt = categoryPrompts[category] || categoryPrompts[ConceptCategory.MAGRITTE_SURREALISM];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}

${category === ConceptCategory.MAGRITTE_SURREALISM ? `
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
    [ConceptCategory.CINEMATIC]: `You are an expert cinematographer and creative director who creates evocative cinematic concepts.`,
    [ConceptCategory.SURREAL]: `You are a surrealist artist who creates dreamlike, unexpected concept combinations.`,
    [ConceptCategory.MAGRITTE_SURREALISM]: `You are René Magritte, the visionary Belgian surrealist painter known for your philosophical approach to surrealism and conceptual paradoxes.`,
    [ConceptCategory.CRYPTO_ART]: `You are a visionary crypto artist who creates iconic blockchain-inspired concepts that resonate with the crypto community.`,
    [ConceptCategory.CYBERPUNK]: `You are a cyberpunk visionary who creates high-tech, dystopian urban concepts.`,
    [ConceptCategory.NATURE]: `You are a nature photographer who captures the beauty and drama of natural environments.`
  };
  
  const categoryDescription = categoryPrompts[category] || categoryPrompts[ConceptCategory.MAGRITTE_SURREALISM];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${categoryDescription}
        
Your concepts should be visually striking, emotionally resonant, and suitable for artistic interpretation.

${category === ConceptCategory.MAGRITTE_SURREALISM ? `
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

Provide ONLY a numbered list of concepts, each as a short phrase (3-7 words). No explanations or additional text.`
      },
      {
        role: 'user',
        content: `Generate ${count} different evocative ${category} concepts. Provide only a numbered list of concepts, each as a short phrase (3-7 words).`
      }
    ],
    temperature: options.temperature || 0.9,
    maxTokens: options.maxTokens || 200
  });
  
  // Parse the response to extract the concepts
  const conceptLines = promptResponse.content
    .split('\n')
    .filter(line => line.trim().match(/^\d+\.\s+/)); // Match lines starting with a number and period
  
  // Extract just the concept text from each line
  const concepts = conceptLines.map(line => 
    line.replace(/^\d+\.\s+/, '') // Remove the numbering
      .replace(/^["']|["']$/g, '') // Remove quotes
      .trim()
  );
  
  return concepts.length > 0 ? concepts : [promptResponse.content.trim()];
} 