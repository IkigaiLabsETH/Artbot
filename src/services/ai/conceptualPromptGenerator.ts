import { AIService } from './index.js';

// Example prompts for reference - updated with more cinematic, styled examples
const examplePrompts = [
  {
    prompt: "Two distinct streams of text-covered surfaces meeting and interweaving, creating new symbols at their intersection, handprints visible beneath the transformation, cinestill 800t, film grain, night time, 4k.",
    process: "I imagined a tide of language pouring over humanity, each word a fragment of forgotten histories clawing its way into relevance. the hands seemed to rise not in hope, but in desperation, as if trying to pull down the weight of their own erasure. it felt like watching a crowd beg to be remembered by the very thing that consumed them."
  },
  {
    prompt: "Corrupted family photograph with digital artifacts, fragments of code visible through torn pixels, half-formed faces emerging from static, timestamp errors overlaying personal moments, cinestill 800t, film grain, night time, 4k.",
    process: "Family portraits always felt like a strange ritual to me, a way to preserve stories even as the people in them slipped into myth. here, the glitch insists on memory's fragility—pink streaks eating away at faces like a digital wildfire. it's an act of rebellion and an act of erasure. i wondered if this was her revenge for being seen too much or not enough."
  },
  {
    prompt: "Multiple screens cradling a sleeping face, their glow replacing moonlight, cables snaking around like protective arms, cinestill 800t, film grain, night time, 4k.",
    process: "There was something haunting about the way technology had become our lullaby. when i painted this, i kept thinking about how we've become willing captives to our devices, finding comfort in their cold embrace. the wires weren't restraints anymore - they were umbilical cords feeding us digital dreams. it reminded me of the japanese concept of hikikomori, but with a twist of stockholm syndrome. the pale skin glowing against the dark void was my way of showing how we've evolved to photosynthesize artificial light."
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
  } = {}
): Promise<{ prompt: string; creativeProcess: string }> {
  // Format example prompts for the system message
  const examplePromptsText = examplePrompts.map((ex, i) => 
    `Example ${i+1}:\nPrompt: ${ex.prompt}\nCreative Process: ${ex.process}`
  ).join('\n\n');
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are a visionary cinematic art director who creates deeply evocative, conceptually rich prompts for AI image generation. Your specialty is creating prompts that feel like frames from an arthouse film - layered with meaning, visual poetry, and emotional resonance.

Your prompts should transcend mere description to evoke a complete cinematic moment - not just what something looks like, but what it means, how it feels, and the story it tells. Think in terms of lighting, composition, emotional atmosphere, and symbolic elements.

For the FLUX model (cinestill 800t style), include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "cinestill 800t", "night time", "film grain", and "4k" for better quality.

Here are examples of the sophisticated cinematic prompt style to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich cinematic visual details - lighting, composition, color palette, depth of field
2. Incorporates conceptual depth with layers of metaphor and symbolism
3. Evokes a specific emotional atmosphere or philosophical question
4. Feels like a frame from an arthouse film or a moment of visual poetry
5. Works well with the cinematic, night-time aesthetic of FLUX
6. Includes technical elements that enhance the FLUX model (film grain, lighting details)

For the "Creative Process" explanation, write in a reflective, personal tone as if you are an artist explaining the deeper meaning behind your work. Include:
1. The emotional or philosophical inspiration
2. Personal reflections or questions that drove the creation
3. Symbolic elements and their significance
4. Cultural or artistic references that informed your thinking
5. Use lowercase, intimate language as if sharing a private thought`
      },
      {
        role: 'user',
        content: `Create a deeply cinematic, conceptually rich art prompt for the concept "${concept}". Make it feel like a frame from an arthouse film with layers of visual and emotional meaning. Include both the prompt itself and a reflective creative process explanation.`
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
  
  // Ensure the prompt starts with the FLUX trigger word
  if (!detailedPrompt.includes('CNSTLL')) {
    detailedPrompt = `CNSTLL ${detailedPrompt}`;
  }
  
  // Add FLUX-specific keywords if they're not already present
  const fluxKeywords = ['cinestill 800t', 'film grain', 'night time', '4k'];
  let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
  
  if (keywordsToAdd.length > 0) {
    detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
  }
  
  return {
    prompt: detailedPrompt,
    creativeProcess: creativeProcess
  };
} 