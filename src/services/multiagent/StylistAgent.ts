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
            essence: 'Traditional oil painting techniques applied to vintage Apple technology',
            era: 'Belgian surrealism meets early computing (1976-1995)',
            influences: [
              'traditional oil painting',
              'Magritte\'s precise technique',
              'vintage computing',
              'Belgian surrealism',
              'classical painting methods'
            ]
          },
          visual: {
            composition: {
              primary: [
                'perfectly balanced vintage hardware',
                'mathematically precise staging',
                'impossible computer arrangements',
                'golden ratio compositions',
                'classical painting structure'
              ],
              secondary: [
                'precise product placement',
                'spatial computing paradox',
                'interface illusions',
                'traditional depth techniques',
                'painterly perspective'
              ],
              framing: [
                'museum-quality oil painting',
                'traditional canvas proportions',
                'classical composition rules',
                'formal painting arrangement',
                'contemplative spacing'
              ]
            },
            lighting: {
              quality: [
                'traditional oil painting illumination',
                'perfectly rendered LED indicators',
                'classical studio lighting',
                'old masters glow technique',
                'pristine surface highlights'
              ],
              technique: [
                'smooth shadow transitions',
                'perfect light modeling',
                'crystalline reflections',
                'traditional glazing effects',
                'subtle luminosity'
              ],
              effects: [
                'oil painted screen glow',
                'traditional light rendering',
                'classical shadow depth',
                'perfect highlight control',
                'subtle ambient occlusion'
              ]
            },
            color: {
              palettes: [
                ['oil painted Macintosh beige', 'traditional System 7 grey', 'glazed Apple II green'],
                ['classical platinum grey', 'perfect rainbow spectrum', 'pristine Mac white'],
                ['traditional Apple IIc cream', 'painted Mac OS blue', 'precise LED red']
              ],
              characteristics: [
                'oil paint finish',
                'perfect color transitions',
                'traditional matte surface',
                'classical color harmony',
                'subtle tonal variations'
              ],
              treatments: [
                'traditional canvas texture',
                'perfect paint application',
                'classical varnish finish',
                'subtle aging effects',
                'pristine surface quality'
              ]
            }
          },
          elements: {
            symbols: [
              'perfectly painted Apple logo',
              'traditional floppy disk rendering',
              'oil painted CRT screen',
              'classical keyboard treatment',
              'pristine interface elements'
            ],
            settings: [
              'traditional computer lab painting',
              'classical development space',
              'oil painted office interior',
              'perfectly rendered facilities',
              'pristine testing environment'
            ],
            objects: [
              'perfectly painted computers',
              'traditional peripheral rendering',
              'classical cable arrangement',
              'pristine hardware details',
              'oil painted accessories'
            ]
          },
          techniques: {
            painting: [
              'flawless oil application',
              'perfect edge control',
              'subtle surface texture',
              'unified light treatment',
              'crystalline detail rendering',
              'classical shadow modeling',
              'smooth color transitions',
              'traditional matte finish',
              'pristine canvas quality',
              'perfect paint layering'
            ],
            surrealism: [
              'impossible interface scale',
              'perfect object displacement',
              'classical reality questioning',
              'traditional metaphysical approach',
              'pristine paradox rendering'
            ],
            conceptual: [
              'philosophical technology',
              'classical computing poetry',
              'traditional binary surrealism',
              'perfect metaphysical staging',
              'pristine concept execution'
            ]
          }
        }
      },
      hybridApproaches: [
        {
          name: 'Classical Computing',
          description: 'Traditional oil painting techniques applied to vintage technology',
          elements: {
            composition: ['perfect hardware arrangement', 'classical interface staging'],
            lighting: ['traditional illumination', 'pristine highlights'],
            color: ['perfect color harmony', 'traditional finish'],
            narrative: ['classical metaphysics', 'traditional surrealism']
          }
        },
        {
          name: 'Digital Canvas',
          description: 'Classical painting methods with vintage computing elements',
          elements: {
            composition: ['traditional screen arrangement', 'perfect hardware staging'],
            lighting: ['classical screen glow', 'pristine illumination'],
            color: ['traditional palette', 'perfect vintage tones'],
            narrative: ['classical philosophy', 'traditional computing poetry']
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