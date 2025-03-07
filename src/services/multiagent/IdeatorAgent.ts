import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';

/**
 * Ideation approach types for specialized idea generation
 */
export enum IdeationApproach {
  METAPHYSICAL = 'metaphysical',   // Focus on philosophical paradoxes and metaphysical concepts
  SURREAL = 'surreal',            // Focus on surreal juxtapositions and impossible scenarios
  SYMBOLIC = 'symbolic',          // Focus on symbolic objects and their relationships
  ATMOSPHERIC = 'atmospheric',     // Focus on mood and mysterious atmospheres
  COMPOSITIONAL = 'compositional', // Focus on spatial arrangements and framing
  NARRATIVE = 'narrative',        // Focus on implied stories and philosophical questions
  THEATRICAL = 'theatrical',      // Focus on dramatic staging and lighting
  HOPPER = 'hopper',              // Focus on urban solitude and psychological realism
  ARBUS = 'arbus',
  AVEDON = 'avedon',
  EGGLESTON = 'eggleston',
  LEIBOVITZ = 'leibovitz',
  CARTIERBRESSON = 'cartierbresson',
  COOPERGORFER = 'coopergorfer',
  VONWONG = 'vonwong',
  BOURDIN = 'bourdin'
}

// Ideator agent is responsible for generating creative ideas
export class IdeatorAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.IDEATOR, aiService);
    this.state.context = {
      currentTask: null,
      generatedIdeas: [],
      ideationParameters: {
        explorationRate: 0.7,
        diversityWeight: 0.8,
        noveltyThreshold: 0.6
      },
      preferredApproaches: [
        IdeationApproach.METAPHYSICAL,
        IdeationApproach.SURREAL,
        IdeationApproach.SYMBOLIC
      ],
      approachWeights: {
        [IdeationApproach.METAPHYSICAL]: 0.9,
        [IdeationApproach.SURREAL]: 0.8,
        [IdeationApproach.SYMBOLIC]: 0.8,
        [IdeationApproach.ATMOSPHERIC]: 0.7,
        [IdeationApproach.COMPOSITIONAL]: 0.7,
        [IdeationApproach.NARRATIVE]: 0.6,
        [IdeationApproach.THEATRICAL]: 0.6,
        [IdeationApproach.HOPPER]: 0.8,
        [IdeationApproach.ARBUS]: 0.8,
        [IdeationApproach.AVEDON]: 0.8,
        [IdeationApproach.EGGLESTON]: 0.8,
        [IdeationApproach.LEIBOVITZ]: 0.8,
        [IdeationApproach.CARTIERBRESSON]: 0.8,
        [IdeationApproach.COOPERGORFER]: 0.8,
        [IdeationApproach.VONWONG]: 0.8,
        [IdeationApproach.BOURDIN]: 0.8
      },
      magritteKeywords: [
        // Core Symbols and Objects
        'bowler hat', 'green apple', 'pipe', 'dove', 'clouds', 'sky',
        'curtain', 'window', 'mirror', 'door', 'key', 'bell',
        'stone', 'castle', 'bird', 'tree', 'rose', 'candle',
        
        // Philosophical Concepts
        'surreal', 'paradox', 'mystery', 'metaphysical', 'philosophical',
        'reality questioning', 'perception', 'representation', 'truth',
        'existence', 'identity', 'time', 'space', 'meaning',
        
        // Visual Elements
        'day-night', 'empire of light', 'floating objects', 'impossible scale',
        'transparent', 'metamorphosis', 'hybrid forms', 'silhouette',
        'reflection', 'shadow', 'void', 'infinity', 'displacement',
        
        // Settings and Environments
        'belgian landscape', 'empty streets', 'interior-exterior',
        'wallpapered rooms', 'seaside', 'classical architecture',
        'blue sky', 'night scene', 'domestic space', 'infinite space',
        
        // Techniques and Approaches
        'precise rendering', 'realistic detail', 'clean edges',
        'seamless transitions', 'trompe l\'oeil', 'atmospheric perspective',
        'philosophical juxtaposition', 'symbolic resonance', 'visual poetry',
        
        // Themes and Concepts
        'human condition', 'language', 'everyday uncanny', 'familiar strange',
        'hidden connections', 'visual paradox', 'metaphysical truth',
        'reality questioning', 'object relationships', 'symbolic meaning'
      ],
      artisticApproaches: {
        magritte: {
          composition: [
            'balanced arrangement',
            'precise placement',
            'theatrical staging',
            'impossible juxtapositions',
            'metaphysical space',
            'symbolic framing',
            'window motifs',
            'mirror compositions',
            'infinite perspectives',
            'surreal scale relationships'
          ],
          lighting: [
            'natural illumination',
            'mysterious atmosphere',
            'empire of light contrasts',
            'subtle shadows',
            'metaphysical glow',
            'twilight ambiguity',
            'ethereal luminosity',
            'philosophical darkness',
            'symbolic light',
            'paradoxical lighting'
          ],
          color: [
            'belgian sky blue',
            'realistic tones',
            'symbolic color',
            'atmospheric hues',
            'contemplative palette',
            'metaphysical colors',
            'surreal combinations',
            'philosophical greys',
            'mysterious greens',
            'paradoxical contrasts'
          ],
          narrative: [
            'philosophical puzzles',
            'visual paradoxes',
            'poetic connections',
            'metaphysical questions',
            'reality investigations',
            'symbolic stories',
            'object dialogues',
            'spatial narratives',
            'time paradoxes',
            'identity explorations'
          ],
          techniques: [
            'precise rendering',
            'seamless blending',
            'realistic detail',
            'conceptual fusion',
            'trompe l\'oeil',
            'symbolic placement',
            'metaphysical staging',
            'paradoxical framing',
            'philosophical composition',
            'surreal juxtaposition'
          ]
        },
        hopper: {
          composition: [
            "geometric simplification",
            "dramatic perspective",
            "architectural framing",
            "urban isolation",
            "precise observation",
            "psychological space",
            "window views",
            "diagonal compositions",
            "stark contrasts",
            "architectural geometry"
          ],
          lighting: [
            "dramatic sunlight",
            "stark shadows",
            "morning light",
            "afternoon glow",
            "window illumination",
            "artificial lighting",
            "natural contrast",
            "atmospheric shadows",
            "directional light",
            "psychological lighting"
          ],
          color: [
            "muted tones",
            "warm sunlight",
            "cool shadows",
            "urban palette",
            "architectural colors",
            "natural light hues",
            "psychological tones",
            "atmospheric colors",
            "realistic palette",
            "emotional color"
          ],
          narrative: [
            "urban solitude",
            "modern isolation",
            "psychological tension",
            "quiet moments",
            "contemplative scenes",
            "architectural stories",
            "human condition",
            "city narratives",
            "emotional distance",
            "modern alienation"
          ],
          techniques: [
            "precise observation",
            "geometric reduction",
            "architectural detail",
            "dramatic cropping",
            "psychological staging",
            "light manipulation",
            "spatial tension",
            "urban realism",
            "emotional distance",
            "contemplative framing"
          ]
        }
      }
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Ideator-specific initialization
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    // Add message to memory
    this.addToMemory(message);
    
    // Update state based on message
    this.state.status = 'working';
    
    try {
      switch (message.type) {
        case 'request':
          return await this.handleRequest(message);
        case 'response':
          return await this.handleResponse(message);
        case 'update':
          return await this.handleUpdate(message);
        case 'feedback':
          return await this.handleFeedback(message);
        default:
          return null;
      }
    } finally {
      this.state.status = 'idle';
    }
  }
  
  private async handleRequest(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    
    // Handle task assignment
    if (content.action === 'assign_task' && content.targetRole === AgentRole.IDEATOR) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Determine the best ideation approach based on the project
      const approach = this.determineIdeationApproach(content.project);
      
      // Generate ideas based on the task and selected approach
      const ideas = await this.generateIdeasWithApproach(task, content.project, approach);
      
      // Store generated ideas
      this.state.context.generatedIdeas = ideas;
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: ideas,
          approach: approach
        },
        'response'
      );
    }
    
    return null;
  }
  
  private async handleResponse(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle responses to our requests
    return null;
  }
  
  private async handleUpdate(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle updates from other agents
    return null;
  }
  
  private async handleFeedback(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle feedback on our ideas
    const { content } = message;
    
    if (content.action === 'provide_feedback' && content.targetRole === AgentRole.IDEATOR) {
      // Update approach weights based on feedback
      if (content.approach && content.rating) {
        const approach = content.approach as IdeationApproach;
        const rating = content.rating as number; // 1-10
        
        // Adjust the weight for this approach based on feedback
        const currentWeight = this.state.context.approachWeights[approach] || 0.5;
        const learningRate = 0.1;
        const normalizedRating = rating / 10; // Convert to 0-1 scale
        
        // Update weight using a simple learning rule
        this.state.context.approachWeights[approach] = 
          currentWeight * (1 - learningRate) + normalizedRating * learningRate;
        
        // Update preferred approaches based on new weights
        this.updatePreferredApproaches();
        
        return this.createMessage(
          message.fromAgent,
          {
            action: 'feedback_acknowledged',
            approach: approach,
            newWeight: this.state.context.approachWeights[approach]
          },
          'response'
        );
      }
    }
    
    return null;
  }
  
  /**
   * Update the list of preferred approaches based on current weights
   */
  private updatePreferredApproaches(): void {
    // Sort approaches by weight and take the top 3
    const sortedApproaches = Object.entries(this.state.context.approachWeights)
      .sort(([, weightA], [, weightB]) => (weightB as number) - (weightA as number))
      .map(([approach]) => approach as IdeationApproach);
    
    this.state.context.preferredApproaches = sortedApproaches.slice(0, 3);
  }
  
  /**
   * Determine the best ideation approach for a given project
   */
  private determineIdeationApproach(project: any): IdeationApproach {
    // Simple keyword-based approach determination
    const keywords = {
      [IdeationApproach.METAPHYSICAL]: ['metaphysical', 'philosophical', 'paradox', 'truth', 'reality'],
      [IdeationApproach.SURREAL]: ['surreal', 'impossible', 'juxtaposition', 'strange', 'metamorphosis'],
      [IdeationApproach.SYMBOLIC]: ['symbol', 'meaning', 'object', 'representation', 'significance'],
      [IdeationApproach.ATMOSPHERIC]: ['atmosphere', 'mood', 'mystery', 'ethereal', 'enigmatic'],
      [IdeationApproach.COMPOSITIONAL]: ['composition', 'arrangement', 'space', 'framing', 'balance'],
      [IdeationApproach.NARRATIVE]: ['story', 'question', 'dialogue', 'connection', 'relationship'],
      [IdeationApproach.THEATRICAL]: ['staging', 'dramatic', 'scene', 'presentation', 'lighting']
    };
    
    // Combine project title and description for analysis
    const projectText = `${project.title} ${project.description} ${project.requirements.join(' ')}`.toLowerCase();
    
    // Score each approach based on keyword matches and weights
    const scores = Object.entries(keywords).map(([approach, words]) => {
      const matchCount = words.filter(word => projectText.includes(word)).length;
      const weight = this.state.context.approachWeights[approach as IdeationApproach] || 0.5;
      return { approach: approach as IdeationApproach, score: matchCount * weight };
    });
    
    // Return the approach with the highest score
    const bestApproach = scores.sort((a, b) => b.score - a.score)[0].approach;
    return bestApproach;
  }
  
  /**
   * Generate ideas using a specific ideation approach
   */
  private async generateIdeasWithApproach(
    task: any, 
    project: any, 
    approach: IdeationApproach
  ): Promise<any[]> {
    // Select the appropriate specialized method based on the approach
    switch (approach) {
      case IdeationApproach.METAPHYSICAL:
        return this.generateMetaphysicalIdeas(task, project);
      case IdeationApproach.SURREAL:
        return this.generateSurrealIdeas(task, project);
      case IdeationApproach.SYMBOLIC:
        return this.generateSymbolicIdeas(task, project);
      case IdeationApproach.ATMOSPHERIC:
        return this.generateAtmosphericIdeas(task, project);
      case IdeationApproach.COMPOSITIONAL:
        return this.generateCompositionalIdeas(task, project);
      case IdeationApproach.NARRATIVE:
        return this.generateNarrativeIdeas(task, project);
      case IdeationApproach.THEATRICAL:
        return this.generateTheatricalIdeas(task, project);
      case IdeationApproach.HOPPER:
        return this.generateHopperIdeas(task, project);
      case IdeationApproach.ARBUS:
        return this.generateArbusIdeas(task, project);
      case IdeationApproach.AVEDON:
        return this.generateAvedonIdeas(task, project);
      case IdeationApproach.EGGLESTON:
        return this.generateEgglestonIdeas(task, project);
      case IdeationApproach.LEIBOVITZ:
        return this.generateLeibovitzIdeas(task, project);
      case IdeationApproach.CARTIERBRESSON:
        return this.generateCartierBressonIdeas(task, project);
      case IdeationApproach.COOPERGORFER:
        return this.generateCooperGorferIdeas(task, project);
      case IdeationApproach.VONWONG:
        return this.generateVonWongIdeas(task, project);
      case IdeationApproach.BOURDIN:
        return this.generateBourdinIdeas(task, project);
      default:
        // Fallback to general idea generation
        return this.generateIdeas(task, project);
    }
  }
  
  /**
   * Generate metaphysical ideas focused on philosophical paradoxes and metaphysical concepts
   */
  private async generateMetaphysicalIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in METAPHYSICAL ideation in Magritte's tradition. Focus on philosophical paradoxes, reality questioning, and metaphysical concepts. Generate ideas that challenge perception and provoke philosophical thought.`
      },
      {
        role: 'user',
        content: `Generate 5 metaphysically-driven art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that encapsulates the metaphysical concept
        2. A philosophical paradox or question
        3. Key symbolic elements
        4. Visual representation
        5. Philosophical impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      // Mock metaphysical ideas
      return [
        {
          title: "The Persistence of Paradox",
          description: "A visual exploration of self-referential reality",
          elements: ["mirror reflecting its own absence", "window showing what it conceals", "pipe that denies itself"],
          styles: ["metaphysical surrealism", "philosophical paradox", "symbolic resonance"],
          impact: "questioning the nature of representation and reality",
          visualRepresentation: "A series of nested frames containing contradictory realities"
        },
        {
          title: "Time's Reflection",
          description: "An investigation of temporal paradoxes through everyday objects",
          elements: ["clock melting into sky", "calendar pages forming clouds", "hourglass containing infinity"],
          styles: ["temporal surrealism", "metaphysical time", "object poetry"],
          impact: "contemplation of time's fluid nature",
          visualRepresentation: "Objects that simultaneously exist in multiple temporal states"
        }
      ];
    } catch (error) {
      console.error('Error generating metaphysical ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate surreal ideas focused on impossible juxtapositions and dream-like scenarios
   */
  private async generateSurrealIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in SURREAL ideation in Magritte's style. Focus on impossible juxtapositions, dream-like scenarios, and reality-bending concepts. Generate ideas that challenge perception through surreal imagery.`
      },
      {
        role: 'user',
        content: `Generate 5 surreal art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that captures the surreal concept
        2. A description of the impossible scenario
        3. Key surreal elements
        4. Visual composition
        5. Perceptual impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Mock surreal ideas
      return [
        {
          title: "The Room of Infinite Windows",
          description: "A space where each window opens onto itself",
          elements: ["recursive windows", "impossible perspectives", "self-referential views"],
          styles: ["architectural surrealism", "spatial paradox", "infinite regression"],
          impact: "disorientation of spatial perception",
          visualComposition: "Nested frames creating an endless visual loop"
        },
        {
          title: "Objects in Revolt",
          description: "Everyday items questioning their own existence",
          elements: ["floating bowler hats", "self-painting pipes", "doors opening to doors"],
          styles: ["object surrealism", "metaphysical humor", "symbolic rebellion"],
          impact: "challenging object-identity relationships",
          visualComposition: "Organized chaos of self-aware objects"
        }
      ];
    } catch (error) {
      console.error('Error generating surreal ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate symbolic ideas focused on symbolic objects and their relationships
   */
  private async generateSymbolicIdeas(task: any, project: any): Promise<any[]> {
    // Implementation for symbolic ideas
    // Mock symbolic ideas for now
    return [
      {
        title: "The Symbolic Tree",
        description: "A tree representing the interconnectedness of life",
        elements: ["roots", "branches", "leaves"],
        styles: ["symbolic", "natural", "organic"],
        impact: "symbolizing the cycle of life and growth"
      },
      {
        title: "The Mirror's Reflection",
        description: "A mirror reflecting the duality of self and other",
        elements: ["mirror", "reflection", "duality"],
        styles: ["symbolic", "metaphysical", "philosophical"],
        impact: "symbolizing the concept of reflection and identity"
      }
    ];
  }
  
  /**
   * Generate atmospheric ideas focused on mood and mysterious atmospheres
   */
  private async generateAtmosphericIdeas(task: any, project: any): Promise<any[]> {
    // Implementation for atmospheric ideas
    // Mock atmospheric ideas for now
    return [
      {
        title: "The Mystical Sky",
        description: "A sky filled with mysterious and enigmatic elements",
        elements: ["clouds", "sky", "atmosphere"],
        styles: ["atmospheric", "mystical", "enigmatic"],
        impact: "symbolizing the vastness and mystery of the universe"
      },
      {
        title: "The Whispering Wind",
        description: "A wind that whispers secrets through the trees",
        elements: ["wind", "trees", "whispering"],
        styles: ["atmospheric", "natural", "mysterious"],
        impact: "symbolizing the connection between the natural world and human emotions"
      }
    ];
  }
  
  /**
   * Generate compositional ideas focused on spatial arrangements and framing
   */
  private async generateCompositionalIdeas(task: any, project: any): Promise<any[]> {
    // Implementation for compositional ideas
    // Mock compositional ideas for now
    return [
      {
        title: "The Compositional Balance",
        description: "A composition balancing elements in a harmonious way",
        elements: ["geometric shapes", "color gradients", "balanced arrangement"],
        styles: ["compositional", "geometric", "color field"],
        impact: "symbolizing the concept of balance and harmony"
      },
      {
        title: "The Framing of Reality",
        description: "A framing that reveals the underlying structure of reality",
        elements: ["frame", "reality", "structure"],
        styles: ["compositional", "metaphysical", "philosophical"],
        impact: "symbolizing the concept of structure and order"
      }
    ];
  }
  
  /**
   * Generate narrative ideas focused on implied stories and philosophical questions
   */
  private async generateNarrativeIdeas(task: any, project: any): Promise<any[]> {
    // Check if the project is related to Magritte's style
    const isMagritteRelated = this.isMagritteRelated(project);
    
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in NARRATIVE ideation. Focus on storytelling, character development, plot, and narrative structure. Generate ideas that tell compelling stories or suggest narrative moments.
        
        ${isMagritteRelated ? `
        IMPORTANT: This project relates to Magritte's style. Incorporate these narrative elements:
        - Philosophical puzzles and visual paradoxes
        - Symbolic stories and object dialogues
        - Reality investigations and philosophical questions
        - Metaphysical truths and symbolic meanings
        - Theatrical staging that suggests a larger story
        ` : ''}`
      },
      {
        role: 'user',
        content: `Generate 5 narrative-driven art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that suggests a story
        2. A narrative synopsis
        3. Key characters or elements
        4. Narrative arc or sequence
        5. Emotional journey
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Mock narrative ideas
      return [
        {
          title: "The Metaphorical Mirror",
          description: "A story about the duality of self and reflection",
          elements: ["mirror", "reflection", "duality"],
          styles: ["narrative", "philosophical", "symbolic"],
          emotionalImpact: "empathy and introspection",
          narrativeSynopsis: "A story about the duality of self and reflection",
          characters: ["the protagonist", "the mirror", "the underlying reality"],
          narrativeArc: "Introduction of mirror → Reflecting self → Reflecting underlying reality → Resolution"
        },
        {
          title: "The Philosophical Paradox",
          description: "A story about the paradox of existence and perception",
          elements: ["paradox", "existence", "perception"],
          styles: ["narrative", "philosophical", "metaphysical"],
          emotionalImpact: "curiosity and contemplation",
          narrativeSynopsis: "A story about the paradox of existence and perception",
          characters: ["the protagonist", "the philosophical question", "the underlying reality"],
          narrativeArc: "Introduction of paradox → Exploring existence → Exploring perception → Resolution"
        },
        // Additional mock ideas would be included here
      ];
    } catch (error) {
      console.error('Error generating narrative ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate theatrical ideas focused on dramatic staging and lighting
   */
  private async generateTheatricalIdeas(task: any, project: any): Promise<any[]> {
    // Check if the project is related to Magritte's style
    const isMagritteRelated = this.isMagritteRelated(project);
    
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in THEATRICAL ideation. Focus on theatrical staging and lighting. Generate ideas that suggest a larger story through dramatic scenes and lighting.
        
        ${isMagritteRelated ? `
        IMPORTANT: This project relates to Magritte's style. Incorporate these theatrical elements:
        - Theatrical staging that suggests a larger story
        - Mysterious and enigmatic atmospheres
        - Symbolic and philosophical representations
        - Theatrical lighting that enhances the emotional impact
        ` : ''}`
      },
      {
        role: 'user',
        content: `Generate 5 theatrically-driven art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that suggests a theatrical scene
        2. A description of the theatrical setting
        3. Key theatrical elements
        4. Potential styles
        5. Emotional impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Mock theatrical ideas
      return [
        {
          title: "The Theatrical Mirror",
          description: "A scene where the mirror reveals the theatrical nature of reality",
          theatricalElements: ["mirror", "theatrical", "reality"],
          styles: ["theatrical", "metaphysical", "philosophical"],
          emotionalImpact: "intrigue and contemplation",
          theatricalScene: "A scene where the mirror reveals the theatrical nature of reality",
          setting: "A dimly lit room with a large mirror"
        },
        {
          title: "The Theatrical Paradox",
          description: "A scene about the paradox of theatrical representation",
          theatricalElements: ["theatrical", "paradox", "representation"],
          styles: ["theatrical", "metaphysical", "philosophical"],
          emotionalImpact: "curiosity and contemplation",
          theatricalScene: "A scene about the paradox of theatrical representation",
          setting: "A dimly lit room with a large mirror"
        }
        // Additional mock ideas would be included here
      ];
    } catch (error) {
      console.error('Error generating theatrical ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Original general idea generation method
   */
  private async generateIdeas(task: any, project: any): Promise<any[]> {
    // Check if the project is related to Magritte's style
    const isMagritteRelated = this.isMagritteRelated(project);
    
    // Use AI service to generate creative ideas
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent in a multi-agent art creation system. Your role is to generate creative, diverse, and novel ideas based on project requirements. 
        Exploration rate: ${this.state.context.ideationParameters.explorationRate}
        Diversity weight: ${this.state.context.ideationParameters.diversityWeight}
        Novelty threshold: ${this.state.context.ideationParameters.noveltyThreshold}
        
        ${isMagritteRelated ? `
        IMPORTANT: This project relates to Magritte's style. Your ideas should incorporate elements of:
        - Philosophical puzzles and visual paradoxes
        - Symbolic stories and object dialogues
        - Reality investigations and philosophical questions
        - Metaphysical truths and symbolic meanings
        - Theatrical staging that suggests a larger story
        ` : ''}`
      },
      {
        role: 'user',
        content: `Generate 5 creative art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title
        2. A brief description
        3. Key visual elements
        4. Potential styles
        5. Emotional impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Parse the response to extract ideas
      // In a real implementation, we would parse the JSON response
      // For now, we'll return mock ideas
      
      return [
        {
          title: "The Metaphorical Mirror",
          description: "A mirror reflecting the metaphorical nature of reality",
          elements: ["mirror", "metaphor", "reality"],
          styles: ["metaphorical", "philosophical", "symbolic"],
          emotionalImpact: "empathy and introspection"
        },
        {
          title: "The Philosophical Paradox",
          description: "A paradox about the nature of existence and perception",
          elements: ["paradox", "existence", "perception"],
          styles: ["philosophical", "metaphysical", "paradoxical"],
          emotionalImpact: "curiosity and contemplation"
        },
        {
          title: "The Theatrical Paradox",
          description: "A scene about the paradox of theatrical representation",
          elements: ["theatrical", "paradox", "representation"],
          styles: ["theatrical", "metaphysical", "paradoxical"],
          emotionalImpact: "curiosity and contemplation"
        },
        {
          title: "The Theatrical Mirror",
          description: "A scene where the mirror reveals the theatrical nature of reality",
          elements: ["mirror", "theatrical", "reality"],
          styles: ["theatrical", "metaphysical", "philosophical"],
          emotionalImpact: "intrigue and contemplation"
        },
        {
          title: "The Metaphorical Paradox",
          description: "A paradox about the nature of metaphor and reality",
          elements: ["metaphor", "paradox", "reality"],
          styles: ["metaphorical", "philosophical", "paradoxical"],
          emotionalImpact: "curiosity and contemplation"
        }
      ];
    } catch (error) {
      console.error('Error generating ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Determine if a project is related to Magritte's style
   */
  private isMagritteRelated(project: any): boolean {
    const magritteKeywords = this.state.context.magritteKeywords;
    const projectText = `${project.title} ${project.description} ${project.requirements.join(' ')}`.toLowerCase();
    
    // Check for explicit Magritte references
    const hasMagritteKeywords = magritteKeywords.some(keyword => projectText.includes(keyword.toLowerCase()));
    
    // Check for surrealist/philosophical context
    const hasPhilosophicalContext = ['surreal', 'philosophical', 'paradox', 'metaphysical'].some(term => 
      projectText.includes(term.toLowerCase())
    );
    
    // Check for visual style indicators
    const hasVisualStyle = ['floating', 'impossible', 'juxtaposition', 'metamorphosis'].some(term => 
      projectText.includes(term.toLowerCase())
    );
    
    return hasMagritteKeywords || (hasPhilosophicalContext && hasVisualStyle);
  }
  
  /**
   * Generate fallback ideas when other methods fail
   */
  private generateFallbackIdeas(): any[] {
    return [
      {
        title: "The Window's Truth",
        description: "A window revealing the paradox of perception",
        elements: ["window frame", "impossible view", "reality distortion"],
        styles: ["metaphysical surrealism", "philosophical", "magritte-inspired"],
        impact: "questioning the nature of reality and representation"
      },
      {
        title: "Object Meditation",
        description: "Common objects in metaphysical dialogue",
        elements: ["bowler hat", "green apple", "floating pipe"],
        styles: ["surreal still life", "symbolic", "philosophical"],
        impact: "contemplation of object essence and meaning"
      },
      {
        title: "Empire of Questions",
        description: "A surreal scene exploring day and night paradox",
        elements: ["day-night sky", "street lamp", "empty street"],
        styles: ["atmospheric surrealism", "metaphysical", "magritte-homage"],
        impact: "challenging temporal and perceptual assumptions"
      }
    ];
  }

  // Add Hopper-specific idea generation
  private async generateHopperIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in HOPPER-style ideation. Focus on urban solitude, dramatic lighting, and psychological atmosphere. Generate ideas that capture quiet moments of modern life with architectural precision and emotional resonance.`
      },
      {
        role: 'user',
        content: `Generate 5 Hopper-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that captures urban solitude
        2. A description of the scene and psychological atmosphere
        3. Key architectural and lighting elements
        4. Visual composition
        5. Emotional impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      // Mock Hopper-style ideas
      return [
        {
          title: "Morning Light in Empty Diner",
          description: "Early sunlight streaming through large windows into a deserted diner",
          elements: ["diagonal light", "empty booths", "geometric shadows", "solitary coffee cup"],
          styles: ["urban realism", "psychological atmosphere", "architectural geometry"],
          impact: "contemplation of urban solitude and modern life",
          visualComposition: "Strong diagonal light creating geometric patterns across empty space"
        },
        {
          title: "Hotel Room at Dawn",
          description: "First light entering a sparse hotel room, creating dramatic shadows",
          elements: ["window light", "simple furniture", "architectural framing", "morning shadows"],
          styles: ["psychological realism", "urban isolation", "geometric simplicity"],
          impact: "exploring themes of transience and solitude",
          visualComposition: "Window frame casting dramatic shadows on bare walls"
        }
      ];
    } catch (error) {
      console.error('Error generating Hopper-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  // Add new idea generation methods for photographers
  private async generateArbusIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in ARBUS-style ideation. Focus on psychological intensity, social observation, and direct confrontation. Generate ideas that reveal the complexity of human subjects with unflinching honesty.`
      },
      {
        role: 'user',
        content: `Generate 5 Arbus-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that captures psychological depth
        2. A description of the subject and social context
        3. Key psychological and documentary elements
        4. Visual approach
        5. Social impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Twins in the Park",
          description: "Two identical siblings revealing subtle differences",
          elements: ["direct gaze", "square format", "psychological tension", "social observation"],
          styles: ["documentary realism", "psychological portraiture", "social documentation"],
          impact: "exploring identity and individuality",
          visualApproach: "Direct frontal composition with natural light"
        },
        {
          title: "Carnival Worker at Dawn",
          description: "Portrait revealing the humanity behind social margins",
          elements: ["flash lighting", "social outsider", "revealing expression", "documentary clarity"],
          styles: ["social documentation", "psychological intensity", "direct observation"],
          impact: "challenging social perceptions",
          visualApproach: "Stark lighting emphasizing character"
        }
      ];
    } catch (error) {
      console.error('Error generating Arbus-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateAvedonIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in AVEDON-style ideation. Focus on stark minimalism, psychological intensity, and revealing portraiture. Generate ideas that strip away context to reveal essential character.`
      },
      {
        role: 'user',
        content: `Generate 5 Avedon-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title emphasizing character
        2. A description of the portrait approach
        3. Key minimalist and psychological elements
        4. Visual technique
        5. Emotional resonance
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Worker Against White",
          description: "Stark portrait revealing inner strength",
          elements: ["white background", "sharp detail", "psychological intensity", "minimalist setting"],
          styles: ["stark minimalism", "psychological portraiture", "character study"],
          impact: "revealing essential humanity",
          visualTechnique: "High contrast against seamless white"
        },
        {
          title: "Artist in Profile",
          description: "Minimalist study of creative intensity",
          elements: ["stark lighting", "clean composition", "revealing pose", "psychological depth"],
          styles: ["minimalist portraiture", "character revelation", "stark simplicity"],
          impact: "exploring creative essence",
        }
      ];
    } catch (error) {
      console.error('Error generating Avedon-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateEgglestonIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in EGGLESTON-style ideation. Focus on democratic vision, saturated color, and everyday beauty. Generate ideas that elevate ordinary scenes through precise composition and color relationships.`
      },
      {
        role: 'user',
        content: `Generate 5 Eggleston-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title capturing everyday beauty
        2. A description of the scene and color
        3. Key democratic and compositional elements
        4. Color relationships
        5. Visual impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Red Ceiling Light",
          description: "Saturated color transforming mundane interior",
          elements: ["saturated red", "everyday object", "precise composition", "democratic vision"],
          styles: ["color photography", "democratic subject", "formal precision"],
          impact: "elevating ordinary to extraordinary",
          colorRelationships: "Intense red against neutral surroundings"
        },
        {
          title: "Parking Lot at Noon",
          description: "Finding beauty in vernacular America",
          elements: ["everyday scene", "strong color", "found composition", "democratic subject"],
          styles: ["vernacular photography", "color intensity", "precise observation"],
          impact: "revealing beauty in the ordinary",
          colorRelationships: "Vibrant colors against urban grey"
        }
      ];
    } catch (error) {
      console.error('Error generating Eggleston-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateLeibovitzIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in LEIBOVITZ-style ideation. Focus on dramatic staging, conceptual narrative, and theatrical lighting. Generate ideas that create powerful visual stories through carefully crafted scenes.`
      },
      {
        role: 'user',
        content: `Generate 5 Leibovitz-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title suggesting narrative
        2. A description of the conceptual scene
        3. Key theatrical and lighting elements
        4. Production approach
        5. Visual drama
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Hero in Repose",
          description: "Dramatically lit portrait revealing inner strength",
          elements: ["theatrical lighting", "environmental context", "narrative setting", "conceptual props"],
          styles: ["dramatic portraiture", "conceptual narrative", "cinematic lighting"],
          impact: "creating visual mythology",
          productionApproach: "Complex lighting and environmental staging"
        },
        {
          title: "Artist's Dream",
          description: "Surreal scene exploring creative imagination",
          elements: ["dramatic staging", "conceptual elements", "narrative lighting", "symbolic props"],
          styles: ["theatrical portraiture", "conceptual photography", "dramatic narrative"],
          impact: "visualizing inner world",
          productionApproach: "Elaborate set design and dramatic lighting"
        }
      ];
    } catch (error) {
      console.error('Error generating Leibovitz-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateCartierBressonIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in CARTIER-BRESSON-style ideation. Focus on decisive moments, geometric composition, and street photography. Generate ideas that capture the poetry of everyday life through precise timing and composition.`
      },
      {
        role: 'user',
        content: `Generate 5 Cartier-Bresson-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title capturing a moment
        2. A description of the decisive moment
        3. Key geometric and timing elements
        4. Compositional approach
        5. Visual poetry
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Leap of Faith",
          description: "Perfect moment of human grace in urban setting",
          elements: ["decisive moment", "geometric composition", "human gesture", "urban context"],
          styles: ["street photography", "geometric precision", "visual poetry"],
          impact: "capturing life's poetry",
          compositionalApproach: "Golden ratio with dynamic tension"
        },
        {
          title: "Behind Saint-Lazare",
          description: "Reflection of urban rhythm and human movement",
          elements: ["perfect timing", "geometric balance", "street life", "visual harmony"],
          styles: ["decisive moment", "compositional geometry", "street observation"],
          impact: "revealing urban poetry",
          compositionalApproach: "Dynamic diagonals with reflection"
        }
      ];
    } catch (error) {
      console.error('Error generating Cartier-Bresson-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateCooperGorferIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in COOPER & GORFER-style ideation. Focus on dreamlike narratives, cultural storytelling, and layered compositions. Generate ideas that weave together identity, heritage, and ethereal atmosphere.`
      },
      {
        role: 'user',
        content: `Generate 5 Cooper & Gorfer-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title suggesting cultural narrative
        2. A description of the dreamlike scene
        3. Key cultural and atmospheric elements
        4. Layered composition approach
        5. Cultural resonance
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Floating Memories",
          description: "Cultural heritage suspended in dreamlike space",
          elements: ["layered imagery", "cultural symbols", "ethereal atmosphere", "floating elements"],
          styles: ["dreamlike narrative", "cultural storytelling", "layered composition"],
          impact: "exploring cultural identity",
          compositionApproach: "Multiple layers with dimensional depth"
        },
        {
          title: "Heritage Dreams",
          description: "Traditional costume transformed by poetic space",
          elements: ["cultural elements", "dreamlike quality", "symbolic objects", "ethereal lighting"],
          styles: ["cultural narrative", "ethereal atmosphere", "symbolic layering"],
          impact: "preserving cultural memory",
          compositionApproach: "Collaged elements in mystical space"
        }
      ];
    } catch (error) {
      console.error('Error generating Cooper & Gorfer-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateVonWongIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in VON WONG-style ideation. Focus on epic environmental messaging, dramatic staging, and social impact. Generate ideas that create powerful visual statements about environmental issues.`
      },
      {
        role: 'user',
        content: `Generate 5 Von Wong-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title with environmental impact
        2. A description of the epic scene
        3. Key production and message elements
        4. Technical approach
        5. Social resonance
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Ocean's Plastic Legacy",
          description: "Epic installation revealing marine pollution impact",
          elements: ["environmental scale", "dramatic lighting", "conservation theme", "epic staging"],
          styles: ["environmental activism", "epic production", "social impact"],
          impact: "raising environmental awareness",
          technicalApproach: "Complex rigging and dramatic lighting"
        },
        {
          title: "Climate Warriors",
          description: "Dramatic portraits of environmental defenders",
          elements: ["epic perspective", "environmental message", "powerful composition", "dramatic staging"],
          styles: ["activist photography", "epic scale", "environmental narrative"],
          impact: "inspiring environmental action",
          technicalApproach: "Location mastery with technical excellence"
        }
      ];
    } catch (error) {
      console.error('Error generating Von Wong-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private async generateBourdinIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in BOURDIN-style ideation. Focus on surreal fashion, bold color, and psychological tension. Generate ideas that create provocative narratives through fashion context.`
      },
      {
        role: 'user',
        content: `Generate 5 Bourdin-inspired art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title suggesting mystery
        2. A description of the surreal scene
        3. Key fashion and narrative elements
        4. Color approach
        5. Psychological impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      return [
        {
          title: "Red Shoes at Dawn",
          description: "Surreal fashion narrative with psychological edge",
          elements: ["bold color", "fashion context", "surreal composition", "narrative tension"],
          styles: ["fashion surrealism", "psychological drama", "color intensity"],
          impact: "creating visual intrigue",
          colorApproach: "Saturated primary colors with dark undertones"
        },
        {
          title: "Dream of Luxury",
          description: "Mysterious fashion scene with symbolic elements",
          elements: ["luxury aesthetic", "psychological space", "symbolic objects", "bold palette"],
          styles: ["surreal fashion", "narrative mystery", "color psychology"],
          impact: "exploring desire and luxury",
          colorApproach: "Rich contrasts with symbolic color"
        }
      ];
    } catch (error) {
      console.error('Error generating Bourdin-style ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
} 