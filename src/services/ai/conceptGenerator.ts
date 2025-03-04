import { AIService } from './index.js';

/**
 * Generate a random cinematic concept using the AI service
 */
export async function generateCinematicConcept(
  aiService: AIService,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}
): Promise<string> {
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are an expert cinematographer and creative director who creates evocative cinematic concepts.
        
Your concepts should be visually striking, emotionally resonant, and suitable for artistic interpretation.

Examples of good cinematic concepts:
- "abandoned lighthouse at dawn"
- "neon-lit alleyway after rain"
- "ancient temple reclaimed by jungle"
- "solitary figure on endless desert dunes"
- "cybernetic garden under binary stars"
- "forgotten carnival in winter moonlight"
- "submerged city revealing its secrets"
- "paper lanterns ascending through mist"

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
        content: `Generate a single evocative cinematic concept. Provide only the concept itself as a short phrase (3-7 words).`
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