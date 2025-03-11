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
  THEATRICAL = 'theatrical'        // Focus on dramatic staging and lighting
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
        [IdeationApproach.SURREAL]: 0.95,
        [IdeationApproach.SYMBOLIC]: 0.85,
        [IdeationApproach.ATMOSPHERIC]: 0.8,
        [IdeationApproach.COMPOSITIONAL]: 0.85,
        [IdeationApproach.NARRATIVE]: 0.8,
        [IdeationApproach.THEATRICAL]: 0.75
      },
      magritteKeywords: [
        // Painting Techniques
        'traditional oil painting', 'flawless brushwork', 'pristine edges', 'perfect matte finish',
        'classical canvas texture', 'traditional medium', 'perfect surface quality', 'crystalline detail',
        'subtle shadows', 'unified lighting', 'smooth transitions', 'delicate modeling',
        'museum quality', 'masterful technique', 'perfect execution', 'classical approach',
        
        // Core Symbols and Objects with Modern Hats
        'vintage fedora', 'classic newsboy cap', 'wool beanie', 'wide-brim felt hat',
        'flat cap', 'slouchy knit cap', 'porkpie hat', 'distressed leather fedora',
        'tweed flat cap', 'fisherman beanie', 'trilby hat', 'bucket hat',
        'green apples', 'clouds', 'pipes', 'mirrors', 'curtains', 'windows', 
        'birds', 'men in suits', 'floating rocks', 'everyday objects', 'mysterious doors',
        
        // Philosophical Concepts
        'classical surrealism', 'traditional paradox', 'perfect mystery',
        'metaphysical questioning', 'philosophical depth', 'reality questioning',
        'classical reality', 'identity exploration', 'traditional space', 'visual poetry',
        
        // Visual Elements
        'perfect lighting', 'traditional shadows', 'classical perspective',
        'pristine surfaces', 'perfect reflections', 'traditional depth',
        'flawless composition', 'classical framing', 'perfect symmetry',
        
        // Settings and Environments
        'traditional interiors', 'classical landscapes', 'perfect rooms',
        'pristine skies', 'traditional architecture', 'perfect spaces',
        'classical chambers', 'traditional windows', 'perfect staging',

        // Modern Hat Descriptions
        'artisanal hat craftsmanship', 'vintage hat patina', 'handcrafted hat details',
        'weathered hat leather', 'organic wool texture', 'sustainable hat materials',
        'traditional hat making', 'contemporary hat styling', 'urban hat aesthetic',
        'minimalist hat design', 'rustic hat elements', 'modern hat interpretation'
      ],
      artisticApproaches: {
        magritte: {
          composition: [
            'traditionally painted objects',
            'classical arrangements',
            'perfect staging',
            'traditional displays',
            'flawless rendering',
            'classical spaces',
            'perfect reflections',
            'traditional windows',
            'classical perspective',
            'perfect space distortion'
          ],
          lighting: [
            'traditional natural light',
            'classical illumination',
            'perfect shadows',
            'traditional atmosphere',
            'classical twilight',
            'perfect darkness',
            'traditional radiance',
            'classical luminescence',
            'perfect atmosphere',
            'traditional light'
          ],
          color: [
            'deep sky blue (RGB: 135, 206, 235)',
            'crisp daylight blue (RGB: 176, 196, 222)',
            'clean grey tones (RGB: 128, 128, 128)',
            'pure black (RGB: 0, 0, 0)',
            'pristine white (RGB: 255, 255, 255)',
            'subtle earth tones (RGB: 193, 154, 107)',
            'clear cloud white (RGB: 236, 236, 236)',
            'precise shadow tones (RGB: 47, 79, 79)',
            'clean highlight blue (RGB: 230, 230, 250)',
            'pure neutral tones (RGB: 210, 180, 140)'
          ],
          narrative: [
            'classical philosophical questions',
            'traditional paradoxes',
            'perfect visual poetry',
            'classical metaphysics',
            'traditional reality questions',
            'perfect surrealism',
            'classical dialogues',
            'traditional narratives',
            'perfect stories',
            'classical identity'
          ],
          techniques: [
            'flawless oil technique',
            'perfect edge control',
            'traditional surface texture',
            'classical light treatment',
            'pristine detail rendering',
            'perfect shadow modeling',
            'traditional color transitions',
            'classical matte finish',
            'perfect canvas quality',
            'traditional oil methods'
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
        return this.generateSurrealIdeas(task, project, 1.0, 1500);
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
      default:
        // Fallback to general idea generation
        return this.generateIdeas(task, project);
    }
  }
  
  private getRandomModernHat(): string {
    const modernHats = [
      'vintage fedora',
      'classic newsboy cap',
      'wool beanie',
      'wide-brim felt hat',
      'flat cap',
      'slouchy knit cap',
      'porkpie hat',
      'distressed leather fedora',
      'tweed flat cap',
      'fisherman beanie',
      'trilby hat',
      'bucket hat'
    ];
    return modernHats[Math.floor(Math.random() * modernHats.length)];
  }

  private async generateMetaphysicalIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in METAPHYSICAL ideation in Magritte's tradition. Focus on philosophical paradoxes, reality questioning, and metaphysical concepts. Generate ideas that challenge perception and provoke philosophical thought.

        Important: Use modern/hipster hats instead of bowler hats. Choose from: vintage fedora, newsboy cap, wool beanie, wide-brim felt hat, flat cap, slouchy knit cap, porkpie hat, distressed leather fedora, tweed flat cap, fisherman beanie, trilby hat, bucket hat.`
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
        3. Key symbolic elements (using modern hats, not bowler hats)
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
      
      // Mock metaphysical ideas with modern hats
      return [
        {
          title: "The Persistence of Identity",
          description: "A visual exploration of self-referential reality",
          elements: [this.getRandomModernHat(), "mirror reflecting its own absence", "window showing what it conceals"],
          styles: ["metaphysical surrealism", "philosophical paradox", "symbolic resonance"],
          impact: "questioning the nature of representation and reality",
          visualRepresentation: "A series of nested frames containing contradictory realities"
        },
        {
          title: "Time's Reflection",
          description: "An investigation of temporal paradoxes through everyday objects",
          elements: ["floating " + this.getRandomModernHat(), "melting clock", "infinite staircase"],
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
  private async generateSurrealIdeas(task: any, project: any, temperature: number, maxTokens: number): Promise<any[]> {
    const surrealPrompt = await this.generateSurrealPrompt(project);
    
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in SURREAL ideation in Magritte's style. Focus on impossible juxtapositions, dream-like scenarios, and reality-bending concepts. Generate ideas that challenge perception through surreal imagery.

        Important: Use modern/hipster hats instead of bowler hats. Choose from: vintage fedora, newsboy cap, wool beanie, wide-brim felt hat, flat cap, slouchy knit cap, porkpie hat, distressed leather fedora, tweed flat cap, fisherman beanie, trilby hat, bucket hat.`
      },
      {
        role: 'user',
        content: `Generate 5 surreal art ideas for the following prompt:
        
        ${surrealPrompt}
        
        For each idea, provide:
        1. A title that captures the surreal concept
        2. A description of the impossible scenario
        3. Key surreal elements (using modern hats, not bowler hats)
        4. Visual composition
        5. Perceptual impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature,
        maxTokens
      });
      
      // Mock surreal ideas with modern hats
      return [
        {
          title: "The Floating Library",
          description: "Books transforming into birds while a vintage fedora conducts their flight",
          elements: [this.getRandomModernHat(), "flying books", "impossible library", "bird-pages"],
          styles: ["surreal transformation", "literary flight", "magical realism"],
          impact: "blurring boundaries between knowledge and freedom",
          visualComposition: "Spiral arrangement of books becoming birds around a floating hat"
        },
        {
          title: "The Time Merchant",
          description: "A figure in a wool beanie selling bottled moments of eternity",
          elements: ["figure wearing " + this.getRandomModernHat(), "glass bottles of time", "liquid memories"],
          styles: ["temporal surrealism", "bottle poetry", "memory market"],
          impact: "questioning the commodification of time",
          visualComposition: "Grid of glowing bottles with captured moments"
        }
      ];
    } catch (error) {
      console.error('Error generating surreal ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  private async generateSurrealPrompt(project: any): Promise<string> {
    // Use the AI service to generate a surrealist prompt based on the project
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an AI assistant that generates surrealist prompts for idea generation. Given a project description, create a prompt that will inspire surreal and dream-like ideas.`
      },
      {
        role: 'user',
        content: `Generate a surrealist prompt for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        
        The prompt should:
        1. Incorporate key elements of surrealism like impossible juxtapositions, dream logic, and symbolic imagery
        2. Be open-ended and thought-provoking to inspire a range of surreal ideas
        3. Relate to the project's theme or subject matter in a surreal way
        4. Encourage the exploration of the subconscious and irrational
        5. Be 2-3 sentences long`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      return response.content.trim();
    } catch (error) {
      console.error('Error generating surreal prompt:', error);
      return `Generate surreal ideas that juxtapose ${project.title} with elements of the subconscious and irrational.`;
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
    
    // Check for surrealist keywords in the project description
    const surrealismKeywords = ['surreal', 'dream', 'impossible', 'juxtaposition', 'irrational'];
    const isSurrealismRelated = surrealismKeywords.some(keyword => 
      project.description.toLowerCase().includes(keyword)  
    );

    if (isSurrealismRelated) {
      console.log('Surrealist project detected, generating ideas with SURREAL approach');
      return this.generateSurrealIdeas(task, project, 1.0, 1500);
    }
    
    // Determine if we should generate ideas based on curiosity or user prompt
    const curiosityThreshold = 0.6;
    const curiosityScore = Math.random(); // Simple random score for now
    
    if (curiosityScore > curiosityThreshold) {
      // Generate ideas based on the agent's own curiosity
      console.log('Generating self-directed ideas based on curiosity');
      
      // Select a random ideation approach from our Magritte-focused approaches
      const approaches = [
        IdeationApproach.METAPHYSICAL,
        IdeationApproach.SURREAL,
        IdeationApproach.SYMBOLIC,
        IdeationApproach.ATMOSPHERIC,
        IdeationApproach.COMPOSITIONAL,
        IdeationApproach.NARRATIVE,
        IdeationApproach.THEATRICAL
      ];
      const randomApproach = approaches[Math.floor(Math.random() * approaches.length)];
      
      // Generate a creative prompt based on the selected approach
      const creativePrompt = await this.generateCreativePrompt(randomApproach);
      
      // Use the creative prompt instead of the user-provided one
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are the Ideator agent in a multi-agent art creation system. Your role is to generate creative, diverse, and novel ideas based on the provided creative prompt, focusing on Magritte's surrealist style and philosophical depth.`
        },
        {
          role: 'user',
          content: `Generate 5 creative art ideas based on the following prompt:
          
          ${creativePrompt}
          
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
        // ...
        
      } catch (error) {
        console.error('Error generating self-directed ideas:', error);
        return this.generateFallbackIdeas();
      }
    } else {
      // Generate ideas based on the user-provided prompt and project
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are the Ideator agent in a multi-agent art creation system. Your role is to generate creative, diverse, and novel ideas based on project requirements, focusing on Magritte's surrealist style. 
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
        // ...
        
      } catch (error) {
        console.error('Error generating ideas:', error);
        return this.generateFallbackIdeas();
      }
    }
  }
  
  private async generateCreativePrompt(approach: IdeationApproach): Promise<string> {
    // Use the AI service to generate a creative prompt based on the selected approach
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an AI assistant that generates creative prompts for idea generation. Given an ideation approach, create an open-ended prompt that will inspire novel ideas.`
      },
      {
        role: 'user',
        content: `Generate a creative prompt for the ${approach} ideation approach. The prompt should:
        
        1. Be open-ended and thought-provoking
        2. Encourage exploration of the key elements and concepts of the approach
        3. Inspire novel connections and ideas
        4. Not be too specific or restrictive
        5. Be a single paragraph of 3-5 sentences`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      return response.content.trim();
    } catch (error) {
      console.error('Error generating creative prompt:', error);
      return 'Generate creative ideas exploring the intersection of art and technology.';
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
        elements: ["vintage fedora", "green apple", "floating pipe"],
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
} 