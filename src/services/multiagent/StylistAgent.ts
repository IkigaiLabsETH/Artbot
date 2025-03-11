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
            essence: 'Traditional oil painting techniques in Belgian surrealism',
            era: 'Classic Magritte surrealism (1926-1967)',
            influences: [
              'traditional oil painting',
              'Magritte\'s precise technique',
              'Belgian surrealism',
              'classical painting methods',
              'philosophical paradox'
            ]
          },
          visual: {
            composition: {
              primary: [
                'perfectly balanced surreal elements',
                'mathematically precise staging',
                'impossible object arrangements',
                'golden ratio compositions',
                'classical painting structure'
              ],
              secondary: [
                'precise object placement',
                'spatial paradoxes',
                'window illusions',
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
                'day and night simultaneity',
                'mysterious atmospheric glow',
                'perfect shadow rendering',
                'subtle luminosity',
                'metaphysical light'
              ],
              technique: [
                'smooth shadow transitions',
                'perfect light modeling',
                'crystalline reflections',
                'traditional glazing effects',
                'unified illumination'
              ],
              effects: [
                'impossible lighting scenarios',
                'paradoxical shadows',
                'surreal atmospheric depth',
                'perfect highlight control',
                'subtle ambient occlusion'
              ]
            },
            color: {
              palettes: [
                ['cerulean sky blue', 'deep shadow grey', 'muted earth tones'],
                ['twilight purple', 'pristine cloud white', 'stone grey'],
                ['deep night blue', 'pale morning light', 'rich brown']
              ],
              characteristics: [
                'unmodulated color fields',
                'perfect transitions',
                'traditional matte surface',
                'classical color harmony',
                'subtle tonal variations'
              ],
              treatments: [
                'pure oil paint application',
                'perfect paint layering',
                'classical varnish finish',
                'pristine surface quality',
                'flawless color blending'
              ]
            }
          },
          elements: {
            symbols: [
              'floating bowler hats',
              'green apples',
              'billowing curtains',
              'mysterious birds',
              'paradoxical windows',
              'philosophical pipes',
              'floating stones',
              'enigmatic mirrors',
              'surreal doors',
              'metaphysical frames'
            ],
            settings: [
              'impossible landscapes',
              'surreal interiors',
              'metaphysical spaces',
              'paradoxical rooms',
              'mysterious horizons',
              'philosophical voids',
              'dreamlike environments',
              'contemplative settings',
              'infinite skies',
              'impossible architecture'
            ],
            objects: [
              'levitating objects',
              'transformed everyday items',
              'paradoxical elements',
              'mysterious artifacts',
              'philosophical props',
              'surreal furnishings',
              'impossible combinations',
              'metaphysical tools',
              'enigmatic instruments',
              'dreamlike accessories'
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
              'impossible scale relationships',
              'perfect object displacement',
              'classical reality questioning',
              'traditional metaphysical approach',
              'pristine paradox rendering',
              'mysterious juxtapositions',
              'philosophical transformations',
              'dreamlike combinations',
              'surreal metamorphoses',
              'enigmatic arrangements'
            ],
            conceptual: [
              'philosophical questioning',
              'metaphysical poetry',
              'surreal narratives',
              'perfect paradox execution',
              'pristine concept realization',
              'mysterious symbolism',
              'contemplative depth',
              'dreamlike logic',
              'enigmatic meanings',
              'philosophical resonance'
            ]
          }
        }
      },
      approaches: [
        {
          name: 'Traditional Surrealism',
          description: 'Pure Magritte oil painting technique with classical surrealist elements',
          elements: {
            composition: ['perfect object arrangement', 'metaphysical staging'],
            lighting: ['mysterious illumination', 'paradoxical shadows'],
            color: ['unmodulated paint', 'pristine surface'],
            narrative: ['philosophical depth', 'surreal poetry']
          }
        },
        {
          name: 'Metaphysical Vision',
          description: 'Classical painting methods with profound philosophical elements',
          elements: {
            composition: ['impossible arrangements', 'perfect balance'],
            lighting: ['day-night paradox', 'crystalline clarity'],
            color: ['traditional palette', 'perfect flatness'],
            narrative: ['visual poetry', 'contemplative depth']
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
    // Generate styles based on Magritte's approach
    return this.developMagritteStyle(project, ideas, 1.0);
  }

  private determineArtisticApproach(project: any, ideas: any[]): {
    type: 'magritte';
    weight: number;
  } {
    return { type: 'magritte', weight: 1.0 };
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

  private selectStyleElements(elements: string[], weight: number): string[] {
    const count = Math.max(1, Math.floor(elements.length * weight));
    return this.getRandomElements(elements, count);
  }

  private selectRandomPalette(palettes: string[][]): string[] {
    return palettes[Math.floor(Math.random() * palettes.length)];
  }

  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  private async developDefaultStyle(project: any, ideas: any[]): Promise<any[]> {
    return [{
      name: "Magritte Default Style",
      description: "A balanced surrealist composition in Magritte's style",
      composition: ["centered", "balanced", "metaphysical"],
      lighting: ["soft", "atmospheric", "mysterious"],
      color: {
        palette: ["#4A4A4A", "#87CEEB", "#8B4513", "#F5F5F5"],
        treatment: ["matte", "unmodulated", "pristine"]
      },
      elements: {
        primary: ["bowler hat", "green apple", "window frame"],
        secondary: ["clouds", "curtains", "birds"],
        accents: ["philosophical objects"]
      },
      techniques: {
        primary: ["oil painting", "perfect flatness"],
        secondary: ["precise shadows", "clean edges"]
      }
    }];
  }
} 