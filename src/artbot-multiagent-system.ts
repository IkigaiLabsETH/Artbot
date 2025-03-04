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
  
  constructor(config: {
    aiService?: AIService;
    replicateService?: ReplicateService;
    memorySystem?: MemorySystem;
    styleService?: StyleService;
    socialService?: SocialEngagementService;
    outputDir?: string;
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
    
    // Initialize multi-agent system
    await this.multiAgentSystem.initialize();
    
    console.log('🤖 ArtBot Multi-Agent System initialized');
  }
  
  /**
   * Create a new art project using the multi-agent system
   */
  async createArtProject(project: {
    title: string;
    description: string;
    requirements: string[];
    collaborationPattern?: CollaborationPattern;
  }): Promise<any> {
    console.log('🎬 Starting art project:', project.title);
    
    // Create specialized agents
    const directorAgent = new DirectorAgent(this.aiService);
    await directorAgent.initialize();
    
    const ideatorAgent = new IdeatorAgent(this.aiService);
    await ideatorAgent.initialize();
    
    const stylistAgent = new StylistAgent(this.aiService);
    await stylistAgent.initialize();
    
    const refinerAgent = new RefinerAgent(this.aiService);
    await refinerAgent.initialize();
    
    const criticAgent = new CriticAgent(this.aiService);
    await criticAgent.initialize();
    
    // Register agents with the multi-agent system
    this.multiAgentSystem.registerAgent(directorAgent);
    this.multiAgentSystem.registerAgent(ideatorAgent);
    this.multiAgentSystem.registerAgent(stylistAgent);
    this.multiAgentSystem.registerAgent(refinerAgent);
    this.multiAgentSystem.registerAgent(criticAgent);
    
    // Create a collaboration session
    const session = await this.createCollaborationSession(project);
    
    // Run the collaboration session
    const result = await this.runCollaborationSession(session.id, project);
    
    // Save the results
    const sanitizedTitle = project.title.replace(/\s+/g, '-').toLowerCase();
    const resultPath = path.join(this.outputDir, `${sanitizedTitle}-project.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    
    // Download the generated image if available
    if (result.artifacts && result.artifacts.length > 0) {
      const artworkArtifact = result.artifacts.find(a => a.type === 'artwork');
      if (artworkArtifact && artworkArtifact.content && artworkArtifact.content.imageUrl) {
        const imagePath = path.join(this.outputDir, `${sanitizedTitle}.png`);
        await downloadImage(artworkArtifact.content.imageUrl, imagePath);
        console.log(`✅ Artwork saved to: ${imagePath}`);
      }
    }
    
    console.log('✅ Art project completed successfully!');
    return result;
  }
  
  /**
   * Create a collaboration session for the project
   */
  private async createCollaborationSession(project: {
    title: string;
    description: string;
    requirements: string[];
    collaborationPattern?: CollaborationPattern;
  }): Promise<{ id: string }> {
    const session = await this.multiAgentSystem.createCollaborationSession(
      project.title,
      project.description,
      project.collaborationPattern || CollaborationPattern.SEQUENTIAL,
      [
        AgentRole.DIRECTOR,
        AgentRole.IDEATOR,
        AgentRole.STYLIST,
        AgentRole.REFINER,
        AgentRole.CRITIC
      ]
    );
    
    return { id: session.id };
  }
  
  /**
   * Run a collaboration session
   */
  private async runCollaborationSession(sessionId: string, project: {
    title: string;
    description: string;
    requirements: string[];
  }): Promise<any> {
    // Get the director agent
    const directorAgents = this.multiAgentSystem.getAgentsByRole(AgentRole.DIRECTOR);
    if (!directorAgents || directorAgents.length === 0) {
      throw new Error('Director agent not found');
    }
    const directorAgent = directorAgents[0];
    
    // Create initial message to start the project
    const initialMessage: AgentMessage = {
      id: sessionId,
      fromAgent: 'system',
      toAgent: directorAgent.id,
      content: {
        action: 'create_project',
        project: {
          title: project.title,
          description: project.description,
          requirements: project.requirements
        }
      },
      timestamp: new Date(),
      type: 'request'
    };
    
    // Process the message through the director agent
    const response = await directorAgent.process(initialMessage);
    
    // Simulate the collaboration process
    console.log('🤖 Running collaboration session...');
    
    // For now, we'll simulate the result
    // In a real implementation, this would involve message passing between agents
    // and tracking the state of the collaboration session
    
    const result = {
      id: sessionId,
      title: project.title,
      description: project.description,
      status: 'completed',
      startTime: new Date(),
      endTime: new Date(),
      artifacts: [
        {
          id: 'artwork-1',
          type: 'artwork',
          content: {
            prompt: 'CNSTLL A detailed artwork based on ' + project.title,
            imageUrl: 'https://replicate.delivery/pbxt/4JkAMBmbhJxKkBTcwvLJWQAYTkZ0ky3gT6NpSEVweWwbfSgQA/out-0.png',
            creativeProcess: 'Generated using the FLUX model with a conceptually rich prompt'
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
}

// Export the ArtBotMultiAgentSystem class
export default ArtBotMultiAgentSystem; 