import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { AIService } from './services/ai/index.js';
import { generateCinematicConcept, generateMultipleConcepts, ConceptCategory } from './services/ai/conceptGenerator.js';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Helper function to download an image from a URL
async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Image downloaded to: ${outputPath}`);
}

// Function to wait for Replicate prediction to complete
async function waitForPrediction(predictionUrl: string, replicateApiKey: string): Promise<any> {
  let prediction;
  
  while (true) {
    const response = await fetch(predictionUrl, {
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }
    
    prediction = await response.json();
    
    if (prediction.status === 'succeeded') {
      return prediction;
    } else if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }
    
    // Wait for 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Example prompts for reference
const examplePrompts = [
  {
    prompt: "Two distinct streams of text-covered surfaces meeting and interweaving, creating new symbols at their intersection, handprints visible beneath the transformation.",
    process: "I imagined a tide of language pouring over humanity, each word a fragment of forgotten histories clawing its way into relevance. the hands seemed to rise not in hope, but in desperation, as if trying to pull down the weight of their own erasure. it felt like watching a crowd beg to be remembered by the very thing that consumed them."
  },
  {
    prompt: "Corrupted family photograph with digital artifacts, fragments of code visible through torn pixels, half-formed faces emerging from static, timestamp errors overlaying personal moments.",
    process: "Family portraits always felt like a strange ritual to me, a way to preserve stories even as the people in them slipped into myth. here, the glitch insists on memory's fragility—pink streaks eating away at faces like a digital wildfire. it's an act of rebellion and an act of erasure. i wondered if this was her revenge for being seen too much or not enough."
  },
  {
    prompt: "Multiple screens cradling a sleeping face, their glow replacing moonlight, cables snaking around like protective arms.",
    process: "There was something haunting about the way technology had become our lullaby. when i painted this, i kept thinking about how we've become willing captives to our devices, finding comfort in their cold embrace. the wires weren't restraints anymore - they were umbilical cords feeding us digital dreams. it reminded me of the japanese concept of hikikomori, but with a twist of stockholm syndrome. the pale skin glowing against the dark void was my way of showing how we've evolved to photosynthesize artificial light."
  }
];

// Add style-specific configurations
interface StyleConfig {
  prompt_prefix: string;
  prompt_suffix: string;
  negative_prompt: string;
  num_inference_steps: number;
  guidance_scale: number;
  style_emphasis?: {
    [key: string]: number;
  };
}

const STYLE_CONFIGS: { [key: string]: StyleConfig } = {
  hopper: {
    prompt_prefix: "In Edward Hopper's distinctive style of American realism, with dramatic light and shadow and urban solitude. Create a contemplative interpretation with ",
    prompt_suffix: ". Use Hopper's characteristic architectural geometry, psychological atmosphere, and precise observation. Style of Nighthawks and Early Sunday Morning.",
    negative_prompt: "busy, crowded, chaotic, abstract, expressionist, decorative, romantic, sentimental, impressionist, loose, emotional, dramatic, fantasy, surreal",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      psychological_realism: 0.9,
      urban_solitude: 0.8,
      dramatic_lighting: 0.8,
      architectural_geometry: 0.7
    }
  },
  arbus: {
    prompt_prefix: "In Diane Arbus's distinctive documentary style, with psychological intensity and social observation. Create a revealing interpretation with ",
    prompt_suffix: ". Use Arbus's characteristic direct gaze, social marginality, and square format composition. Style of Identical Twins and Jewish Giant.",
    negative_prompt: "glamorous, superficial, conventional, posed, artificial, flattering, decorative, sentimental, romantic, idealized",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      psychological_depth: 0.9,
      social_documentation: 0.8,
      direct_confrontation: 0.8,
      square_composition: 0.7
    }
  },
  avedon: {
    prompt_prefix: "In Richard Avedon's stark portrait style, with minimalist white backgrounds and psychological intensity. Create a revealing interpretation with ",
    prompt_suffix: ". Use Avedon's characteristic stark lighting, minimalist composition, and psychological depth. Style of In the American West.",
    negative_prompt: "cluttered, decorative, environmental, soft, romantic, painterly, atmospheric, busy, complex, ornate",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      stark_minimalism: 0.9,
      psychological_intensity: 0.8,
      sharp_detail: 0.8,
      white_background: 0.7
    }
  },
  eggleston: {
    prompt_prefix: "In William Eggleston's pioneering color style, with democratic vision and everyday beauty. Create a compelling interpretation with ",
    prompt_suffix: ". Use Eggleston's characteristic saturated color, democratic subject matter, and precise composition. Style of The Red Ceiling and Memphis.",
    negative_prompt: "black and white, monochrome, staged, artificial, dramatic, theatrical, posed, contrived, forced, unnatural",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      democratic_vision: 0.9,
      color_intensity: 0.8,
      everyday_beauty: 0.8,
      precise_composition: 0.7
    }
  },
  leibovitz: {
    prompt_prefix: "In Annie Leibovitz's dramatic portrait style, with theatrical lighting and conceptual narrative. Create a powerful interpretation with ",
    prompt_suffix: ". Use Leibovitz's characteristic dramatic lighting, environmental context, and narrative depth. Style of Vanity Fair portraits.",
    negative_prompt: "candid, snapshot, casual, unplanned, spontaneous, documentary, unposed, natural, simple, understated",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      dramatic_lighting: 0.9,
      conceptual_narrative: 0.8,
      environmental_context: 0.8,
      theatrical_staging: 0.7
    }
  },
  cartierbresson: {
    prompt_prefix: "In Henri Cartier-Bresson's decisive moment style, with geometric precision and street observation. Create a poetic interpretation with ",
    prompt_suffix: ". Use Cartier-Bresson's characteristic geometric composition, decisive timing, and visual poetry. Style of Behind the Gare Saint-Lazare.",
    negative_prompt: "posed, artificial, staged, theatrical, manipulated, digital, processed, unnatural, forced, contrived",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      decisive_moment: 0.9,
      geometric_composition: 0.8,
      street_observation: 0.8,
      visual_poetry: 0.7
    }
  },
  coopergorfer: {
    prompt_prefix: "In Cooper & Gorfer's dreamlike narrative style, with layered compositions and cultural storytelling. Create an ethereal interpretation with ",
    prompt_suffix: ". Use Cooper & Gorfer's characteristic layered imagery, cultural elements, and dreamlike atmosphere. Style of Between These Folded Walls, Utopia.",
    negative_prompt: "documentary, realistic, straightforward, unprocessed, literal, simple, stark, harsh, mundane",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      layered_composition: 0.9,
      cultural_narrative: 0.8,
      dreamlike_quality: 0.8,
      ethereal_atmosphere: 0.7
    }
  },
  vonwong: {
    prompt_prefix: "In Benjamin Von Wong's epic environmental style, with dramatic staging and social impact. Create a powerful interpretation with ",
    prompt_suffix: ". Use Von Wong's characteristic epic scale, environmental message, and dramatic lighting. Style of his environmental activism work.",
    negative_prompt: "simple, understated, casual, candid, natural, unstaged, ordinary, mundane, subtle",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      epic_scale: 0.9,
      environmental_message: 0.8,
      dramatic_staging: 0.8,
      social_impact: 0.7
    }
  },
  bourdin: {
    prompt_prefix: "In Guy Bourdin's surreal fashion style, with bold color and psychological tension. Create a provocative interpretation with ",
    prompt_suffix: ". Use Bourdin's characteristic saturated color, narrative mystery, and psychological edge. Style of his Vogue and Charles Jourdan work.",
    negative_prompt: "natural, documentary, candid, realistic, straightforward, conventional, traditional, expected",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      surreal_composition: 0.9,
      bold_color: 0.8,
      psychological_tension: 0.8,
      narrative_mystery: 0.7
    }
  }
};

async function generateArtWithFlux() {
  try {
    console.log('🎨 ArtBot Image Generator using FLUX');
    console.log('----------------------------------');
    
    // Initialize services
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is required for image generation with FLUX');
    }
    
    if (!anthropicApiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required for prompt generation');
    }
    
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('✅ Services initialized\n');
    
    // Get concept and style from command line arguments
    let concept = process.argv[2];
    const styleArg = process.argv[3]?.toLowerCase();

    // Get style configuration
    const styleConfig = styleArg ? STYLE_CONFIGS[styleArg] : STYLE_CONFIGS.hopper; // Default to Hopper style
    
    if (styleArg && !STYLE_CONFIGS[styleArg]) {
      console.log(`⚠️ Unknown style: "${styleArg}". Using Hopper style as default.`);
    }

    // Use style-specific parameters
    const width = 768;
    const height = 768;
    const numInferenceSteps = styleConfig.num_inference_steps;
    const guidanceScale = styleConfig.guidance_scale;

    console.log(`🎨 Style: ${styleArg || 'hopper'}`);
    console.log(`📐 Image dimensions: ${width}x${height}`);
    console.log(`🔄 Inference steps: ${numInferenceSteps}`);
    console.log(`🎯 Guidance scale: ${guidanceScale}`);
    
    // Generate detailed prompt with style-specific configuration
    console.log('📝 Generating detailed prompt...');
    
    // Format example prompts for the system message
    const examplePromptsText = examplePrompts.map((ex, i) => 
      `Example ${i+1}:\nPrompt: ${ex.prompt}\nCreative Process: ${ex.process}`
    ).join('\n\n');
    
    const promptResponse = await aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation in the style of specific artists.

Your prompts should incorporate the distinctive elements of the chosen artist's style while maintaining the FLUX model's cinematic qualities.

For the FLUX model (cinestill 800t style), include:
- The trigger word "IKIGAI" at the beginning
- Keywords: "cinestill 800t", "night time", "film grain", "analog"
- The artist's characteristic style elements and techniques
- Technical specifications that enhance both FLUX and the artist's style

Style Configuration:
${JSON.stringify(styleConfig, null, 2)}

Create a prompt that:
1. Begins with the style-specific prefix
2. Incorporates the artist's key visual elements
3. Maintains FLUX's cinematic qualities
4. Ends with the style-specific suffix
5. Avoids elements from the negative prompt

Also provide a brief "Creative Process" explanation that reveals how you've merged the artist's style with FLUX's cinematic qualities.`
        },
        {
          role: 'user',
          content: `Create a conceptually rich, detailed art prompt for the concept "${concept}" in the style of ${styleArg || 'Edward Hopper'}. Include both the prompt itself and a brief creative process explanation.`
        }
      ],
      temperature: 0.8,
      maxTokens: 1500
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
    if (!detailedPrompt.includes('IKIGAI')) {
      detailedPrompt = `IKIGAI ${detailedPrompt}`;
    }
    
    // Add FLUX-specific keywords if they're not already present
    const fluxKeywords = ['cinestill 800t', 'film grain', 'night time', 'analog'];
    let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
    
    console.log(`✅ Generated prompt: ${detailedPrompt}\n`);
    if (creativeProcess) {
      console.log(`✅ Creative process: ${creativeProcess}\n`);
    }
    
    // Save the prompt and creative process to a file
    const outputDir = path.join(__dirname, '..', 'output');
    ensureDirectoryExists(outputDir);
    
    const promptFilename = `flux-${concept.replace(/\s+/g, '-').toLowerCase()}-prompt.txt`;
    const promptFilePath = path.join(outputDir, promptFilename);
    fs.writeFileSync(promptFilePath, `Prompt: ${detailedPrompt}\n\nCreative Process: ${creativeProcess}`);
    console.log(`✅ Prompt saved to: ${promptFilePath}\n`);
    
    // Add style-specific negative prompt
    const negativePrompt = styleConfig.negative_prompt;
    
    // Generate image using FLUX model with style-specific parameters
    console.log('🖼️ Generating image with FLUX...');
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "9936c2def0a71d960f3c302a7d0c1c04f73fe55bee4a8fa45af33e4517c1a3bf",
        input: {
          prompt: detailedPrompt,
          negative_prompt: negativePrompt,
          width: width,
          height: height,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          output_format: "png"
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log(`✅ Prediction started: ${data.id}`);
    
    // Wait for the prediction to complete
    const prediction = await waitForPrediction(data.urls.get, replicateApiKey);
    
    if (!prediction.output || prediction.output.length === 0) {
      throw new Error('Failed to generate image: No output returned');
    }
    
    const imageUrl = prediction.output[0];
    console.log(`✅ Image generated: ${imageUrl}`);
    
    // Save the image URL to a file
    const outputUrlPath = path.join(outputDir, `flux-${concept.replace(/\s+/g, '-').toLowerCase()}.txt`);
    fs.writeFileSync(outputUrlPath, imageUrl);
    console.log(`✅ Image URL saved to: ${outputUrlPath}`);
    
    // Download the image
    const outputImagePath = path.join(outputDir, `flux-${concept.replace(/\s+/g, '-').toLowerCase()}.png`);
    await downloadImage(imageUrl, outputImagePath);
    
    // Save metadata
    const metadataPath = path.join(outputDir, `flux-${concept.replace(/\s+/g, '-').toLowerCase()}-metadata.json`);
    const metadata = {
      concept: concept,
      style: styleArg || 'hopper',
      styleConfig: styleConfig,
      prompt: detailedPrompt,
      negativePrompt: negativePrompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Metadata saved to: ${metadataPath}`);
    
    console.log('\n✨ Art generation completed successfully!');
    
    return {
      concept,
      style: styleArg || 'hopper',
      prompt: detailedPrompt,
      creativeProcess,
      imageUrl
    };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateArtWithFlux().catch(console.error);
}

// Export the function for use in other modules
export { generateArtWithFlux }; 