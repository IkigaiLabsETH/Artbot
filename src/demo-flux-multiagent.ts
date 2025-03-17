import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { AIService } from './services/ai/index.js';

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

// Multi-Agent System Simulation
class MultiAgentSystem {
  private aiService: AIService;
  private replicateApiKey: string;
  private outputDir: string;
  
  constructor(aiService: AIService, replicateApiKey: string) {
    this.aiService = aiService;
    this.replicateApiKey = replicateApiKey;
    this.outputDir = path.join(__dirname, '..', 'output');
    ensureDirectoryExists(this.outputDir);
  }
  
  // Director Agent: Coordinates the creative process
  async directorAgent(project: { title: string, description: string, requirements: string[] }): Promise<any> {
    console.log('🎬 Director Agent: Starting project coordination');
    console.log(`Project: ${project.title}`);
    console.log(`Description: ${project.description}`);
    console.log('Requirements:');
    project.requirements.forEach(req => console.log(`- ${req}`));
    console.log('');
    
    // Step 1: Generate creative ideas with Ideator Agent
    console.log('🎬 Director Agent: Requesting ideas from Ideator Agent');
    const ideaResult = await this.ideatorAgent(project);
    
    // Step 2: Develop artistic style with Stylist Agent
    console.log('🎬 Director Agent: Requesting style development from Stylist Agent');
    const styleResult = await this.stylistAgent(ideaResult);
    
    // Step 3: Refine and generate artwork with Refiner Agent
    console.log('🎬 Director Agent: Requesting artwork refinement from Refiner Agent');
    const artworkResult = await this.refinerAgent(styleResult);
    
    // Step 4: Evaluate artwork with Critic Agent
    console.log('🎬 Director Agent: Requesting critique from Critic Agent');
    const critiqueResult = await this.criticAgent(artworkResult);
    
    // Step 5: Compile final results
    const finalResult = {
      project,
      idea: ideaResult,
      style: styleResult,
      artwork: artworkResult,
      critique: critiqueResult,
      timestamp: new Date().toISOString()
    };
    
    // Save the project results
    const resultPath = path.join(this.outputDir, `${project.title.replace(/\s+/g, '-').toLowerCase()}-project.json`);
    fs.writeFileSync(resultPath, JSON.stringify(finalResult, null, 2));
    console.log(`✅ Project results saved to: ${resultPath}`);
    
    return finalResult;
  }
  
  // Ideator Agent: Generates creative ideas
  async ideatorAgent(project: { title: string, description: string, requirements: string[] }): Promise<any> {
    console.log('💡 Ideator Agent: Generating creative ideas');
    
    const ideaResponse = await this.aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are the Ideator Agent in a multi-agent art creation system. Your role is to generate creative ideas based on project requirements.
          
Generate a creative concept that:
1. Aligns with the project requirements
2. Has conceptual depth and metaphorical elements
3. Is visually compelling and emotionally resonant
4. Would work well with the cinematic, night-time aesthetic of the FLUX model
5. Has potential for artistic exploration

Provide your response in this format:
- Concept: [A concise title for the concept]
- Description: [A detailed description of the concept, 100-150 words]
- Visual Elements: [List 5-7 key visual elements that should be included]
- Metaphorical Aspects: [Explain 2-3 metaphorical or symbolic aspects]
- Emotional Tone: [Describe the intended emotional impact]`
        },
        {
          role: 'user',
          content: `Generate a creative concept for this project:
Title: ${project.title}
Description: ${project.description}
Requirements:
${project.requirements.map(req => `- ${req}`).join('\n')}`
        }
      ],
      temperature: 0.8,
      maxTokens: 1000
    });
    
    console.log('💡 Ideator Agent: Ideas generated');
    console.log(ideaResponse.content);
    console.log('');
    
    return {
      content: ideaResponse.content,
      timestamp: new Date().toISOString()
    };
  }
  
  // Stylist Agent: Develops artistic styles
  async stylistAgent(ideaResult: { content: string, timestamp: string }): Promise<any> {
    console.log('🎨 Stylist Agent: Developing artistic style');
    
    const styleResponse = await this.aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are the Stylist Agent in a multi-agent art creation system. Your role is to develop a cohesive artistic style based on conceptual ideas.
          
Create a detailed style guide that:
1. Defines a cohesive visual style for the concept
2. Specifies color palette, lighting, composition, and textures
3. Incorporates elements that work well with the FLUX model (cinestill 800t film aesthetic)
4. Includes specific technical considerations for AI image generation
5. Enhances the conceptual and metaphorical aspects of the idea

For the FLUX model, include elements like:
- Film grain and analog photography aesthetics
- Cinematic lighting (especially night scenes)
- Rich, saturated colors with emphasis on reds and blues
- Dramatic shadows and highlights
- Urban or nocturnal settings when appropriate

Provide your response in this format:
- Style Name: [A descriptive name for the style]
- Visual Approach: [Overall description of the visual approach]
- Color Palette: [Specific colors and their relationships]
- Lighting: [Lighting style and techniques]
- Composition: [Compositional approach and framing]
- Textures: [Key textural elements]
- Technical Considerations: [Specific technical elements for AI generation]`
        },
        {
          role: 'user',
          content: `Develop an artistic style for this concept:
${ideaResult.content}`
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });
    
    console.log('🎨 Stylist Agent: Style developed');
    console.log(styleResponse.content);
    console.log('');
    
    return {
      ideaContent: ideaResult.content,
      styleContent: styleResponse.content,
      timestamp: new Date().toISOString()
    };
  }
  
  // Refiner Agent: Refines and generates artwork
  async refinerAgent(styleResult: { ideaContent: string, styleContent: string, timestamp: string }): Promise<any> {
    console.log('✨ Refiner Agent: Refining and generating artwork');
    
    // Generate the prompt for FLUX
    const promptResponse = await this.aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are the Refiner Agent in a multi-agent art creation system. Your role is to create a detailed prompt for the FLUX image generation model based on the concept and style guide.
          
Create a detailed prompt that:
1. Incorporates all key elements from the concept and style guide
2. Is optimized for the FLUX model (cinestill 800t film aesthetic)
3. Includes the trigger word "IKIGAI" at the beginning
4. Incorporates technical keywords like "cinestill 800t", "film grain", "night time", and "analog"
5. Has rich visual details and metaphorical elements
6. Is approximately 150-250 words in length

Also provide a brief "Creative Process" explanation that reveals the thinking behind the prompt.

Provide your response in this format:
Prompt: [Your detailed prompt starting with IKIGAI]

Creative Process: [Brief explanation of your thinking]`
        },
        {
          role: 'user',
          content: `Create a detailed prompt based on this concept and style guide:

CONCEPT:
${styleResult.ideaContent}

STYLE GUIDE:
${styleResult.styleContent}`
        }
      ],
      temperature: 0.7,
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
    
    console.log('✨ Refiner Agent: Prompt created');
    console.log(`Prompt: ${detailedPrompt}`);
    console.log(`Creative Process: ${creativeProcess}`);
    console.log('');
    
    // Generate image using FLUX model on Replicate
    console.log('✨ Refiner Agent: Generating image with FLUX...');
    
    // Default image settings for FLUX
    const width = 768;
    const height = 768;
    const numInferenceSteps = 28;
    const guidanceScale = 3;
    
    // Make a direct API call to Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.replicateApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
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
    console.log(`✨ Refiner Agent: Prediction started: ${data.id}`);
    
    // Wait for the prediction to complete
    const prediction = await waitForPrediction(data.urls.get, this.replicateApiKey);
    
    if (!prediction.output || prediction.output.length === 0) {
      throw new Error('Failed to generate image: No output returned');
    }
    
    const imageUrl = prediction.output[0];
    console.log(`✨ Refiner Agent: Image generated: ${imageUrl}`);
    
    // Extract a filename from the idea content
    const conceptMatch = styleResult.ideaContent.match(/Concept:\s*([^\n]+)/);
    const conceptName = conceptMatch && conceptMatch[1] 
      ? conceptMatch[1].trim().replace(/\s+/g, '-').toLowerCase() 
      : 'flux-artwork';
    
    // Download the image
    const outputImagePath = path.join(this.outputDir, `${conceptName}.png`);
    await downloadImage(imageUrl, outputImagePath);
    
    return {
      prompt: detailedPrompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      localImagePath: outputImagePath,
      parameters: {
        width,
        height,
        numInferenceSteps,
        guidanceScale
      },
      timestamp: new Date().toISOString()
    };
  }
  
  // Critic Agent: Evaluates artwork
  async criticAgent(artworkResult: { 
    prompt: string, 
    creativeProcess: string, 
    imageUrl: string,
    localImagePath: string,
    parameters: any,
    timestamp: string 
  }): Promise<any> {
    console.log('🔍 Critic Agent: Evaluating artwork');
    
    const critiqueResponse = await this.aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are the Critic Agent in a multi-agent art creation system. Your role is to evaluate the generated artwork and provide constructive feedback.
          
Provide a thoughtful critique that:
1. Analyzes how well the artwork fulfills the prompt
2. Identifies strengths and successful elements
3. Suggests potential improvements or alternative approaches
4. Evaluates the technical execution and aesthetic quality
5. Considers the conceptual depth and emotional impact

Provide your response in this format:
- Overall Assessment: [Brief overall evaluation]
- Strengths: [List 3-5 successful aspects]
- Areas for Improvement: [List 2-3 aspects that could be enhanced]
- Technical Execution: [Evaluation of technical aspects]
- Conceptual Depth: [Analysis of conceptual and metaphorical elements]
- Emotional Impact: [Assessment of emotional resonance]
- Suggestions for Next Iteration: [2-3 specific suggestions]`
        },
        {
          role: 'user',
          content: `Evaluate this artwork:

PROMPT:
${artworkResult.prompt}

CREATIVE PROCESS:
${artworkResult.creativeProcess}

IMAGE URL:
${artworkResult.imageUrl}

The image has been generated using the FLUX model (adirik/flux-cinestill) with these parameters:
- Width: ${artworkResult.parameters.width}
- Height: ${artworkResult.parameters.height}
- Inference Steps: ${artworkResult.parameters.numInferenceSteps}
- Guidance Scale: ${artworkResult.parameters.guidanceScale}`
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });
    
    console.log('🔍 Critic Agent: Evaluation complete');
    console.log(critiqueResponse.content);
    console.log('');
    
    return {
      content: critiqueResponse.content,
      timestamp: new Date().toISOString()
    };
  }
}

// Main function to run the demo
async function runFluxMultiAgentDemo() {
  try {
    console.log('🤖 ArtBot Multi-Agent System with FLUX Integration');
    console.log('------------------------------------------------');
    
    // Initialize services
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is required for image generation with FLUX');
    }
    
    if (!anthropicApiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required for agent communication');
    }
    
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('✅ Services initialized\n');
    
    // Initialize the multi-agent system
    const multiAgentSystem = new MultiAgentSystem(aiService, replicateApiKey);
    
    // Define a project
    const project = {
      title: process.argv[2] || "Nocturnal Reflections",
      description: "An exploration of urban nightlife through a cinematic lens, capturing the interplay of artificial light and human emotion.",
      requirements: [
        "Create a moody, atmospheric image with cinematic quality",
        "Incorporate elements of urban nightlife and technology",
        "Explore themes of isolation and connection in modern society",
        "Use lighting as a metaphorical element",
        "Evoke a sense of contemplative nostalgia"
      ]
    };
    
    // Run the multi-agent system
    await multiAgentSystem.directorAgent(project);
    
    console.log('✅ Multi-Agent Demo completed successfully!');
    
  } catch (error) {
    console.error(`Error running multi-agent demo: ${error}`);
    throw error;
  }
}

// Run the demo
runFluxMultiAgentDemo().catch(console.error); 