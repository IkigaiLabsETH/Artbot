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
  DYSTOPIAN = 'dystopian'
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
  const category = options.category || ConceptCategory.CINEMATIC;
  
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
  
  const systemPrompt = categoryPrompts[category] || categoryPrompts[ConceptCategory.CINEMATIC];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}

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
  const category = options.category || ConceptCategory.CINEMATIC;
  
  // Define category-specific prompts (reusing the same as above)
  const categoryPrompts = {
    [ConceptCategory.CINEMATIC]: `You are an expert cinematographer and creative director who creates evocative cinematic concepts.`,
    [ConceptCategory.SURREAL]: `You are a surrealist artist who creates dreamlike, unexpected concept combinations.`,
    [ConceptCategory.CYBERPUNK]: `You are a cyberpunk visionary who creates high-tech, dystopian urban concepts.`,
    [ConceptCategory.NATURE]: `You are a nature photographer who captures the beauty and drama of natural environments.`
  };
  
  const categoryDescription = categoryPrompts[category] || categoryPrompts[ConceptCategory.CINEMATIC];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${categoryDescription}
        
Your concepts should be visually striking, emotionally resonant, and suitable for artistic interpretation.

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