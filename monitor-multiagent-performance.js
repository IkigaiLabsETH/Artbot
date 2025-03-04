#!/usr/bin/env node

/**
 * Multi-Agent System Performance Monitor
 * 
 * This script monitors and records performance metrics for the multi-agent system
 * during art creation projects. It tracks CPU usage, memory consumption, message
 * throughput, and workflow progression timing.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const { MultiAgentSystem } = require('./src/services/multiagent/MultiAgentSystem');
const { AIService } = require('./src/services/ai/AIService');

// Performance metrics storage
const metrics = {
  startTime: null,
  endTime: null,
  cpuUsage: [],
  memoryUsage: [],
  messageCount: 0,
  stageTimings: {},
  agentActivations: {},
  errors: []
};

// Test project configuration
const testProject = {
  name: "Performance Test Project",
  theme: "Abstract Geometric Composition",
  style: "Minimalist with bold color blocks",
  elements: ["Circles", "Squares", "Triangles", "Lines"],
  colorPalette: ["#FF5733", "#33FF57", "#3357FF", "#F3FF33"],
  complexity: "Medium",
  size: "24x36 inches"
};

// Configuration
const config = {
  sampleInterval: 1000, // ms
  outputFile: path.join(__dirname, 'performance-results.json'),
  logFile: path.join(__dirname, 'performance-log.txt'),
  maxRunTime: 5 * 60 * 1000, // 5 minutes max runtime
};

// Initialize logger
const logger = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(config.logFile, logMessage + '\n');
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message} - ${error.message}`;
    console.error(logMessage);
    fs.appendFileSync(config.logFile, logMessage + '\n');
    metrics.errors.push({ timestamp, message, error: error.message });
  }
};

// Performance sampling function
function samplePerformance() {
  // CPU usage (percentage of available CPU)
  const cpuUsage = process.cpuUsage();
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
  
  // Memory usage
  const memUsage = process.memoryUsage();
  
  metrics.cpuUsage.push({
    timestamp: Date.now(),
    percent: cpuPercent
  });
  
  metrics.memoryUsage.push({
    timestamp: Date.now(),
    rss: memUsage.rss / 1024 / 1024, // MB
    heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
    heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
    external: memUsage.external / 1024 / 1024 // MB
  });
  
  logger.log(`Memory: ${memUsage.heapUsed / 1024 / 1024} MB | CPU: ${cpuPercent.toFixed(2)}%`);
}

// Message interceptor to count messages
function createMessageInterceptor(system) {
  const originalSendMessage = system.sendMessage.bind(system);
  
  system.sendMessage = (message) => {
    metrics.messageCount++;
    
    // Track agent activations
    if (!metrics.agentActivations[message.to]) {
      metrics.agentActivations[message.to] = 0;
    }
    metrics.agentActivations[message.to]++;
    
    // Track workflow stage changes
    if (message.type === 'STAGE_CHANGE') {
      metrics.stageTimings[message.content.stage] = {
        start: Date.now()
      };
      
      // Mark previous stage as complete
      if (message.content.previousStage && metrics.stageTimings[message.content.previousStage]) {
        metrics.stageTimings[message.content.previousStage].end = Date.now();
        metrics.stageTimings[message.content.previousStage].duration = 
          metrics.stageTimings[message.content.previousStage].end - 
          metrics.stageTimings[message.content.previousStage].start;
      }
      
      logger.log(`Workflow stage changed: ${message.content.previousStage || 'NONE'} -> ${message.content.stage}`);
    }
    
    return originalSendMessage(message);
  };
  
  return system;
}

// Run the performance test
async function runPerformanceTest() {
  logger.log('Starting multi-agent system performance test');
  logger.log(`System info: ${os.type()} ${os.release()} | ${os.cpus().length} CPUs | ${Math.round(os.totalmem() / 1024 / 1024)} MB RAM`);
  logger.log(`Test project: ${JSON.stringify(testProject, null, 2)}`);
  
  metrics.startTime = Date.now();
  
  // Start performance sampling
  const samplingInterval = setInterval(samplePerformance, config.sampleInterval);
  
  try {
    // Initialize AI service
    const aiService = new AIService();
    await aiService.initialize();
    
    // Create multi-agent system
    const system = new MultiAgentSystem(aiService);
    
    // Apply message interceptor
    createMessageInterceptor(system);
    
    // Start the project
    logger.log('Starting art creation project');
    await system.startProject(testProject);
    
    // Monitor until complete or timeout
    const monitorInterval = setInterval(async () => {
      const status = system.getStatus();
      logger.log(`System status: ${status.state} | Active agents: ${status.activeAgents.join(', ') || 'none'}`);
      
      // Check if complete
      if (status.state === 'COMPLETE') {
        clearInterval(monitorInterval);
        clearInterval(samplingInterval);
        
        metrics.endTime = Date.now();
        logger.log(`Project completed in ${(metrics.endTime - metrics.startTime) / 1000} seconds`);
        
        // Save final artwork
        logger.log(`Final artwork: ${JSON.stringify(status.result, null, 2)}`);
        
        // Save metrics
        saveResults();
      }
      
      // Check for timeout
      if (Date.now() - metrics.startTime > config.maxRunTime) {
        clearInterval(monitorInterval);
        clearInterval(samplingInterval);
        
        metrics.endTime = Date.now();
        logger.log(`Test timed out after ${config.maxRunTime / 1000} seconds`);
        
        // Save metrics
        saveResults();
      }
    }, 5000);
    
  } catch (error) {
    clearInterval(samplingInterval);
    logger.error('Performance test failed', error);
    metrics.endTime = Date.now();
    saveResults();
  }
}

// Save test results
function saveResults() {
  // Calculate summary metrics
  const duration = (metrics.endTime - metrics.startTime) / 1000; // seconds
  
  const avgMemory = metrics.memoryUsage.reduce((sum, sample) => sum + sample.heapUsed, 0) / 
                   (metrics.memoryUsage.length || 1);
                   
  const peakMemory = metrics.memoryUsage.reduce((max, sample) => 
                    Math.max(max, sample.heapUsed), 0);
                    
  const avgCpu = metrics.cpuUsage.reduce((sum, sample) => sum + sample.percent, 0) / 
                (metrics.cpuUsage.length || 1);
  
  const summary = {
    duration,
    messageCount: metrics.messageCount,
    messagesPerSecond: metrics.messageCount / duration,
    avgMemoryUsageMB: avgMemory,
    peakMemoryUsageMB: peakMemory,
    avgCpuPercent: avgCpu,
    stageTimings: metrics.stageTimings,
    agentActivations: metrics.agentActivations,
    errorCount: metrics.errors.length
  };
  
  // Combine all metrics
  const results = {
    summary,
    testProject,
    systemInfo: {
      platform: os.type(),
      release: os.release(),
      cpus: os.cpus().length,
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024)
    },
    rawMetrics: {
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
      errors: metrics.errors
    }
  };
  
  // Save to file
  fs.writeFileSync(config.outputFile, JSON.stringify(results, null, 2));
  logger.log(`Performance results saved to ${config.outputFile}`);
  
  // Log summary
  logger.log('Performance Test Summary:');
  logger.log(`Duration: ${duration.toFixed(2)} seconds`);
  logger.log(`Messages: ${metrics.messageCount} (${(metrics.messageCount / duration).toFixed(2)}/sec)`);
  logger.log(`Avg Memory: ${avgMemory.toFixed(2)} MB`);
  logger.log(`Peak Memory: ${peakMemory.toFixed(2)} MB`);
  logger.log(`Avg CPU: ${avgCpu.toFixed(2)}%`);
  logger.log(`Errors: ${metrics.errors.length}`);
  
  // Exit process
  process.exit(0);
}

// Handle errors and cleanup
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  metrics.endTime = Date.now();
  saveResults();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { message: reason.toString() });
  metrics.endTime = Date.now();
  saveResults();
});

// Start the test
runPerformanceTest(); 