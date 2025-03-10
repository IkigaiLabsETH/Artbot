import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';
import { v4 as uuidv4 } from 'uuid';
import { ReferenceImageProvider, ImageMetadata } from './ReferenceImageProvider.js';

// Stylist agent is responsible for developing artistic styles
export class StylistAgent extends BaseAgent {
  private referenceImageProvider: ReferenceImageProvider | null = null;
  
  constructor(aiService: AIService, referenceImageProvider?: ReferenceImageProvider) {
    super(AgentRole.STYLIST, aiService);
    this.referenceImageProvider = referenceImageProvider || null;
    this.state.context = {
      currentTask: null,
      developedStyles: [],
      styleParameters: {
        coherenceWeight: 0.8,
        distinctivenessWeight: 0.7,
        adaptabilityWeight: 0.6
      },
      styleLibrary: {
        magritte: {
          core: {
            essence: 'Oil painted surrealism with vintage Apple technology',
            era: 'Belgian surrealism meets early computing (1976-1995)',
            influences: ['oil painting', 'metaphysics', 'early computing', 'Belgian surrealism']
          },
          visual: {
            composition: {
              primary: ['balanced vintage hardware', 'surreal interface staging', 'impossible computer arrangements'],
              secondary: ['precise product placement', 'spatial computing paradox', 'interface illusions'],
              framing: ['formal oil painting', 'contemplative canvas', 'stage-like product display']
            },
            lighting: {
              quality: ['painted CRT glow', 'oil rendered LED indicators', 'luminous phosphor displays'],
              technique: ['smooth shadow transitions', 'subtle light modeling', 'crystalline reflections'],
              effects: ['painted screen glow', 'oil rendered shadows', 'ethereal machine light']
            },
            color: {
              palettes: [
                ['original Macintosh beige', 'System 7 grey', 'Apple II green'],
                ['platinum grey', 'rainbow logo spectrum', 'early Mac white'],
                ['Apple IIc cream', 'Mac OS blue', 'status LED red']
              ],
              characteristics: ['oil paint finish', 'smooth transitions', 'matte surface'],
              treatments: ['painted plastic', 'canvas texture', 'subtle aging']
            }
          },
          elements: {
            symbols: ['oil painted Apple logo', 'painted floppy disk', 'rendered CRT screen'],
            settings: ['painted computer labs', 'surreal development spaces', 'metaphysical offices'],
            objects: ['oil rendered computers', 'painted peripherals', 'surreal cables']
          },
          techniques: {
            painting: [
              'smooth oil technique',
              'precise edge control',
              'subtle surface texture',
              'unified light treatment',
              'crystalline detail',
              'soft shadow modeling',
              'clean color transitions',
              'matte finish rendering',
              'canvas-like quality',
              'traditional oil methods'
            ],
            surrealism: [
              'impossible interface scale',
              'computer displacement',
              'reality questioning',
              'metaphysical arrangements',
              'paradoxical reflections'
            ],
            conceptual: [
              'technological paradox',
              'computational philosophy',
              'digital poetry',
              'silicon metaphysics',
              'binary surrealism'
            ]
          }
        }
      },
      hybridApproaches: [
        {
          name: 'Oil Painted Computing',
          description: 'Merging traditional oil painting with vintage technology',
          elements: {
            composition: ['painted hardware', 'canvas-like interfaces'],
            lighting: ['oil rendered glow', 'painted indicators'],
            color: ['smooth color transitions', 'matte finish'],
            narrative: ['painted metaphysics', 'traditional surrealism']
          }
        },
        {
          name: 'Digital Canvas',
          description: 'Traditional painting techniques with digital elements',
          elements: {
            composition: ['oil painted screens', 'surreal hardware'],
            lighting: ['painted phosphor', 'traditional glow'],
            color: ['oil paint palette', 'vintage tones'],
            narrative: ['painted philosophy', 'canvas computing']
          }
        }
      ]
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize reference image provider if available
    if (this.referenceImageProvider) {
      await this.referenceImageProvider.initialize();
      console.log('StylistAgent: Reference image provider initialized');
    }
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
    if (content.action === 'assign_task' && content.targetRole === AgentRole.STYLIST) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Develop styles based on the ideas
      const styles = await this.developStyleForProject(task, content.project);
      
      // Store developed styles
      this.state.context.developedStyles = styles;
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: styles
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
    // Handle feedback on our styles
    return null;
  }
  
  private async developStyleForProject(project: any, ideas: any[]): Promise<any[]> {
    // Determine the dominant artistic approach
    const approach = this.determineArtisticApproach(project, ideas);
    
    // Generate styles based on the approach
    switch (approach.type) {
      case 'bourdin':
        return this.developBourdinStyle(project, ideas, approach.weight);
      case 'magritte':
        return this.developMagritteStyle(project, ideas, approach.weight);
      case 'hybrid':
        return this.developHybridStyle(project, ideas, approach.hybridRatio);
      default:
        return this.developDefaultStyle(project, ideas);
    }
  }

  private determineArtisticApproach(project: any, ideas: any[]): {
    type: 'bourdin' | 'magritte' | 'hybrid';
    weight?: number;
    hybridRatio?: number;
  } {
    const projectText = `${String(project.title)} ${String(project.description)} ${ideas.map(i => String(i.description)).join(' ')}`.toLowerCase();
    
    // Calculate style scores
    const bourdinScore = this.calculateStyleScore(projectText, this.state.context.styleLibrary.bourdin);
    const magritteScore = this.calculateStyleScore(projectText, this.state.context.styleLibrary.magritte);
    
    // Determine approach based on scores
    if (Math.abs(bourdinScore - magritteScore) < 0.2) {
      // Scores are close enough to warrant a hybrid approach
      const hybridRatio = bourdinScore / (bourdinScore + magritteScore);
      return { type: 'hybrid', hybridRatio };
    }
    
    if (bourdinScore > magritteScore) {
      return { type: 'bourdin', weight: bourdinScore };
    }
    
    return { type: 'magritte', weight: magritteScore };
  }

  private calculateStyleScore(text: string, styleLibrary: any): number {
    let score = 0;
    let totalChecks = 0;
    
    // Check core concepts
    const coreMatches = (styleLibrary.core.influences as string[]).filter(influence => 
      text.includes(influence.toLowerCase())
    ).length;
    score += coreMatches / styleLibrary.core.influences.length;
    totalChecks++;
    
    // Check visual elements
    const visualMatches = Object.values(styleLibrary.visual)
      .flatMap(category => Object.values(category as Record<string, string[]>))
      .flat()
      .filter(element => text.includes((element as string).toLowerCase()))
      .length;
    score += visualMatches / 20; // Normalize by expected average matches
    totalChecks++;
    
    // Check specific elements
    const elementMatches = Object.values(styleLibrary.elements)
      .flat()
      .filter(element => text.includes((element as string).toLowerCase()))
      .length;
    score += elementMatches / 15; // Normalize by expected average matches
    totalChecks++;
    
    // Check techniques
    const techniqueMatches = Object.values(styleLibrary.techniques)
      .flat()
      .filter(technique => text.includes((technique as string).toLowerCase()))
      .length;
    score += techniqueMatches / 10; // Normalize by expected average matches
    totalChecks++;
    
    return score / totalChecks;
  }

  private async developBourdinStyle(project: any, ideas: any[], weight: number): Promise<any[]> {
    const library = this.state.context.styleLibrary.bourdin;
    const styles = [];
    
    for (const idea of ideas) {
      const style = {
        name: `${idea.title} - Bourdin Interpretation`,
        description: "A provocative fashion narrative with psychological depth",
        composition: this.selectStyleElements(library.visual.composition, weight),
        lighting: this.selectStyleElements(library.visual.lighting, weight),
        color: {
          palette: this.selectRandomPalette(library.visual.color.palettes),
          treatment: this.selectStyleElements(library.visual.color.treatments, weight)
        },
        elements: {
          fashion: this.selectStyleElements(library.elements.fashion, weight),
          props: this.selectStyleElements(library.elements.props, weight),
          settings: this.selectStyleElements(library.elements.settings, weight)
        },
        techniques: {
          photographic: this.selectStyleElements(library.techniques.photographic, weight),
          styling: this.selectStyleElements(library.techniques.styling, weight),
          narrative: this.selectStyleElements(library.techniques.narrative, weight)
        }
      };
      
      styles.push(style);
    }
    
    return styles;
  }

  private async developMagritteStyle(project: any, ideas: any[], weight: number): Promise<any[]> {
    const library = this.state.context.styleLibrary.magritte;
    const styles = [];
    
    for (const idea of ideas) {
      const style = {
        name: `${idea.title} - Magritte Vision`,
        description: "A philosophical surrealist exploration of reality",
        composition: this.selectStyleElements(library.visual.composition, weight),
        lighting: this.selectStyleElements(library.visual.lighting, weight),
        color: {
          palette: this.selectRandomPalette(library.visual.color.palettes),
          treatment: this.selectStyleElements(library.visual.color.treatments, weight)
        },
        elements: {
          symbols: this.selectStyleElements(library.elements.symbols, weight),
          settings: this.selectStyleElements(library.elements.settings, weight),
          objects: this.selectStyleElements(library.elements.objects, weight)
        },
        techniques: {
          painting: this.selectStyleElements(library.techniques.painting, weight),
          surrealism: this.selectStyleElements(library.techniques.surrealism, weight),
          conceptual: this.selectStyleElements(library.techniques.conceptual, weight)
        }
      };
      
      styles.push(style);
    }
    
    return styles;
  }

  private async developHybridStyle(project: any, ideas: any[], hybridRatio: number): Promise<any[]> {
    const styles = [];
    const bourdinLibrary = this.state.context.styleLibrary.bourdin;
    const magritteLibrary = this.state.context.styleLibrary.magritte;
    
    for (const idea of ideas) {
      // Select a hybrid approach template
      const hybridTemplate = this.selectRandomHybridTemplate();
      
      const style = {
        name: `${idea.title} - ${hybridTemplate.name}`,
        description: hybridTemplate.description,
        composition: {
          bourdin: this.selectStyleElements(bourdinLibrary.visual.composition, hybridRatio),
          magritte: this.selectStyleElements(magritteLibrary.visual.composition, 1 - hybridRatio)
        },
        lighting: {
          bourdin: this.selectStyleElements(bourdinLibrary.visual.lighting, hybridRatio),
          magritte: this.selectStyleElements(magritteLibrary.visual.lighting, 1 - hybridRatio)
        },
        color: {
          palette: this.mergeColorPalettes(
            this.selectRandomPalette(bourdinLibrary.visual.color.palettes),
            this.selectRandomPalette(magritteLibrary.visual.color.palettes),
            hybridRatio
          ),
          treatment: [
            ...this.selectStyleElements(bourdinLibrary.visual.color.treatments, hybridRatio),
            ...this.selectStyleElements(magritteLibrary.visual.color.treatments, 1 - hybridRatio)
          ]
        },
        elements: {
          fashion: this.selectStyleElements(bourdinLibrary.elements.fashion, hybridRatio),
          symbols: this.selectStyleElements(magritteLibrary.elements.symbols, 1 - hybridRatio),
          props: [
            ...this.selectStyleElements(bourdinLibrary.elements.props, hybridRatio),
            ...this.selectStyleElements(magritteLibrary.elements.objects, 1 - hybridRatio)
          ]
        },
        techniques: {
          photographic: this.selectStyleElements(bourdinLibrary.techniques.photographic, hybridRatio),
          surrealism: this.selectStyleElements(magritteLibrary.techniques.surrealism, 1 - hybridRatio),
          narrative: [
            ...this.selectStyleElements(bourdinLibrary.techniques.narrative, hybridRatio),
            ...this.selectStyleElements(magritteLibrary.techniques.conceptual, 1 - hybridRatio)
          ]
        }
      };
      
      styles.push(style);
    }
    
    return styles;
  }

  private selectStyleElements(elements: string[], weight: number): string[] {
    const count = Math.max(1, Math.floor(elements.length * weight));
    return this.getRandomElements(elements, count);
  }

  private selectRandomPalette(palettes: string[][]): string[] {
    return palettes[Math.floor(Math.random() * palettes.length)];
  }

  private mergeColorPalettes(palette1: string[], palette2: string[], ratio: number): string[] {
    const count1 = Math.floor(palette1.length * ratio);
    const count2 = Math.floor(palette2.length * (1 - ratio));
    
    return [
      ...this.getRandomElements(palette1, count1),
      ...this.getRandomElements(palette2, count2)
    ];
  }

  private selectRandomHybridTemplate(): any {
    const templates = this.state.context.hybridApproaches;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  private async developDefaultStyle(project: any, ideas: any[]): Promise<any[]> {
    return [{
      name: "Default Style",
      description: "A balanced blend of contemporary elements",
      composition: ["balanced", "centered", "harmonious"],
      lighting: ["natural", "soft", "ambient"],
      color: {
        palette: ["#000000", "#FFFFFF", "#808080"],
        treatment: ["balanced", "natural"]
      },
      elements: {
        primary: ["geometric shapes", "organic forms"],
        secondary: ["texture", "pattern"],
        accents: ["minimal details"]
      },
      techniques: {
        primary: ["digital composition", "photographic elements"],
        secondary: ["subtle effects", "clean editing"]
      }
    }];
  }
} 