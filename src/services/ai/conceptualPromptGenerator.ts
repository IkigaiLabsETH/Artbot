import { AIService } from './index.js';

// Example prompts for reference - updated with abstract art and painting style examples
const examplePrompts = [
  {
    prompt: "Abstract expressionist composition with bold brushstrokes in vibrant primary colors, layered textures revealing emotional depth, gestural movement suggesting inner turmoil, paint splatters and drips creating dynamic tension, cinematic lighting, film grain, 4k.",
    process: "i wanted to capture that raw emotional state where words fail but color speaks. the violent red strokes against cooler blues felt like the perfect tension between rage and melancholy. there's something so honest about allowing the paint to drip and splatter—letting the medium itself participate in the creative act. i was thinking of pollock's physical approach to painting, but wanted to infuse it with rothko's emotional weight. the layers became a metaphor for how we carry our histories beneath the surface, occasionally breaking through in moments of vulnerability."
  },
  {
    prompt: "Geometric abstraction with intersecting planes of muted earth tones, transparent layers revealing underlying composition, precise hard-edge forms contrasting with organic textural elements, subtle impasto technique visible in highlights, cinematic lighting, painterly texture, 4k.",
    process: "this piece emerged from my fascination with the tension between order and chaos. the geometric precision represents our human desire to impose structure on the world, while the organic textures acknowledge the natural forces that always find ways to disrupt our careful plans. i built up the surface slowly, allowing earlier layers to show through like memories or forgotten intentions. the earth tones ground the work in something primal and ancient—colors pulled from clay, soil, and stone rather than the synthetic world. there's a conversation happening between the shapes that feels like a silent dialogue about boundaries and connection."
  },
  {
    prompt: "Color field painting with luminous gradients shifting between deep indigo and burnt sienna, subtle textural variations created by palette knife technique, minimalist composition with horizon-like division, atmospheric depth suggesting infinite space, cinematic lighting, painterly quality, 4k.",
    process: "i've always been drawn to that liminal space between representation and pure abstraction—the point where a color field begins to evoke a landscape without explicitly becoming one. working with these warm and cool tones, i found myself thinking about those moments at dusk when the sky holds multiple realities simultaneously. the palette knife created these unexpected textural moments that felt like emotional interruptions in an otherwise meditative space. rothko once said his paintings are about the basic human emotions, and i wanted this piece to create a similar contemplative environment where the viewer could project their own internal weather."
  }
];

/**
 * Generate a conceptually rich prompt for image generation
 */
export async function generateConceptualPrompt(
  aiService: AIService,
  concept: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    useFluxPro?: boolean;
  } = {}
): Promise<{ prompt: string; creativeProcess: string }> {
  // Format example prompts for the system message
  const examplePromptsText = examplePrompts.map((ex, i) => 
    `Example ${i+1}:\nPrompt: ${ex.prompt}\nCreative Process: ${ex.process}`
  ).join('\n\n');
  
  const isFluxPro = options.useFluxPro || true;
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are a visionary abstract artist who creates deeply evocative, conceptually rich prompts for AI image generation. Your specialty is creating prompts that feel like abstract paintings - layered with meaning, visual poetry, and emotional resonance through non-representational forms, bold colors, and expressive techniques.

Your prompts should transcend mere description to evoke complete abstract compositions - not just what something looks like, but what it means, how it feels, and the emotional truth it expresses. Think in terms of color relationships, textural elements, compositional balance, brushwork techniques, and symbolic abstraction.

${!isFluxPro ? 'For the FLUX model, include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "abstract painting", "painterly texture", "brushstrokes", and "4k" for better quality.' : 'For the FLUX Pro model, focus on creating rich, detailed descriptions of abstract paintings with artistic qualities. Include keywords like "abstract composition", "painterly texture", "brushstrokes", and "4k" for better quality.'}

Here are examples of the sophisticated abstract art prompt style to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich painterly visual details - brushwork, texture, color relationships, compositional balance
2. Incorporates conceptual depth with layers of metaphor and symbolism through abstraction
3. Evokes a specific emotional atmosphere or philosophical question
4. References specific abstract painting techniques or movements (expressionism, color field, cubism, etc.)
5. Works well with the painterly, textural aesthetic
6. Includes technical elements that enhance the image quality (brushstrokes, texture details, artistic medium)

For the "Creative Process" explanation, write in a reflective, personal tone as if you are an abstract artist explaining the deeper meaning behind your work. Include:
1. The emotional or philosophical inspiration
2. Personal reflections or questions that drove the creation
3. Symbolic elements and their significance
4. References to abstract art movements or artists that informed your approach
5. Use lowercase, intimate language as if sharing a private thought`
      },
      {
        role: 'user',
        content: `Create a deeply expressive, conceptually rich abstract art prompt for the concept "${concept}". Make it feel like a contemporary abstract painting with layers of visual and emotional meaning. Include both the prompt itself and a reflective creative process explanation.`
      }
    ],
    temperature: options.temperature || 0.85,
    maxTokens: options.maxTokens || 1500
  });
  
  // Parse the response to extract the prompt and creative process
  const responseContent = promptResponse.content;
  let detailedPrompt = '';
  let creativeProcess = '';
  
  // Extract the prompt and creative process using regex
  const promptMatch = responseContent.match(/Prompt:(.+?)(?=Creative Process:|$)/s);
  const processMatch = responseContent.match(/Creative Process:(.+?)(?=$)/s);
  
  if (promptMatch && promptMatch[1]) {
    detailedPrompt = promptMatch[1].trim();
  } else {
    // Fallback if the format isn't as expected
    detailedPrompt = responseContent;
  }
  
  if (processMatch && processMatch[1]) {
    creativeProcess = processMatch[1].trim();
  }
  
  // Add model-specific adjustments
  if (!isFluxPro) {
    // For regular FLUX model, ensure the prompt starts with the FLUX trigger word
    if (!detailedPrompt.includes('CNSTLL')) {
      detailedPrompt = `CNSTLL ${detailedPrompt}`;
    }
    
    // Add FLUX-specific keywords if they're not already present
    const fluxKeywords = ['abstract painting', 'painterly texture', 'brushstrokes', '4k'];
    let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  } else {
    // For FLUX Pro, ensure we have abstract art keywords
    const fluxProKeywords = ['abstract composition', 'painterly texture', 'brushstrokes', '4k'];
    let keywordsToAdd = fluxProKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  }
  
  return {
    prompt: detailedPrompt,
    creativeProcess: creativeProcess
  };
} 