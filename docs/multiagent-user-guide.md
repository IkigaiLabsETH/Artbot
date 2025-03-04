# Multi-Agent System User Guide

This guide provides step-by-step instructions for using the multi-agent system for collaborative art creation.

## Prerequisites

Before using the multi-agent system, ensure you have:

1. Node.js v23 or later installed
2. API keys for OpenAI and Anthropic (optional: Replicate for image generation)
3. The ArtBot project installed and configured

## Quick Start

### 1. Run the Demo

The easiest way to see the multi-agent system in action is to run the included demo:

```bash
# Using npm script
npm run demo:multiagent

# Using shell script
./run-multiagent-demo.sh
```

This will run a complete art creation process with all agents collaborating on a sample project.

### 2. Basic Integration

To integrate the multi-agent system into your own application:

```typescript
import { createMultiAgentSystem, createProjectMessage } from './services/multiagent/agents';
import { AIService } from './services/ai';
import { AgentMessage } from './services/multiagent';

// Initialize AI service
const aiService = new AIService({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

await aiService.initialize();

// Create multi-agent system
const system = createMultiAgentSystem({ aiService });
await system.initialize();

// Create and start a project
const projectMessage = createProjectMessage(
  'Project Title',
  'Project Description',
  ['Requirement 1', 'Requirement 2']
) as AgentMessage;

await system.sendMessage(projectMessage);
```

## Creating Art Projects

### Project Configuration

When creating a new art project, you can specify:

1. **Title**: A concise name for the artwork
2. **Description**: A detailed description of the concept
3. **Requirements**: Specific elements or constraints for the artwork

Example:

```typescript
const projectMessage = createProjectMessage(
  'Ocean Depths',
  'An exploration of deep sea environments and the mysterious creatures that inhabit them',
  [
    'Include bioluminescent elements',
    'Create a sense of depth and mystery',
    'Use a cool color palette with occasional warm accents',
    'Balance realistic and fantastical elements'
  ]
) as AgentMessage;
```

### Project Monitoring

To monitor the progress of your project:

```typescript
// Get the current system state
const states = system.getSystemState();

// Find the director agent state
const directorState = Object.values(states).find(state => 
  state.role === 'director'
)?.context;

// Check current project stage
console.log(`Current stage: ${directorState.projectStage}`);

// Check completed tasks
directorState.completedTasks.forEach(task => {
  console.log(`Task ${task.type} completed by ${task.assignedTo}`);
  console.log(`Result:`, task.result);
});
```

### Handling Project Completion

To be notified when a project is complete:

```typescript
// Option 1: Polling
const checkCompletion = setInterval(() => {
  const states = system.getSystemState();
  const directorState = Object.values(states).find(state => 
    state.role === 'director'
  )?.context;
  
  if (directorState.projectStage === 'completed') {
    console.log('Project completed!');
    console.log('Final result:', directorState.currentProject);
    clearInterval(checkCompletion);
  }
}, 1000);

// Option 2: Event-based (if supported)
system.on('projectCompleted', (project) => {
  console.log('Project completed!');
  console.log('Final result:', project);
});
```

## Advanced Usage

### Customizing Agent Behavior

You can customize agent behavior by providing configuration options:

```typescript
const system = createMultiAgentSystem({ 
  aiService,
  config: {
    ideator: {
      diversityFactor: 0.8,  // 0-1, higher means more diverse ideas
      explorationDepth: 3,   // 1-5, higher means more detailed exploration
      maxIdeas: 5            // Maximum number of ideas to generate
    },
    stylist: {
      referenceLibrary: ['impressionism', 'surrealism', 'digital art'],
      colorPaletteSize: 6,   // Number of colors in generated palettes
      detailLevel: 'high'    // 'low', 'medium', 'high'
    },
    refiner: {
      iterationCount: 2,     // Number of refinement iterations
      refinementStrength: 0.7, // 0-1, higher means more aggressive refinement
      focusAreas: ['composition', 'color', 'detail']
    },
    critic: {
      criteriaWeights: {
        aesthetics: 0.3,
        originality: 0.2,
        coherence: 0.2,
        technique: 0.2,
        impact: 0.1
      },
      detailedFeedback: true, // Whether to provide detailed feedback
      recommendationCount: 3  // Number of recommendations to provide
    }
  }
});
```

### Integrating with Image Generation

To integrate the multi-agent system with image generation:

```typescript
import { ReplicateService } from './services/replicate';

// Initialize Replicate service
const replicateService = new ReplicateService({
  apiKey: process.env.REPLICATE_API_KEY
});

// Create a custom handler for artwork completion
system.on('taskCompleted', async (task) => {
  if (task.type === 'refinement') {
    const artwork = task.result;
    
    // Generate image from artwork description
    const prompt = `${artwork.description}. ${artwork.visualElements.join(', ')}. 
                    Style: ${artwork.texture.type}, ${artwork.colorUsage.palette.join(', ')}.`;
    
    const imageUrl = await replicateService.generateImage({
      prompt,
      width: 1024,
      height: 1024,
      num_outputs: 1
    });
    
    console.log('Generated image:', imageUrl);
  }
});
```

### Saving and Loading Projects

To save and load projects:

```typescript
// Save project state
const saveProject = () => {
  const states = system.getSystemState();
  const directorState = Object.values(states).find(state => 
    state.role === 'director'
  )?.context;
  
  const projectData = {
    project: directorState.currentProject,
    stage: directorState.projectStage,
    completedTasks: directorState.completedTasks
  };
  
  fs.writeFileSync(
    `./projects/${directorState.currentProject.id}.json`,
    JSON.stringify(projectData, null, 2)
  );
};

// Load project state
const loadProject = (projectId) => {
  const projectData = JSON.parse(
    fs.readFileSync(`./projects/${projectId}.json`, 'utf8')
  );
  
  // Create a new system
  const system = createMultiAgentSystem({ aiService });
  
  // Initialize with saved state
  system.initialize({
    initialState: {
      director: {
        context: {
          currentProject: projectData.project,
          projectStage: projectData.stage,
          completedTasks: projectData.completedTasks,
          pendingTasks: []
        }
      }
    }
  });
  
  return system;
};
```

## Troubleshooting

### Common Issues

1. **System appears stuck**: 
   - Check individual agent states with `system.getSystemState()`
   - Ensure all required API keys are valid
   - Check for errors in the console

2. **Poor quality results**:
   - Try adjusting agent configuration parameters
   - Provide more detailed project requirements
   - Ensure API keys have access to the most capable models

3. **System crashes**:
   - Check for API rate limiting
   - Ensure sufficient memory is available
   - Check for network connectivity issues

### Debugging

For detailed debugging:

```typescript
// Enable verbose logging
system.setLogLevel('debug');

// Trace message flow
system.enableMessageTracing();

// Get agent logs
const directorLogs = system.getAgentLogs('director');
console.log(directorLogs);
```

## Best Practices

1. **Project Requirements**:
   - Be specific but not overly constraining
   - Include both content and style requirements
   - Specify emotional impact or audience reaction

2. **System Configuration**:
   - Start with default configuration
   - Adjust parameters gradually based on results
   - Save successful configurations for reuse

3. **Resource Management**:
   - Monitor API usage to avoid unexpected costs
   - Use lower-tier models for development/testing
   - Implement caching for repeated operations

4. **Error Handling**:
   - Implement proper error handling in your application
   - Save project state periodically
   - Provide fallback options for critical operations

## Examples

### Abstract Art Project

```typescript
const abstractProject = createProjectMessage(
  'Geometric Harmony',
  'An abstract composition exploring the relationship between geometric forms and organic movement',
  [
    'Use primary geometric shapes (circles, squares, triangles)',
    'Create dynamic composition with implied movement',
    'Use a limited color palette (3-5 colors)',
    'Balance between order and chaos'
  ]
) as AgentMessage;
```

### Landscape Project

```typescript
const landscapeProject = createProjectMessage(
  'Mountain Twilight',
  'A serene mountain landscape at twilight, capturing the transition between day and night',
  [
    'Include mountain range as focal point',
    'Depict twilight lighting conditions',
    'Create depth with foreground, middle ground, and background',
    'Evoke a sense of peace and contemplation',
    'Include subtle wildlife elements'
  ]
) as AgentMessage;
```

### Character Design Project

```typescript
const characterProject = createProjectMessage(
  'Cosmic Guardian',
  'A character design for a guardian entity that protects the balance of cosmic forces',
  [
    'Humanoid but with otherworldly features',
    'Incorporate celestial and cosmic elements',
    'Design should convey both power and wisdom',
    'Include distinctive armor or clothing',
    'Character should have a unique silhouette',
    'Include a signature weapon or tool'
  ]
) as AgentMessage;
```

## Conclusion

The multi-agent system provides a powerful framework for collaborative art creation. By following this guide, you can harness the specialized capabilities of each agent to create sophisticated artwork that would be difficult to achieve with a single-agent approach.

For more detailed information, refer to the [technical documentation](./multiagent-system.md) and [API reference](./multiagent-api-reference.md). 