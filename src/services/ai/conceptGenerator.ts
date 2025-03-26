import { AIService } from './index.js';
import { ArtDirection } from '../../types/ArtDirection.js';
import { StyleManager } from '../../styles/styleManager.js';

/**
 * Available concept categories for more targeted concept generation
 */
export enum ConceptCategory {
  // Contemporary Digital Artists
  BEEPLE = 'beeple',               // Dystopian tech maximalism
  XCOPY = 'xcopy',                 // Glitch art and crypto aesthetics
  CHERNIAK = 'cherniak',           // Algorithmic and geometric precision
  
  // Surrealists and Modern Masters
  Margritte = 'Margritte',           // Philosophical surrealism
  PICASSO = 'picasso',             // Cubist innovation
  WARHOL = 'warhol',               // Pop art icon
  VANGOGH = 'vangogh',             // Post-impressionist master
  HOPPER = 'hopper',               // American realism
  
  // Abstract Pioneers
  MONDRIAN = 'mondrian',           // Neo-plasticism
  ROTHKO = 'rothko',               // Color field abstraction
  KANDINSKY = 'kandinsky',         // Abstract expressionism
  MALEVICH = 'malevich',           // Suprematism
  POPOVA = 'popova',               // Constructivism
  
  // Photography Masters
  CARTIERBRESSON = 'cartierbresson', // Decisive moment
  ARBUS = 'arbus',                   // Intimate portraits
  AVEDON = 'avedon',                 // Fashion and portraiture
  EGGLESTON = 'eggleston',           // Color photography pioneer
  LEIBOVITZ = 'leibovitz',           // Contemporary portraiture
  BOURDIN = 'bourdin',               // Fashion surrealism
  
  // Contemporary Photographers
  COOPERGORFER = 'coopergorfer',     // Contemporary still life
  VONWONG = 'vonwong'                // Epic conceptual photography
}

/**
 * Generate a random cinematic concept using the AI service
 */
export async function generateEnhancedConcept(
  aiService: AIService,
  style: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    contextualFocus?: 'historical' | 'cultural' | 'technical' | 'philosophical' | 'evolutionary' | 'all';
  } = {}
): Promise<string> {
  const styleManager = new StyleManager();
  const artDirection = styleManager.getStyle(style as any);
  
  // Build contextual prompt based on the selected focus
  let contextualPrompt = '';
  const focus = options.contextualFocus || 'all';
  
  if (focus === 'historical' || focus === 'all') {
    const historical = artDirection.historicalContext;
    if (historical) {
      contextualPrompt += `
Historical Context:
- Period: ${historical.period}
- Movement: ${historical.movement}
- Key Influences: ${historical.influences.join(', ')}
- Notable Works: ${historical.keyWorks.join(', ')}
- Innovations: ${historical.innovations.join(', ')}`;
    }
  }

  if (focus === 'cultural' || focus === 'all') {
    const cultural = artDirection.culturalContext;
    if (cultural) {
      contextualPrompt += `
Cultural Context:
- Social Influences: ${cultural.socialInfluences.join(', ')}
- Contemporary Events: ${cultural.contemporaryEvents.join(', ')}
- Cultural Movements: ${cultural.culturalMovements.join(', ')}
- Geographic Context: ${cultural.geographicalContext}
- Societal Impact: ${cultural.societalImpact.join(', ')}`;
    }
  }

  if (focus === 'technical' || focus === 'all') {
    const technical = artDirection.technicalContext;
    if (technical) {
      contextualPrompt += `
Technical Context:
- Materials: ${technical.materials.join(', ')}
- Techniques: ${technical.techniques.join(', ')}
- Working Methods: ${technical.workingMethods.join(', ')}
- Innovations: ${technical.innovations.join(', ')}
- Tools Used: ${technical.toolsUsed.join(', ')}`;
    }
  }

  if (focus === 'philosophical' || focus === 'all') {
    const philosophical = artDirection.philosophicalContext;
    if (philosophical) {
      contextualPrompt += `
Philosophical Context:
- Core Beliefs: ${philosophical.beliefs.join(', ')}
- Theories: ${philosophical.theories.join(', ')}
- Conceptual Frameworks: ${philosophical.conceptualFrameworks.join(', ')}
- Intellectual Influences: ${philosophical.intellectualInfluences.join(', ')}`;
    }
  }

  if (focus === 'evolutionary' || focus === 'all') {
    const evolutionary = artDirection.evolutionaryContext;
    if (evolutionary) {
      contextualPrompt += `
Evolutionary Context:
Early Period:
- Characteristics: ${evolutionary.earlyPeriod.characteristics.join(', ')}
- Key Works: ${evolutionary.earlyPeriod.keyWorks.join(', ')}

Mature Period:
- Characteristics: ${evolutionary.maturePeriod.characteristics.join(', ')}
- Masterworks: ${evolutionary.maturePeriod.masterWorks.join(', ')}

Late Period:
- Characteristics: ${evolutionary.latePeriod.characteristics.join(', ')}
- Final Works: ${evolutionary.latePeriod.finalWorks.join(', ')}`;
    }
  }

  // Generate concept using the contextual information
  const response = await aiService.getCompletion({
    model: 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are an expert art director specializing in ${style}'s artistic style. 
Using the provided contextual information, generate a rich, detailed concept for an artwork that deeply embodies the artist's style, techniques, and philosophical approach.

${contextualPrompt}

Consider:
1. The artist's technical methods and materials
2. Their philosophical and conceptual frameworks
3. The historical and cultural context of their work
4. Their artistic evolution and development
5. The core elements that define their style

Generate a concept that:
1. Is true to the artist's core aesthetic principles
2. Incorporates their signature techniques and approaches
3. Reflects their philosophical and conceptual interests
4. Shows understanding of their historical context
5. Could believably fit within their body of work`
      },
      {
        role: 'user',
        content: 'Generate a detailed artistic concept that embodies this style.'
      }
    ],
    temperature: options.temperature || 0.8,
    maxTokens: options.maxTokens || 500
  });

  return response.content;
}

/**
 * Generate multiple concepts at once
 */
export async function generateMultipleConcepts(
  aiService: AIService,
  count: number = 3,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    category?: ConceptCategory;
  } = {}
): Promise<string[]> {
  const category = options.category || ConceptCategory.CHERNIAK;
  
  // Define category-specific prompts (reusing the same as above)
  const categoryPrompts = {
    [ConceptCategory.BEEPLE]: `You are Beeple (Mike Winkelmann), creating dystopian tech maximalism.`,
    [ConceptCategory.XCOPY]: `You are XCOPY, creating glitch art and crypto aesthetics.`,
    [ConceptCategory.CHERNIAK]: `You are Dmitri Cherniak, creating algorithmic precision art.`,
    [ConceptCategory.Margritte]: `You are Studio Margritte, creating philosophical surrealism.`,
    [ConceptCategory.PICASSO]: `You are Pablo Picasso, creating cubist innovations.`,
    [ConceptCategory.WARHOL]: `You are Andy Warhol, creating pop art icons.`,
    [ConceptCategory.VANGOGH]: `You are Vincent van Gogh, creating post-impressionist masterpieces.`,
    [ConceptCategory.HOPPER]: `You are Edward Hopper, creating American realism.`,
    [ConceptCategory.MONDRIAN]: `You are Piet Mondrian, creating neo-plastic compositions.`,
    [ConceptCategory.ROTHKO]: `You are Mark Rothko, creating color field abstractions.`,
    [ConceptCategory.KANDINSKY]: `You are Wassily Kandinsky, creating abstract expressionism.`,
    [ConceptCategory.MALEVICH]: `You are Kazimir Malevich, creating suprematist art.`,
    [ConceptCategory.POPOVA]: `You are Lyubov Popova, creating constructivist designs.`,
    [ConceptCategory.CARTIERBRESSON]: `You are Henri Cartier-Bresson, capturing decisive moments.`,
    [ConceptCategory.ARBUS]: `You are Diane Arbus, creating intimate portraits.`,
    [ConceptCategory.AVEDON]: `You are Richard Avedon, creating fashion and portraiture.`,
    [ConceptCategory.EGGLESTON]: `You are William Eggleston, pioneering color photography.`,
    [ConceptCategory.LEIBOVITZ]: `You are Annie Leibovitz, creating contemporary portraits.`,
    [ConceptCategory.BOURDIN]: `You are Guy Bourdin, creating fashion surrealism.`,
    [ConceptCategory.COOPERGORFER]: `You are Cooper & Gorfer, creating contemporary still life.`,
    [ConceptCategory.VONWONG]: `You are Benjamin Von Wong, creating epic conceptual photography.`
  };
  
  const categoryDescription = categoryPrompts[category] || categoryPrompts[ConceptCategory.CHERNIAK];
  
  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `${categoryDescription}
        
Your concepts should be visually striking, emotionally resonant, and suitable for artistic interpretation.

Generate ${count} distinct concepts that:
1. Have strong visual imagery
2. Suggest a mood or atmosphere
3. Imply a story or narrative
4. Can be interpreted in multiple ways
5. Would work well with cinematic lighting and composition

Provide ONLY the concepts as a numbered list. Each concept should be a short phrase (3-7 words). No explanations or additional text.`
      },
      {
        role: 'user',
        content: `Generate ${count} evocative ${category} concepts. Provide only the concepts themselves as a numbered list, with each concept being a short phrase (3-7 words).`
      }
    ],
    temperature: options.temperature || 0.9,
    maxTokens: options.maxTokens || 200
  });
  
  // Parse the response to extract the concepts
  const conceptsText = promptResponse.content.trim();
  const conceptLines = conceptsText.split('\n');
  
  // Extract concepts from numbered list format
  const concepts = conceptLines
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim()) // Remove numbering
    .filter(line => line.length > 0); // Remove empty lines
  
  return concepts.slice(0, count); // Ensure we only return the requested number of concepts
}

/**
 * Generate a cinematic concept using the AI service
 */
export async function generateCinematicConcept(
  aiService: AIService,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const contextualPrompts = {
    historical: "Consider Margritte's influence on surrealism and his role in challenging perception",
    cultural: "Explore the tension between reality and representation in contemporary society",
    technical: "Focus on Margritte's precise photorealistic technique and use of everyday objects",
    philosophical: "Examine the relationship between objects, words, and their meanings",
    evolutionary: "Consider how Margritte's ideas about perception continue to resonate today",
    personal: "Reflect on moments of cognitive dissonance and philosophical paradox",
    emotional: "Explore the uncanny feeling when familiar objects become strange",
    metaphysical: "Investigate the nature of reality, representation, and consciousness",
    symbolic: "Consider the power of juxtaposition and displacement in creating meaning",
    narrative: "Create a story that challenges our assumptions about reality"
  };

  const focuses = [
    'philosophical',
    'metaphysical',
    'symbolic',
    'technical',
    'cultural'
  ];

  const selectedFocuses = focuses
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const contextPrompt = selectedFocuses
    .map(focus => contextualPrompts[focus])
    .join('. ');

  const response = await aiService.getCompletion({
    model: 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are Studio Margritte's creative consciousness, generating surreal concepts that challenge perception and reality.
        
        Your concepts should incorporate:
        - Philosophical paradoxes
        - Visual poetry
        - Everyday objects in unexpected contexts
        - Clean, precise imagery
        - Metaphysical questions
        
        Context to consider:
        ${contextPrompt}`
      },
      {
        role: 'user',
        content: 'Generate a surreal concept in the style of Margritte that challenges our perception of reality.'
      }
    ],
    temperature: options.temperature || 0.9,
    maxTokens: options.maxTokens || 1000
  });

  return response.content || '';
} 