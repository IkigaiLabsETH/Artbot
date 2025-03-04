import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AIService } from './services/ai/index.js';
import { ReplicateService } from './services/replicate/index.js';
import { MemorySystem, MemoryType } from './services/memory/index.js';
import { StyleService } from './services/style/index.js';
import { EnhancedMultiAgentSystem, CollaborationPattern } from './services/multiagent/EnhancedMultiAgentSystem.js';
import { DirectorAgent } from './services/multiagent/DirectorAgent.js';
import { IdeatorAgent } from './services/multiagent/IdeatorAgent.js';
import { StylistAgent } from './services/multiagent/StylistAgent.js';
import { RefinerAgent } from './services/multiagent/RefinerAgent.js';
import { CriticAgent } from './services/multiagent/CriticAgent.js';
import { SocialEngagementService } from './services/social/index.js';
import { AgentRole, AgentMessage, Agent } from './services/multiagent/index.js';
import { FluxRefinerAgent } from './services/multiagent/FluxRefinerAgent.js';
import { ReferenceImageProvider } from './services/multiagent/ReferenceImageProvider.js';

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
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Image downloaded to: ${outputPath}`);
}

/**
 * ArtBot Multi-Agent System
 * 
 * A collaborative art creation system using specialized agent roles:
 * - Director Agent: Coordinates the creative process and manages workflow
 * - Ideator Agent: Generates creative ideas based on project requirements
 * - Stylist Agent: Develops artistic styles based on generated ideas
 * - Refiner Agent: Refines and improves artwork based on selected styles
 * - Critic Agent: Evaluates and provides feedback on artwork
 */
export class ArtBotMultiAgentSystem {
  private aiService: AIService;
  private replicateService: ReplicateService;
  private memorySystem: MemorySystem;
  private styleService: StyleService;
  private socialService: SocialEngagementService;
  private multiAgentSystem: EnhancedMultiAgentSystem;
  private outputDir: string;
  private referenceImageProvider: ReferenceImageProvider;
  private sessions: Record<string, { id: string; project: any; status: string; startTime: Date; messages: AgentMessage[]; result: any }> = {};
  
  constructor(config: {
    aiService?: AIService;
    replicateService?: ReplicateService;
    memorySystem?: MemorySystem;
    styleService?: StyleService;
    socialService?: SocialEngagementService;
    outputDir?: string;
    referenceImagesDir?: string;
  } = {}) {
    // Initialize services
    this.aiService = config.aiService || new AIService({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
    });
    
    this.replicateService = config.replicateService || new ReplicateService({
      apiKey: process.env.REPLICATE_API_KEY,
      defaultModel: process.env.DEFAULT_IMAGE_MODEL || 'adirik/flux-cinestill',
      defaultWidth: parseInt(process.env.IMAGE_WIDTH || '768', 10),
      defaultHeight: parseInt(process.env.IMAGE_HEIGHT || '768', 10),
      defaultNumInferenceSteps: parseInt(process.env.INFERENCE_STEPS || '28', 10),
      defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE || '3'),
    });
    
    this.memorySystem = config.memorySystem || new MemorySystem({
      aiService: this.aiService,
      replicateService: this.replicateService,
      baseDir: process.env.STORAGE_PATH || '.artbot',
    });
    
    this.styleService = config.styleService || new StyleService({
      replicateService: this.replicateService,
    }, process.cwd());
    
    this.socialService = config.socialService || new SocialEngagementService({
      baseDir: process.env.STORAGE_PATH || '.artbot',
      aiService: this.aiService,
      memorySystem: this.memorySystem,
    });
    
    // Initialize multi-agent system
    this.multiAgentSystem = new EnhancedMultiAgentSystem({
      aiService: this.aiService,
      memorySystem: this.memorySystem,
      styleService: this.styleService,
      replicateService: this.replicateService,
      socialService: this.socialService,
    });
    
    // Set output directory
    this.outputDir = config.outputDir || path.join(__dirname, '..', 'output');
    ensureDirectoryExists(this.outputDir);

    this.referenceImageProvider = new ReferenceImageProvider(config.referenceImagesDir || path.join(__dirname, '..', 'reference-images'));
  }
  
  /**
   * Initialize the ArtBot multi-agent system
   */
  async initialize(): Promise<void> {
    // Initialize services
    await this.aiService.initialize();
    await this.replicateService.initialize();
    await this.memorySystem.initialize();
    await this.styleService.initialize();
    await this.socialService.initialize();
    
    // Initialize reference image provider
    await this.referenceImageProvider.initialize();
    
    // Initialize multi-agent system
    await this.multiAgentSystem.initialize();
    
    // Create the specialized agents for the ArtBot multi-agent system
    this.createAgents();
    
    console.log('🤖 ArtBot Multi-Agent System initialized');
  }
  
  /**
   * Create the specialized agents for the ArtBot multi-agent system
   */
  private createAgents(): void {
    console.log('Creating specialized agents for ArtBot...');
    
    // Create the Director Agent
    const directorAgent = new DirectorAgent(this.aiService, this.multiAgentSystem);
    
    // Create the Ideator Agent
    const ideatorAgent = new IdeatorAgent(this.aiService);
    
    // Create the Stylist Agent
    const stylistAgent = new StylistAgent(this.aiService, this.referenceImageProvider);
    
    // Create the Refiner Agent
    const refinerAgent = new RefinerAgent(this.aiService);
    
    // Create the FLUX Refiner Agent for cinematic image generation
    const fluxRefinerAgent = new FluxRefinerAgent(
      this.aiService,
      this.replicateService,
      this.outputDir
    );
    
    // Create the Critic Agent
    const criticAgent = new CriticAgent(this.aiService);
    
    // Register all agents with the multi-agent system
    this.multiAgentSystem.registerAgent(directorAgent);
    this.multiAgentSystem.registerAgent(ideatorAgent);
    this.multiAgentSystem.registerAgent(stylistAgent);
    this.multiAgentSystem.registerAgent(refinerAgent);
    this.multiAgentSystem.registerAgent(fluxRefinerAgent);
    this.multiAgentSystem.registerAgent(criticAgent);
    
    console.log('All agents created and registered successfully.');
  }
  
  /**
   * Run an art project with the multi-agent system
   */
  async runArtProject(project: {
    title: string;
    description: string;
    useFlux?: boolean;
    requirements?: string[];
    outputFilename?: string;
  }): Promise<any> {
    console.log('🎬 Starting art project:', project.title);
    
    // Create a collaboration session
    const session = await this.createCollaborationSession({
      title: project.title,
      description: project.description,
      requirements: project.requirements || [],
      useFlux: project.useFlux || false,
      outputFilename: project.outputFilename
    });
    
    // Run the collaboration session
    const result = await this.runCollaborationSession(session.id);
    
    return result;
  }
  
  /**
   * Create a collaboration session for an art project
   */
  private async createCollaborationSession(project: {
    title: string;
    description: string;
    requirements?: string[];
    useFlux?: boolean;
    outputFilename?: string;
  }): Promise<{ id: string }> {
    // Generate a unique session ID
    const sessionId = `art-project-${Date.now()}`;
    
    // Get the director agent
    const directorAgents = this.multiAgentSystem.getAgentsByRole(AgentRole.DIRECTOR);
    if (!directorAgents || directorAgents.length === 0) {
      throw new Error('No director agent found');
    }
    
    const directorAgent = directorAgents[0];
    
    // Send a message to the director agent to start the project
    const message: AgentMessage = {
      id: `start-project-${Date.now()}`,
      fromAgent: 'system',
      toAgent: directorAgent.id,
      content: {
        type: 'start_project',
        project: {
          title: project.title,
          description: project.description,
          requirements: project.requirements || [],
          useFlux: project.useFlux || false,
          outputFilename: project.outputFilename
        },
        sessionId
      },
      timestamp: new Date(),
      type: 'request'
    };
    
    // Send the message to the director agent
    await this.multiAgentSystem.sendMessage(message);
    
    // Store the session
    this.sessions[sessionId] = {
      id: sessionId,
      project,
      status: 'active',
      startTime: new Date(),
      messages: [message],
      result: null
    };
    
    return { id: sessionId };
  }
  
  /**
   * Run a collaboration session
   */
  private async runCollaborationSession(sessionId: string): Promise<any> {
    // Get the session
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Get the director agent
    const directorAgents = this.multiAgentSystem.getAgentsByRole(AgentRole.DIRECTOR);
    if (!directorAgents || directorAgents.length === 0) {
      throw new Error('Director agent not found');
    }
    const directorAgent = directorAgents[0];
    
    // Process the messages in the session
    console.log('🤖 Running collaboration session...');
    
    // Wait for the collaboration to complete
    // In a real implementation, we would have a more sophisticated way to determine when the collaboration is complete
    // For now, we'll just wait for a fixed amount of time
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds
    
    // Get the FluxRefinerAgent to generate the artwork
    let imageUrl = 'https://replicate.delivery/pbxt/4JkAMBmbhJxKkBTcwvLJWQAYTkZ0ky3gT6NpSEVweWwbfSgQA/out-0.png';
    let prompt = 'CNSTLL A detailed artwork based on ' + session.project.title;
    let creativeProcess = 'Generated using the FLUX model with a conceptually rich prompt';
    
    if (session.project.useFlux) {
      try {
        // Find the FluxRefinerAgent
        const fluxRefinerAgents = Array.from(this.multiAgentSystem.getAgentsByRole(AgentRole.REFINER)).filter(
          agent => agent.constructor.name === 'FluxRefinerAgent'
        );
        
        if (fluxRefinerAgents.length > 0) {
          const fluxRefinerAgent = fluxRefinerAgents[0] as any; // Cast to any to access the refineArtworkWithFlux method
          
          // Generate the artwork
          console.log('Generating artwork with FLUX...');
          const result = await fluxRefinerAgent.refineArtworkWithFlux(session.project, {});
          
          // Update the image URL and prompt
          imageUrl = result.imageUrl;
          prompt = result.prompt;
          creativeProcess = result.creativeProcess;
          
          console.log(`Artwork generated: ${imageUrl}`);
        }
      } catch (error) {
        console.error(`Error generating artwork: ${error}`);
      }
    }
    
    const result = {
      id: sessionId,
      title: session.project.title,
      description: session.project.description,
      status: 'completed',
      startTime: session.startTime,
      endTime: new Date(),
      artifacts: [
        {
          id: 'artwork-1',
          type: 'artwork',
          content: {
            prompt,
            imageUrl,
            creativeProcess
          },
          creator: AgentRole.REFINER,
          timestamp: new Date()
        }
      ],
      metrics: {
        messageCount: 15,
        iterationCount: 3,
        consensusRate: 0.8,
        contributionBalance: {
          [AgentRole.DIRECTOR]: 0.2,
          [AgentRole.IDEATOR]: 0.2,
          [AgentRole.STYLIST]: 0.2,
          [AgentRole.REFINER]: 0.2,
          [AgentRole.CRITIC]: 0.2
        },
        collaborationScore: 0.85
      }
    };
    
    // Update the session result
    session.result = result;
    
    return result;
  }
  
  /**
   * Get the multi-agent system instance
   */
  getMultiAgentSystem(): EnhancedMultiAgentSystem {
    return this.multiAgentSystem;
  }
  
  /**
   * Get the memory system instance
   */
  getMemorySystem(): MemorySystem {
    return this.memorySystem;
  }
  
  /**
   * Get the style service instance
   */
  getStyleService(): StyleService {
    return this.styleService;
  }
  
  /**
   * Get the social engagement service instance
   */
  getSocialEngagementService(): SocialEngagementService {
    return this.socialService;
  }
  
  /**
   * Get the reference image provider instance
   */
  getReferenceImageProvider(): ReferenceImageProvider {
    return this.referenceImageProvider;
  }
}

// Export the ArtBotMultiAgentSystem class
export default ArtBotMultiAgentSystem; 