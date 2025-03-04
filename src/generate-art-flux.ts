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
    
    // Get concept from command line arguments or generate a new one
    let concept = process.argv[2];
    // Get category from command line arguments (if provided)
    const categoryArg = process.argv[3];
    
    if (!concept) {
      // Determine which category to use
      let category: ConceptCategory | undefined;
      
      if (categoryArg) {
        // Try to match the category argument to a valid category
        const categoryKey = Object.keys(ConceptCategory).find(
          key => key.toLowerCase() === categoryArg.toLowerCase()
        );
        
        if (categoryKey) {
          category = ConceptCategory[categoryKey as keyof typeof ConceptCategory];
          console.log(`🎬 Generating a ${category} concept...`);
        } else {
          console.log(`⚠️ Unknown category: "${categoryArg}". Using MAGRITTE_SURREALISM as default.`);
          category = ConceptCategory.MAGRITTE_SURREALISM;
        }
      } else {
        // If no category specified, use a random Magritte category for variety
        const categories = Object.values(ConceptCategory).filter(cat => 
          typeof cat === 'string' && cat.toString().startsWith('magritte_')
        );
        category = categories[Math.floor(Math.random() * categories.length)] as ConceptCategory;
        console.log(`🎬 Generating a ${category} concept...`);
      }
      
      // Generate the concept with the selected category
      concept = await generateCinematicConcept(aiService, { 
        temperature: 0.9,
        category
      });
    }
    
    console.log(`💡 Using concept: "${concept}"\n`);
    
    // Default image settings for FLUX
    const width = 768;
    const height = 768;
    const numInferenceSteps = 28;
    const guidanceScale = 3;
    
    console.log(`📐 Image dimensions: ${width}x${height}`);
    console.log(`🔄 Inference steps: ${numInferenceSteps}`);
    console.log(`🎯 Guidance scale: ${guidanceScale}`);
    
    // Generate detailed prompt
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
          content: `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation. 

Your prompts should be layered with meaning, metaphor, and visual complexity - not just describing what something looks like, but what it means and how it feels.

For the FLUX model (cinestill 800t style), include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "cinestill 800t", "night time", "film grain", and "4k" for better quality.

Here are examples of the sophisticated prompt style to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich visual details and textures
2. Incorporates conceptual depth and metaphorical elements
3. Suggests emotional or philosophical undertones
4. Works well with the cinematic, night-time aesthetic of FLUX
5. Includes technical elements that enhance the FLUX model (film grain, lighting details)

Also provide a brief "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.`
        },
        {
          role: 'user',
          content: `Create a conceptually rich, detailed art prompt for the concept "${concept}". Include both the prompt itself and a brief creative process explanation.`
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
    if (!detailedPrompt.includes('CNSTLL')) {
      detailedPrompt = `CNSTLL ${detailedPrompt}`;
    }
    
    // Add FLUX-specific keywords if they're not already present
    const fluxKeywords = ['cinestill 800t', 'film grain', 'night time', '4k'];
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
    
    // Generate image using FLUX model on Replicate
    console.log('🖼️ Generating image with FLUX...');
    
    // Make a direct API call to Replicate
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
      category: categoryArg || 'auto-generated',
      prompt: detailedPrompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Metadata saved to: ${metadataPath}`);
    
    console.log('\n✨ Art generation completed successfully!');
    
    return {
      concept,
      category: categoryArg || 'auto-generated',
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