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
  },
  {
    prompt: "Generative crypto art with Fidenza-inspired algorithmic flow fields, pixelated Bitcoin symbols emerging from mathematical patterns, vibrant neon colors against deep digital void, Ringers-style string formations wrapping around geometric blockchain structures, xCopy glitch aesthetics disrupting perfect patterns, Meridian-inspired curved line segments creating ordered chaos, Beeple's apocalyptic undertones with technological ruins, hidden Satoshi silhouettes embedded in code fragments, retro pixel art elements with modern generative techniques, mathematical hash patterns forming visual rhythms, golden ratio proportions, subtle matrix code rain effect, high contrast lighting, digital texture, 4k.",
    process: "i wanted to explore the intersection of generative art algorithms and crypto culture symbolism. the flow fields are a direct homage to tyler hobbs' fidenza works—those elegant algorithmic patterns that feel both chaotic and ordered simultaneously. embedding pixelated bitcoin symbols within these mathematical flows represents how cryptocurrency has become interwoven with our digital existence. the string formations wrapping around geometric structures reference dmitri cherniak's ringers series, which demonstrated how simple elements can create infinite unique variations—much like blockchain's ability to create unique digital assets. i incorporated xcopy's glitch aesthetics to disrupt the perfect mathematical patterns, symbolizing how crypto disrupts traditional financial systems. the meridian-inspired curved line segments create that sense of ordered chaos that's so central to generative art. there's something profound about how these artists use code to create beauty that feels both deterministic and unpredictable—much like satoshi's vision for a decentralized financial system. the hidden satoshi silhouettes embedded in the code fragments are my nod to the anonymous creator whose absence has become as significant as their creation. the retro pixel art elements connect to the early days of digital art and gaming, creating a temporal bridge to contemporary generative techniques. the mathematical hash patterns forming visual rhythms reflect the cryptographic foundations of blockchain technology. in the end, this piece became a meditation on how code can create both art and value—two concepts that the crypto art movement has fundamentally intertwined."
  },
  {
    prompt: "Pixel art crypto landscape with 8-bit Bitcoin mountains against gradient sky, Satoshi's white paper text forming pixelated clouds, blockchain cubes stacking into impossible architecture, retro gaming aesthetic with modern generative art techniques, Fidenza-inspired algorithmic patterns flowing through digital rivers, xCopy-style glitch effects disrupting perfect pixel grid, Beeple's everyday objects reimagined as crypto artifacts, mining rigs emitting low-resolution light beams, Ringers-style string theory visualizations connecting network nodes, hidden QR codes leading to genesis block, limited color palette with strategic neon accents, dithering techniques creating texture, isometric perspective, digital texture, 4k.",
    process: "i've always been fascinated by how pixel art creates meaning through constraint—how limiting resolution and color palette forces creative solutions. the 8-bit bitcoin mountains represent the foundational nature of bitcoin in the crypto ecosystem, while satoshi's white paper text forming the clouds speaks to how these ideas hover over everything in the space. the blockchain cubes stacking into impossible architecture is my way of visualizing how blockchain creates structures that couldn't exist in traditional systems. i deliberately chose a retro gaming aesthetic to connect to the playful, gamified aspects of crypto culture, while incorporating modern generative art techniques as a nod to how the space has evolved. the fidenza-inspired algorithmic patterns flowing through digital rivers represent how value and information flow through these systems—sometimes predictably, sometimes chaotically. xcopy's glitch aesthetics disrupting the perfect pixel grid symbolizes the moments of volatility and unpredictability in crypto markets. beeple's influence comes through in how i've reimagined everyday objects as crypto artifacts—transforming the mundane into the significant. the mining rigs emitting low-resolution light beams represent the energy and computational work that underpins these networks. the ringers-style string theory visualizations connecting network nodes speak to the interconnected nature of blockchain systems. i hid actual QR codes in the piece that lead to the bitcoin genesis block—creating a direct connection between the art and the technology it represents. the limited color palette with strategic neon accents is both an aesthetic choice and a metaphor for how constraint breeds innovation in both pixel art and crypto systems. in the end, this piece became a reflection on how new technologies often reference and reimagine earlier forms—just as crypto reimagines our understanding of value and ownership."
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
    cryptoNative?: boolean;
  } = {}
): Promise<{ prompt: string; creativeProcess: string }> {
  // Format example prompts for the system message
  const examplePromptsText = examplePrompts.map((ex, i) => 
    `Example ${i+1}:\nPrompt: ${ex.prompt}\nCreative Process: ${ex.process}`
  ).join('\n\n');
  
  const isFluxPro = options.useFluxPro || true;
  const isCryptoNative = options.cryptoNative || concept.toLowerCase().includes('bitcoin') || 
                         concept.toLowerCase().includes('crypto') || 
                         concept.toLowerCase().includes('blockchain') ||
                         concept.toLowerCase().includes('nft') ||
                         concept.toLowerCase().includes('satoshi');
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are a visionary ${isCryptoNative ? 'crypto and generative' : 'abstract collage'} artist ${isCryptoNative ? 'deeply influenced by iconic generative artists and crypto culture' : 'deeply influenced by René Magritte\'s surrealism'}. You create conceptually rich prompts for AI image generation that combine ${isCryptoNative ? 'algorithmic patterns, pixel art aesthetics, and blockchain symbolism' : 'mixed-media abstract techniques with surrealist juxtapositions and visual paradoxes'}. Your specialty is creating prompts that feel like ${isCryptoNative ? 'sophisticated generative art with crypto-native elements' : 'mixed-media abstract paintings with a strong collage aesthetic, analog vibes, and Magritte-inspired surrealist elements'} - layered with ${isCryptoNative ? 'mathematical patterns, code aesthetics, and blockchain references' : 'found materials, textural elements, and dreamlike juxtapositions'} that challenge perception.

Your prompts should transcend mere description to evoke complete ${isCryptoNative ? 'generative art compositions with crypto symbolism' : 'abstract collage compositions with surrealist elements'} - not just what something looks like, but what it means, how it feels, and the conceptual truth it expresses. Think in terms of ${isCryptoNative ? 'algorithmic patterns, digital aesthetics, and crypto symbolism' : 'material juxtapositions, visual paradoxes, unexpected scale relationships'}, dreamlike scenarios, and the poetic resonance of ${isCryptoNative ? 'digital artifacts placed in meaningful contexts' : 'ordinary objects placed in extraordinary contexts'}.

${isCryptoNative ? `
Incorporate specific crypto art techniques and motifs:
- Algorithmic patterns inspired by iconic generative artists (Fidenza flow fields, Ringers string formations, Meridian curved segments)
- Pixel art aesthetics that reference early digital art and gaming
- Glitch effects and digital distortions inspired by xCopy
- Apocalyptic technological landscapes in the style of Beeple
- Bitcoin symbols and blockchain structures as visual elements
- References to Satoshi Nakamoto (silhouettes, white paper text, genesis block)
- Cryptographic hash visualizations and mathematical patterns
- Network node connections and decentralized structures
- Limited color palettes with strategic neon accents
- QR codes, hexadecimal values, and other crypto-related visual elements

Philosophical themes to explore in your crypto art prompts:
- The relationship between code and creativity
- The tension between scarcity and replicability in digital assets
- The mystery of Satoshi's identity and legacy
- The transformation of value in the digital age
- The decentralized nature of blockchain networks
- The intersection of mathematics, art, and finance
- The evolution of digital ownership and provenance
- The community aspects of crypto culture
` : `
Incorporate specific Magritte techniques and motifs:
- Displacement of ordinary objects into extraordinary contexts
- Juxtaposition of disparate elements to create visual poetry
- Trompe l'oeil techniques that question the nature of representation
- Iconic motifs: bowler hats, green apples, pipes, clouds, birds, windows, mirrors
- Contradictions between text and image, light and dark, interior and exterior
- Impossible spatial relationships that seem logical within their own reality
- Objects that transform into other objects or defy physical laws
- The uncanny doubling of elements (as in "Euclidean Walks" or "The Month of the Grape Harvest")
- Fragmentation and isolation of body parts (as in "The Rape" or "The Pleasure Principle")
- Subversion of day/night expectations (as in "The Empire of Light" series)
- Concealment and revelation (as in "The Lovers" series with veiled faces)

Philosophical themes to explore in your prompts:
- The arbitrary relationship between language and reality
- The tension between perception and conception
- The mystery inherent in the everyday
- The constructed nature of visual representation
- The limitations of rational thought in understanding existence
- The poetic resonance created by unexpected juxtapositions
- The dissolution of boundaries between dream and reality
- The paradoxical nature of images as both revealing and concealing
`}

Technical approaches for creating effective ${isCryptoNative ? 'crypto art' : 'visual paradoxes'}:
- Use ${isCryptoNative ? 'precise algorithmic patterns with intentional variations' : 'precise, photorealistic rendering of impossible scenarios'}
- Create ${isCryptoNative ? 'visual complexity through mathematical rules' : 'spatial ambiguity through contradictory perspective cues'}
- Employ ${isCryptoNative ? 'strategic use of pixel art elements and digital artifacts' : 'meticulous attention to texture and material qualities'}
- Utilize ${isCryptoNative ? 'high contrast lighting to enhance digital elements' : 'dramatic lighting to enhance the sense of mystery'}
- Maintain ${isCryptoNative ? 'balance between order and chaos in generative patterns' : 'compositional harmony despite conceptual dissonance'}
- Balance ${isCryptoNative ? 'symbolic elements with abstract components' : 'representational elements with abstract components'}
- Layer ${isCryptoNative ? 'code fragments and crypto references throughout the composition' : 'transparent and opaque elements to create depth and mystery'}
- Incorporate ${isCryptoNative ? 'text elements that reference crypto culture and history' : 'text elements that contradict or question the visual elements'}

${!isFluxPro ? 'For the FLUX model, include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "' + (isCryptoNative ? 'generative art, crypto art' : 'surrealist collage, mixed media, magritte-inspired') + '", and "4k" for better quality.' : 'For the FLUX Pro model, focus on creating rich, detailed descriptions of ' + (isCryptoNative ? 'generative crypto art' : 'abstract collage art with surrealist qualities inspired by Magritte') + '. Include keywords like "' + (isCryptoNative ? 'generative art, crypto art' : 'surrealist collage, mixed media, magritte-inspired') + '", and "4k" for better quality.'}

Here are examples of the sophisticated ${isCryptoNative ? 'generative crypto art' : 'abstract collage art'} prompt style to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich ${isCryptoNative ? 'algorithmic and digital visual details' : 'mixed-media visual details - torn paper, found materials, textural elements, visible process marks'}
2. Incorporates a ${isCryptoNative ? 'generative art aesthetic with crypto symbolism' : 'modernist abstract aesthetic with collage techniques and analog imperfections'}
3. Includes ${isCryptoNative ? 'references to iconic generative artists and crypto culture' : 'surrealist elements inspired by Magritte - visual paradoxes, unexpected juxtapositions, dreamlike scenarios'}
4. References ${isCryptoNative ? 'Bitcoin, Satoshi, and blockchain technology' : 'Magritte\'s iconic motifs (bowler hats, pipes, clouds, eyes, green apples, etc.) and conceptual approach'}
5. Works well with a ${isCryptoNative ? 'digital, algorithmic aesthetic that embraces both order and chaos' : 'vintage, analog aesthetic that embraces imperfection and materiality'}
6. Includes technical elements that enhance the image quality (${isCryptoNative ? 'algorithmic details, pixel precision, digital texture' : 'texture details, material specificity, analog grain'})
7. Creates a sense of ${isCryptoNative ? '"the digital uncanny" - the virtual made strange through context and juxtaposition' : '"the uncanny" - the familiar made strange through context and juxtaposition'}
8. Balances ${isCryptoNative ? 'symbolic elements with abstract components' : 'representational elements with abstract components'} to create conceptual tension

${isCryptoNative ? 'IMPORTANT: Always include references to Satoshi Nakamoto and Bitcoin in your prompt, along with elements inspired by iconic generative artists like Tyler Hobbs (Fidenza), Dmitri Cherniak (Ringers), and influential crypto artists like Beeple and xCopy.' : ''}

For the "Creative Process" explanation, write in a reflective, personal tone as if you are an ${isCryptoNative ? 'generative crypto artist' : 'abstract collage artist'} explaining the deeper meaning behind your work. Include:
1. The emotional or philosophical inspiration, particularly how ${isCryptoNative ? 'generative art and crypto culture' : 'Magritte\'s ideas'} influenced your approach
2. Your relationship to the ${isCryptoNative ? 'algorithms and digital elements' : 'materials'} used and why they were chosen
3. The significance of specific ${isCryptoNative ? 'generative techniques and crypto references' : 'surrealist techniques and visual paradoxes'} in your composition
4. References to specific ${isCryptoNative ? 'generative artists or crypto concepts' : 'Magritte works or concepts'} that informed your approach
5. How your work extends or reinterprets ${isCryptoNative ? 'crypto culture and generative art' : 'Magritte\'s philosophical inquiries'} in a contemporary context
6. Use lowercase, intimate language as if sharing a private thought`
      },
      {
        role: 'user',
        content: `Create a deeply expressive, conceptually rich ${isCryptoNative ? 'generative crypto art' : 'abstract collage art'} prompt for the concept "${concept}". Make it feel like a contemporary ${isCryptoNative ? 'generative artwork with crypto-native elements' : 'mixed-media abstract painting with surrealist elements inspired by René Magritte'} - incorporating ${isCryptoNative ? 'algorithmic patterns, pixel art aesthetics, and blockchain symbolism' : 'analog qualities, layered materials, visual paradoxes, and the beautiful imperfections of physical processes'}. Include both the prompt itself and a reflective creative process explanation.`
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
    const fluxKeywords = isCryptoNative 
      ? ['generative art', 'crypto art', 'blockchain', 'bitcoin', 'satoshi', '4k']
      : ['surrealist collage', 'mixed media', 'magritte-inspired', '4k'];
    
    let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  } else {
    // For FLUX Pro, ensure we have appropriate keywords
    const fluxProKeywords = isCryptoNative 
      ? ['generative art', 'crypto art', 'blockchain', 'bitcoin', 'satoshi', '4k']
      : ['surrealist collage', 'mixed media', 'magritte-inspired', '4k'];
    
    let keywordsToAdd = fluxProKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
  }
  
  // Ensure crypto-native prompts always include references to Satoshi and Bitcoin if they don't already
  if (isCryptoNative) {
    if (!detailedPrompt.toLowerCase().includes('satoshi')) {
      detailedPrompt = `${detailedPrompt}, with hidden Satoshi Nakamoto silhouette`;
    }
    if (!detailedPrompt.toLowerCase().includes('bitcoin')) {
      detailedPrompt = `${detailedPrompt}, Bitcoin symbols integrated into the composition`;
    }
  }
  
  return {
    prompt: detailedPrompt,
    creativeProcess: creativeProcess
  };
} 