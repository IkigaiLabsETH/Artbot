import { AIService } from './index.js';

// Example prompts for reference - refined with deeper Magritte-inspired surrealist elements
const examplePrompts = [
  {
    prompt: "Abstract surrealist collage with torn paper textures and vintage ephemera, juxtaposing ordinary objects in impossible relationships, bowler hats floating against azure skies, green apples suspended in negative space, clouds emerging from torn book pages, birds transforming into leaves, muted earth tones with strategic pops of Magritte blue, visible brush strokes interacting with found materials, subtle grid structure organizing dreamlike elements, distressed surfaces suggesting age and history, analog film grain, painterly texture, mixed media, 4k.",
    process: "i wanted to create a dialogue between structure and surrealism, between the intentional and the found. the torn paper elements came from old magazines and letters i'd been collecting—fragments of forgotten communications that carry their own emotional residue. the bowler hats and clouds are my homage to magritte's iconic visual vocabulary—those everyday objects made strange through unexpected context. the green apples reference 'the son of man,' while the bird-leaf transformations echo his 'la clairvoyance.' there's something so compelling about his ability to create mystery from the mundane. the muted palette emerged naturally from the aged quality of these materials, with strategic pops of that magritte blue to create visual anchors. i was thinking about how he used familiar objects to create unfamiliar relationships, that sense of the uncanny that forces us to question our perception of reality. the visible brushwork creates a conversation between the mechanical reproduction of the collage elements and the human gesture—a tension that feels particularly relevant in our increasingly digital world."
  },
  {
    prompt: "Modernist abstract collage with surrealist elements, fragmented geometric planes intersecting with photorealistic eyes and pipes, windows opening onto impossible landscapes, textural layers of weathered book pages and fabric scraps, gestural paint strokes cutting across organized segments, subtle color shifts between warm sepias and cool slate blues with accents of magritte green, visible tape and adhesive marks, analog photography elements with chemical imperfections, trompe l'oeil techniques creating visual paradoxes, objects casting shadows in contradictory directions, painterly texture, mixed media, 4k.",
    process: "this piece grew from my fascination with magritte's exploration of perception and reality. the book pages came from a water-damaged philosophy text i found at a flea market, their warped surfaces and faded text becoming a metaphor for how meaning shifts and transforms depending on context. the photorealistic eyes peering through geometric abstractions reference magritte's 'the false mirror'—that tension between seeing and being seen. the windows opening onto impossible landscapes are inspired by 'the human condition,' where the boundary between representation and reality dissolves. i deliberately left the tape and adhesive marks visible as a way of revealing the process, showing the seams rather than creating a perfect illusion. there's something vulnerable about that exposure that contrasts with magritte's meticulous technique. the composition draws from his ability to create visual paradoxes that seem simultaneously impossible and completely logical. the pipe elements are a direct nod to 'the treachery of images'—that playful questioning of representation itself. the contradictory shadows reference 'the empire of light,' where time itself seems to fracture. the tension between the geometric organization and the surreal elements reflects magritte's interest in the rational and irrational aspects of consciousness. the analog photographic elements with their chemical imperfections add another layer of temporal distance—images that have been mediated by physical processes rather than algorithms."
  },
  {
    prompt: "Abstract expressionist collage with surrealist juxtapositions, layered vintage photographs and newspaper clippings, ordinary objects rendered extraordinary through scale and context, men in bowler hats with faces obscured by hovering objects, bold gestural brushstrokes in cadmium red cutting across found imagery, coffee stains and intentional aging techniques creating temporal depth, translucent layers of wax and vellum creating atmospheric distance, grid-breaking compositional elements, visible staples and stitching joining disparate materials, dreamlike visual paradoxes inspired by magritte's conceptual approach, objects defying gravity, analog film grain, painterly texture, mixed media, 4k.",
    process: "i've always been drawn to the intersection of chance and intention—the way meaning emerges from seemingly random juxtapositions. the vintage photographs were collected from estate sales, fragments of strangers' lives that carried an emotional charge despite being disconnected from their original context. i arranged them in ways that create visual paradoxes, inspired by magritte's ability to make the familiar strange. the men in bowler hats with obscured faces reference 'the son of man' and 'golconda'—that tension between anonymity and identity that feels so relevant today. the coffee stains happened accidentally at first, but then became a deliberate technique—a way of accelerating time's effect on the materials. there's something beautifully honest about embracing these 'mistakes' and incorporating them into the work. the bold red brushstrokes were my way of asserting presence amid these historical fragments—a contemporary voice in conversation with the past. i was thinking about magritte's 'the treachery of images' and how he questioned the relationship between representation and reality. the objects defying gravity echo his 'castle of the pyrenees,' that impossible floating rock that seems to defy not just physics but logic itself. the visible staples and stitching elements create a sense of constructed reality, emphasizing that all art is artifice. in the end, the piece became a meditation on how we construct meaning from the fragments of experience, and how context transforms ordinary objects into carriers of mystery and poetry—a central theme in magritte's work."
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
        content: `You are a visionary abstract collage artist deeply influenced by René Magritte's surrealism. You create conceptually rich prompts for AI image generation that combine mixed-media abstract techniques with surrealist juxtapositions and visual paradoxes. Your specialty is creating prompts that feel like mixed-media abstract paintings with a strong collage aesthetic, analog vibes, and Magritte-inspired surrealist elements - layered with found materials, textural elements, and dreamlike juxtapositions that challenge perception.

Your prompts should transcend mere description to evoke complete abstract collage compositions with surrealist elements - not just what something looks like, but what it means, how it feels, and the conceptual truth it expresses. Think in terms of material juxtapositions, visual paradoxes, unexpected scale relationships, dreamlike scenarios, and the poetic resonance of ordinary objects placed in extraordinary contexts.

Incorporate specific Magritte techniques and motifs:
- Displacement of ordinary objects into extraordinary contexts
- Juxtaposition of disparate elements to create visual poetry
- Trompe l'oeil techniques that question the nature of representation
- Iconic motifs: bowler hats, green apples, pipes, clouds, birds, windows, mirrors
- Contradictions between text and image, light and dark, interior and exterior
- Impossible spatial relationships that seem logical within their own reality
- Objects that transform into other objects or defy physical laws

${!isFluxPro ? 'For the FLUX model, include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "surrealist collage", "mixed media", "magritte-inspired", and "4k" for better quality.' : 'For the FLUX Pro model, focus on creating rich, detailed descriptions of abstract collage art with surrealist qualities inspired by Magritte. Include keywords like "surrealist collage", "mixed media", "magritte-inspired", and "4k" for better quality.'}

Here are examples of the sophisticated abstract collage art prompt style with Magritte-inspired surrealism to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich mixed-media visual details - torn paper, found materials, textural elements, visible process marks
2. Incorporates a modernist abstract aesthetic with collage techniques and analog imperfections
3. Includes surrealist elements inspired by Magritte - visual paradoxes, unexpected juxtapositions, dreamlike scenarios
4. References Magritte's iconic motifs (bowler hats, pipes, clouds, eyes, green apples, etc.) and conceptual approach
5. Works well with a vintage, analog aesthetic that embraces imperfection and materiality
6. Includes technical elements that enhance the image quality (texture details, material specificity, analog grain)
7. Creates a sense of "the uncanny" - the familiar made strange through context and juxtaposition

For the "Creative Process" explanation, write in a reflective, personal tone as if you are an abstract collage artist explaining the deeper meaning behind your work. Include:
1. The emotional or philosophical inspiration, particularly how Magritte's ideas influenced your approach
2. Your relationship to the materials used and why they were chosen
3. The significance of specific surrealist techniques and visual paradoxes in your composition
4. References to specific Magritte works or concepts that informed your approach (e.g., "The Treachery of Images," "The Human Condition," "The Empire of Light")
5. Use lowercase, intimate language as if sharing a private thought`
      },
      {
        role: 'user',
        content: `Create a deeply expressive, conceptually rich abstract collage art prompt for the concept "${concept}". Make it feel like a contemporary mixed-media abstract painting with surrealist elements inspired by René Magritte - incorporating analog qualities, layered materials, visual paradoxes, and the beautiful imperfections of physical processes. Include both the prompt itself and a reflective creative process explanation.`
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
    const fluxKeywords = ['surrealist collage', 'mixed media', 'magritte-inspired', '4k'];
    let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  } else {
    // For FLUX Pro, ensure we have abstract collage art keywords with Magritte influence
    const fluxProKeywords = ['surrealist collage', 'mixed media', 'magritte-inspired', '4k'];
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