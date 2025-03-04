#!/usr/bin/env node

/**
 * Multi-Agent System Test Script
 * 
 * This script tests the core functionality of the multi-agent system
 * by creating a simple art project and monitoring the collaboration
 * between specialized agents.
 */

const dotenv = require('dotenv');
const { AIService } = require('./dist/services/ai');
const { createMultiAgentSystem, createProjectMessage } = require('./dist/services/multiagent/agents');
const { AgentMessage } = require('./dist/services/multiagent');

// Load environment variables
dotenv.config();

// Test project configurations
const TEST_PROJECTS = [
  {
    title: 'Neon Cityscape',
    description: 'A futuristic cityscape with neon lights and cyberpunk aesthetics',
    requirements: [
      'Include tall skyscrapers with neon signs',
      'Create a rainy night atmosphere',
      'Use a color palette dominated by blues, purples, and bright neon accents',
      'Include some flying vehicles or drones',
      'Evoke a sense of technological wonder mixed with urban grit'
    ]
  },
  {
    title: 'Tranquil Forest',
    description: 'A peaceful forest scene with dappled sunlight filtering through the trees',
    requirements: [
      'Create a sense of depth with foreground, middle ground, and background elements',
      'Include a small stream or pond',
      'Use a natural color palette with greens, browns, and soft golden light',
      'Add subtle wildlife elements like birds or deer',
      'Evoke a feeling of peace and harmony with nature'
    ]
  }
];

// Test configuration
const TEST_CONFIG = {
  projectIndex: 0, // Which test project to use
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  timeoutMinutes: 10, // Maximum test runtime in minutes
  checkIntervalMs: 1000, // How often to check system state
};

// Utility for formatted logging
const logger = {
  debug: (msg) => TEST_CONFIG.logLevel === 'debug' && console.log(`[DEBUG] ${msg}`),
  info: (msg) => ['debug', 'info'].includes(TEST_CONFIG.logLevel) && console.log(`[INFO] ${msg}`),
  warn: (msg) => ['debug', 'info', 'warn'].includes(TEST_CONFIG.logLevel) && console.log(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  section: (title) => console.log(`\n${'='.repeat(80)}\n${title}\n${'='.repeat(80)}`)
};

// Run the test
async function runTest() {
  logger.section('MULTI-AGENT SYSTEM TEST');
  
  // Check API keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  
  logger.info(`OpenAI API Key: ${hasOpenAI ? '✅ Set' : '❌ Not set'}`);
  logger.info(`Anthropic API Key: ${hasAnthropic ? '✅ Set' : '❌ Not set'}`);
  
  if (!hasOpenAI && !hasAnthropic) {
    logger.error('No API keys found. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file.');
    process.exit(1);
  }
  
  // Initialize AI service
  logger.info('Initializing AI service...');
  const aiService = new AIService({
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY
  });
  
  await aiService.initialize();
  logger.info('AI service initialized successfully.');
  
  // Create multi-agent system
  logger.info('Creating multi-agent system...');
  const system = createMultiAgentSystem({ 
    aiService,
    config: {
      ideator: {
        diversityFactor: 0.8,
        maxIdeas: 3
      },
      stylist: {
        colorPaletteSize: 5,
        detailLevel: 'high'
      },
      refiner: {
        iterationCount: 1,
        refinementStrength: 0.7
      },
      critic: {
        detailedFeedback: true,
        recommendationCount: 3
      }
    }
  });
  
  // Initialize the system
  logger.info('Initializing agents...');
  await system.initialize();
  logger.info('All agents initialized successfully.');
  
  // Select test project
  const project = TEST_PROJECTS[TEST_CONFIG.projectIndex];
  logger.section(`STARTING PROJECT: ${project.title}`);
  logger.info(`Description: ${project.description}`);
  logger.info('Requirements:');
  project.requirements.forEach(req => logger.info(`- ${req}`));
  
  // Create project message
  const projectMessage = createProjectMessage(
    project.title,
    project.description,
    project.requirements
  );
  
  // Start the creative process
  logger.section('STARTING CREATIVE PROCESS');
  logger.info('Sending initial project message...');
  await system.sendMessage(projectMessage);
  
  // Set up timeout
  const timeout = setTimeout(() => {
    logger.error(`Test timed out after ${TEST_CONFIG.timeoutMinutes} minutes.`);
    process.exit(1);
  }, TEST_CONFIG.timeoutMinutes * 60 * 1000);
  
  // Monitor the system state until the project is complete
  let isComplete = false;
  let currentStage = '';
  let lastLogTime = Date.now();
  
  while (!isComplete) {
    // Get the current system state
    const states = system.getSystemState();
    
    // Find the director agent
    const directorState = Object.values(states).find(state => state.role === 'director')?.context;
    
    if (directorState) {
      // Log agent states periodically
      if (Date.now() - lastLogTime > 10000) { // Every 10 seconds
        logger.info('\nCurrent Agent States:');
        Object.values(states).forEach(state => {
          logger.info(`- ${state.role}: ${state.status}`);
        });
        lastLogTime = Date.now();
      }
      
      // Check for stage changes
      if (directorState.projectStage !== currentStage) {
        currentStage = directorState.projectStage;
        logger.section(`STAGE CHANGE: ${currentStage.toUpperCase()}`);
        
        // Log completed tasks
        if (directorState.completedTasks && directorState.completedTasks.length > 0) {
          const latestTask = directorState.completedTasks[directorState.completedTasks.length - 1];
          logger.info(`Completed task: ${latestTask.type} by ${latestTask.assignedTo}`);
          
          // Log task results based on type
          switch (latestTask.type) {
            case 'ideation':
              logger.info(`Generated ${latestTask.result.length} ideas`);
              latestTask.result.forEach((idea, i) => {
                logger.info(`\nIdea ${i+1}: ${idea.title}`);
                logger.info(`Description: ${idea.description.substring(0, 100)}...`);
              });
              break;
              
            case 'styling':
              logger.info(`Developed ${latestTask.result.length} styles`);
              latestTask.result.forEach((style, i) => {
                logger.info(`\nStyle ${i+1}: ${style.name}`);
                logger.info(`Description: ${style.description.substring(0, 100)}...`);
              });
              break;
              
            case 'refinement':
              const artwork = latestTask.result;
              logger.info(`\nRefined Artwork: ${artwork.title}`);
              logger.info(`Description: ${artwork.description.substring(0, 100)}...`);
              break;
              
            case 'critique':
              const critique = latestTask.result;
              logger.info(`\nArtwork Critique:`);
              logger.info(`Overall Score: ${critique.overallScore}/10`);
              logger.info(`Strengths: ${critique.strengths.length} points`);
              logger.info(`Areas for Improvement: ${critique.areasForImprovement.length} points`);
              break;
          }
        }
        
        // Check if project is complete
        if (currentStage === 'completed') {
          isComplete = true;
          logger.section('PROJECT COMPLETED');
          
          // Log final project details
          const finalProject = directorState.currentProject;
          logger.info(`Title: ${finalProject.title}`);
          logger.info(`Description: ${finalProject.description}`);
          logger.info(`Status: ${finalProject.status}`);
          logger.info(`Created: ${new Date(finalProject.createdAt).toLocaleString()}`);
          if (finalProject.completedAt) {
            logger.info(`Completed: ${new Date(finalProject.completedAt).toLocaleString()}`);
          }
          
          // Calculate total time
          const totalTimeMs = finalProject.completedAt - finalProject.createdAt;
          const totalTimeMin = Math.floor(totalTimeMs / 60000);
          const totalTimeSec = Math.floor((totalTimeMs % 60000) / 1000);
          logger.info(`Total time: ${totalTimeMin}m ${totalTimeSec}s`);
        }
      }
    }
    
    // Wait before checking again
    if (!isComplete) {
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.checkIntervalMs));
    }
  }
  
  // Clear timeout
  clearTimeout(timeout);
  
  // Test completed successfully
  logger.section('TEST COMPLETED SUCCESSFULLY');
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:');
  logger.error(error);
  process.exit(1);
});

// Run the test
runTest().catch(error => {
  logger.error('Error running test:');
  logger.error(error);
  process.exit(1);
}); 