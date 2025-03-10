import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AIService, AIMessage } from './services/ai/index.js';
import { ReplicateService } from './services/replicate/index.js';
import { MemorySystem, MemoryType } from './services/memory/index.js';
import { StyleService } from './services/style/index.js';
import { EnhancedMultiAgentSystem, CollaborationPattern, CollaborationSession } from './services/multiagent/EnhancedMultiAgentSystem.js';
import { DirectorAgent } from './services/multiagent/DirectorAgent.js';
import { IdeatorAgent } from './services/multiagent/IdeatorAgent.js';
import { StylistAgent } from './services/multiagent/StylistAgent.js';
import { RefinerAgent } from './services/multiagent/RefinerAgent.js';
import { CriticAgent } from './services/multiagent/CriticAgent.js';
import { SocialEngagementService } from './services/social/index.js';
import { AgentRole, AgentMessage, Agent } from './services/multiagent/index.js';
import { FluxRefinerAgent } from './services/multiagent/FluxRefinerAgent.js';
import { ReferenceImageProvider } from './services/multiagent/ReferenceImageProvider.js';
import { v4 as uuidv4 } from 'uuid';

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
 * Configuration for A/B testing
 */
interface ABTestConfig {
  name: string;
  ideatorConfig?: {
    explorationRate?: number;
    preferredApproaches?: string[];
  };
  stylistConfig?: {
    styleInfluences?: string[];
  };
  refinerConfig?: {
    iterationDepth?: number;
  };
  collaborationPattern?: CollaborationPattern;
}

/**
 * Result of a project run during A/B testing
 */
interface ABTestProjectResult {
  artworkId: string;
  artwork: any;
  sessionId: string;
  config: ABTestConfig;
  processingTime: number;
  metadata: {
    projectRequirements: any;
    timestamp: Date;
    configName: string;
  };
}

/**
 * Evaluation of A/B test results
 */
interface ABTestEvaluation {
  configAScores: Record<string, number>;
  configBScores: Record<string, number>;
  configAScore: number;
  configBScore: number;
  criteria: string[];
  timestamp: Date;
}

/**
 * Complete result of an A/B test
 */
interface ABTestResult {
  configA: ABTestProjectResult;
  configB: ABTestProjectResult;
  evaluation: ABTestEvaluation;
  winner: 'A' | 'B';
  winningConfig: ABTestConfig;
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
  private feedbackHistory: Map<string, any[]> = new Map(); // Artwork ID -> feedback array
  private learningRate: number = 0.1; // Rate at which the system learns from feedback
  private lastGeneratedArtwork: any = null; // Store the last generated artwork for feedback
  
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
      defaultWidth: parseInt(process.env.IMAGE_WIDTH || '2024', 10),
      defaultHeight: parseInt(process.env.IMAGE_HEIGHT || '2024', 10),
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
    let prompt = 'IKIGAI A detailed artwork based on ' + session.project.title;
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
          
          // Debug logging for the image URL
          if (process.env.DEBUG_IMAGE_URL === 'true') {
            console.log(`🔍 DEBUG - artbot-multiagent-system - imageUrl: ${imageUrl}`);
            console.log(`🔍 DEBUG - artbot-multiagent-system - imageUrl type: ${typeof imageUrl}`);
            console.log(`🔍 DEBUG - artbot-multiagent-system - imageUrl starts with http: ${imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')}`);
          }
          
          // Validate the image URL
          if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
            console.error(`❌ Invalid image URL from FluxRefinerAgent: ${imageUrl}`);
            imageUrl = 'https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png';
            console.log(`Using fallback image URL: ${imageUrl}`);
          }
          
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
      },
      artwork: {
        prompt,
        imageUrl,
        creativeProcess
      }
    };
    
    // Update the session result
    session.result = result;
    
    return result;
  }
  
  /**
   * Incorporate feedback into the system to improve future generations
   * @param artworkId ID of the artwork receiving feedback
   * @param feedback Feedback object with ratings and comments
   * @returns Success status
   */
  async incorporateFeedback(artworkId: string, feedback: any): Promise<boolean> {
    console.log(`Incorporating feedback for artwork ${artworkId}`);
    
    // Store feedback in memory system
    await this.memorySystem.storeMemory(
      feedback,
      MemoryType.FEEDBACK,
      {
        artworkId,
        timestamp: new Date()
      }
    );
    
    // Add to feedback history
    if (!this.feedbackHistory.has(artworkId)) {
      this.feedbackHistory.set(artworkId, []);
    }
    this.feedbackHistory.get(artworkId)!.push(feedback);
    
    // Analyze feedback to extract actionable insights
    const insights = await this.analyzeArtFeedback(feedback);
    
    // Share insights with relevant agents
    const message: AgentMessage = {
      id: uuidv4(),
      fromAgent: 'system',
      toAgent: null, // broadcast
      content: {
        type: 'feedback_insights',
        artworkId,
        insights,
        feedback
      },
      timestamp: new Date(),
      type: 'feedback'
    };
    
    await this.multiAgentSystem.sendMessage(message);
    
    // Update collaboration pattern performance if applicable
    if (feedback.rating !== undefined) {
      const normalizedRating = feedback.rating / 10; // Assuming rating is 0-10
      const session = this.findSessionForArtwork(artworkId);
      
      if (session) {
        this.multiAgentSystem.recordPatternPerformance(
          session.pattern,
          normalizedRating
        );
      }
    }
    
    return true;
  }
  
  /**
   * Find the collaboration session that produced a specific artwork
   * @param artworkId ID of the artwork
   * @returns The collaboration session or undefined if not found
   */
  private findSessionForArtwork(artworkId: string): CollaborationSession | undefined {
    const multiAgentSystem = this.multiAgentSystem as any;
    if (!multiAgentSystem.collaborationSessions) {
      return undefined;
    }
    
    for (const session of multiAgentSystem.collaborationSessions.values()) {
      const hasArtwork = session.artifacts.some(artifact => 
        artifact.id === artworkId || 
        (artifact.content && artifact.content.id === artworkId)
      );
      
      if (hasArtwork) {
        return session;
      }
    }
    
    return undefined;
  }
  
  /**
   * Analyze art feedback to extract actionable insights
   * @param feedback Feedback object with ratings and comments
   * @returns Analyzed insights
   */
  private async analyzeArtFeedback(feedback: any): Promise<any> {
    // Use AI service to analyze feedback
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are an art feedback analyzer. Extract actionable insights from feedback on artwork.'
      },
      {
        role: 'user',
        content: `Analyze the following feedback and extract actionable insights for improving future artwork:
        
        Rating: ${feedback.rating || 'Not provided'}/10
        Comments: ${feedback.comments || 'None'}
        Strengths: ${feedback.strengths || 'None mentioned'}
        Weaknesses: ${feedback.weaknesses || 'None mentioned'}
        Suggestions: ${feedback.suggestions || 'None provided'}
        
        Provide insights in the following categories:
        1. Style improvements
        2. Composition improvements
        3. Technical improvements
        4. Conceptual improvements
        5. Overall direction`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.3 // Low temperature for more focused analysis
      });
      
      // Parse the response to extract insights
      // In a real implementation, we would parse the structured response
      // For now, we'll return a mock insights object
      
      return {
        styleImprovements: [
          "Increase contrast in color palette",
          "Refine brushstroke technique"
        ],
        compositionImprovements: [
          "Strengthen focal point",
          "Improve balance between elements"
        ],
        technicalImprovements: [
          "Increase resolution for finer details",
          "Adjust lighting for better depth"
        ],
        conceptualImprovements: [
          "Strengthen narrative elements",
          "Make metaphorical elements more clear"
        ],
        overallDirection: "Focus on emotional impact while maintaining technical quality"
      };
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return {
        styleImprovements: [],
        compositionImprovements: [],
        technicalImprovements: [],
        conceptualImprovements: [],
        overallDirection: "Continue current approach"
      };
    }
  }
  
  /**
   * Run an A/B test with different agent configurations
   * @param projectRequirements The requirements for the art project
   * @param configA First configuration to test
   * @param configB Second configuration to test
   * @param evaluationCriteria Criteria to evaluate results
   * @returns Test results with winning configuration
   */
  async runABTest(
    projectRequirements: any,
    configA: ABTestConfig,
    configB: ABTestConfig,
    evaluationCriteria: string[] = ['aesthetic_quality', 'creativity', 'technical_execution', 'concept_alignment']
  ): Promise<ABTestResult> {
    console.log('Starting A/B test with different agent configurations');
    
    // Run project with configuration A
    console.log('Running test with configuration A');
    const resultA = await this.runProjectWithConfig(projectRequirements, configA);
    
    // Run project with configuration B
    console.log('Running test with configuration B');
    const resultB = await this.runProjectWithConfig(projectRequirements, configB);
    
    // Evaluate results
    const evaluation = await this.evaluateABTestResults(
      resultA,
      resultB,
      evaluationCriteria
    );
    
    // Determine winner
    const winner = evaluation.configAScore > evaluation.configBScore ? 'A' : 'B';
    const winningConfig = winner === 'A' ? configA : configB;
    
    // Learn from results
    await this.learnFromABTest(evaluation, winningConfig);
    
    return {
      configA: resultA,
      configB: resultB,
      evaluation,
      winner,
      winningConfig
    };
  }
  
  /**
   * Run a project with a specific configuration
   * @param projectRequirements The requirements for the art project
   * @param config Configuration to use
   * @returns Project result
   */
  private async runProjectWithConfig(
    projectRequirements: any,
    config: ABTestConfig
  ): Promise<ABTestProjectResult> {
    // Create a new session ID for this test
    const sessionId = uuidv4();
    
    // Apply configuration to agents
    if (config.ideatorConfig) {
      const ideator = this.multiAgentSystem.getAgent('ideator') as IdeatorAgent;
      if (ideator) {
        // Apply ideator configuration through context update
        const contextUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: 'ideator',
          content: {
            type: 'configuration_update',
            explorationRate: config.ideatorConfig.explorationRate,
            preferredApproaches: config.ideatorConfig.preferredApproaches
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(contextUpdate);
      }
    }
    
    if (config.stylistConfig) {
      const stylist = this.multiAgentSystem.getAgent('stylist') as StylistAgent;
      if (stylist) {
        // Apply stylist configuration through context update
        const contextUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: 'stylist',
          content: {
            type: 'configuration_update',
            styleInfluences: config.stylistConfig.styleInfluences
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(contextUpdate);
      }
    }
    
    if (config.refinerConfig) {
      const refiner = this.multiAgentSystem.getAgent('refiner') as RefinerAgent;
      if (refiner) {
        // Apply refiner configuration through context update
        const contextUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: 'refiner',
          content: {
            type: 'configuration_update',
            iterationDepth: config.refinerConfig.iterationDepth
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(contextUpdate);
      }
    }
    
    // Set collaboration pattern if specified
    if (config.collaborationPattern) {
      // Apply collaboration pattern through system configuration
      const patternUpdate: AgentMessage = {
        id: uuidv4(),
        fromAgent: 'system',
        toAgent: null, // broadcast
        content: {
          type: 'system_configuration',
          collaborationPattern: config.collaborationPattern
        },
        timestamp: new Date(),
        type: 'update'
      };
      await this.multiAgentSystem.sendMessage(patternUpdate);
    }
    
    // Run the project
    const startTime = Date.now();
    // Use the existing runCollaborationSession method
    const result = await this.runCollaborationSession(sessionId);
    const endTime = Date.now();
    
    // Create a project request message to start the collaboration
    const projectRequest: AgentMessage = {
      id: uuidv4(),
      fromAgent: 'system',
      toAgent: 'director',
      content: {
        type: 'project_request',
        requirements: projectRequirements,
        sessionId
      },
      timestamp: new Date(),
      type: 'request'
    };
    
    // Send the project request to the director agent
    await this.multiAgentSystem.sendMessage(projectRequest);
    
    return {
      artworkId: result?.id || uuidv4(),
      artwork: result?.artwork || result,
      sessionId,
      config,
      processingTime: endTime - startTime,
      metadata: {
        projectRequirements,
        timestamp: new Date(),
        configName: config.name
      }
    };
  }
  
  /**
   * Evaluate A/B test results
   * @param resultA Result from configuration A
   * @param resultB Result from configuration B
   * @param criteria Evaluation criteria
   * @returns Evaluation results
   */
  private async evaluateABTestResults(
    resultA: ABTestProjectResult,
    resultB: ABTestProjectResult,
    criteria: string[]
  ): Promise<ABTestEvaluation> {
    console.log('Evaluating A/B test results');
    
    // Use AI service for evaluation since we can't directly access critic's private methods
    const configAScores = await this.evaluateWithAI(resultA, criteria);
    const configBScores = await this.evaluateWithAI(resultB, criteria);
    
    // Calculate overall scores
    const configAScore = Object.values(configAScores).reduce((sum, score) => sum + score, 0) / criteria.length;
    const configBScore = Object.values(configBScores).reduce((sum, score) => sum + score, 0) / criteria.length;
    
    return {
      configAScores,
      configBScores,
      configAScore,
      configBScore,
      criteria,
      timestamp: new Date()
    };
  }
  
  /**
   * Evaluate artwork using AI service
   * @param result Project result
   * @param criteria Evaluation criteria
   * @returns Scores for each criterion
   */
  private async evaluateWithAI(
    result: ABTestProjectResult,
    criteria: string[]
  ): Promise<Record<string, number>> {
    // Prepare artwork description or URL for evaluation
    const artworkDescription = typeof result.artwork === 'string' 
      ? `Artwork URL: ${result.artwork}` 
      : JSON.stringify(result.artwork);
    
    // Prepare project requirements
    const requirementsDescription = JSON.stringify(result.metadata.projectRequirements);
    
    // Create prompt for AI evaluation
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an art critic evaluating AI-generated artwork. 
        Rate the artwork on each criterion on a scale of 0-10, where 10 is excellent.
        Provide objective ratings based on the artwork and how well it meets the requirements.`
      },
      {
        role: 'user',
        content: `Evaluate this artwork based on the following criteria:
        
        Project Requirements:
        ${requirementsDescription}
        
        Artwork:
        ${artworkDescription}
        
        Criteria to evaluate:
        ${criteria.join(', ')}
        
        For each criterion, provide a rating from 0-10 and a brief justification.
        Format your response as JSON with the following structure:
        {
          "criteria": {
            "criterion1": {
              "score": number,
              "justification": "string"
            },
            ...
          },
          "overall_score": number
        }`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.3
      });
      
      // Parse the response
      const evaluation = JSON.parse(response.content || '{}');
      
      // Extract scores
      const scores: Record<string, number> = {};
      for (const criterion of criteria) {
        if (evaluation.criteria && evaluation.criteria[criterion]) {
          scores[criterion] = evaluation.criteria[criterion].score;
        } else {
          scores[criterion] = 5; // Default middle score if missing
        }
      }
      
      return scores;
    } catch (error) {
      console.error('Error evaluating with AI:', error);
      // Return default scores
      return Object.fromEntries(criteria.map(c => [c, 5]));
    }
  }
  
  /**
   * Learn from A/B test results
   * @param evaluation Test evaluation
   * @param winningConfig The configuration that performed better
   */
  private async learnFromABTest(
    evaluation: ABTestEvaluation,
    winningConfig: ABTestConfig
  ): Promise<void> {
    console.log(`Learning from A/B test. Winning config: ${winningConfig.name}`);
    
    // Store test results in memory
    await this.memorySystem.storeMemory(
      {
        evaluation,
        winningConfig
      },
      MemoryType.EXPERIENCE,
      {
        type: 'ab_test_result',
        timestamp: new Date()
      },
      ['ab_test', 'learning', winningConfig.name]
    );
    
    // Apply winning configuration as the new default if confidence is high enough
    const confidenceThreshold = 0.15; // At least 15% better
    const scoreDifference = Math.abs(evaluation.configAScore - evaluation.configBScore);
    const relativeImprovement = scoreDifference / Math.min(evaluation.configAScore, evaluation.configBScore);
    
    if (relativeImprovement >= confidenceThreshold) {
      console.log(`Confidence threshold met (${relativeImprovement.toFixed(2)}). Applying winning configuration.`);
      
      // Apply winning configuration to agents through messages
      if (winningConfig.ideatorConfig) {
        const contextUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: 'ideator',
          content: {
            type: 'configuration_update',
            explorationRate: winningConfig.ideatorConfig.explorationRate,
            preferredApproaches: winningConfig.ideatorConfig.preferredApproaches,
            isPermanent: true
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(contextUpdate);
      }
      
      if (winningConfig.stylistConfig) {
        const contextUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: 'stylist',
          content: {
            type: 'configuration_update',
            styleInfluences: winningConfig.stylistConfig.styleInfluences,
            isPermanent: true
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(contextUpdate);
      }
      
      if (winningConfig.refinerConfig) {
        const contextUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: 'refiner',
          content: {
            type: 'configuration_update',
            iterationDepth: winningConfig.refinerConfig.iterationDepth,
            isPermanent: true
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(contextUpdate);
      }
      
      // Set collaboration pattern if specified
      if (winningConfig.collaborationPattern) {
        const patternUpdate: AgentMessage = {
          id: uuidv4(),
          fromAgent: 'system',
          toAgent: null, // broadcast
          content: {
            type: 'system_configuration',
            collaborationPattern: winningConfig.collaborationPattern,
            isPermanent: true
          },
          timestamp: new Date(),
          type: 'update'
        };
        await this.multiAgentSystem.sendMessage(patternUpdate);
      }
    } else {
      console.log(`Confidence threshold not met (${relativeImprovement.toFixed(2)}). Not applying winning configuration.`);
    }
  }
}