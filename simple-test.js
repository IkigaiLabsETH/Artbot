// Simple test script for the art-creator plugin
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

console.log('Simple test for ArtBot plugin');
console.log('Environment variables:');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not Set');
console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not Set');
console.log('- REPLICATE_API_KEY:', process.env.REPLICATE_API_KEY ? 'Set' : 'Not Set');

// Check if the plugin directory exists
import fs from 'fs';
const pluginDir = path.resolve(__dirname, 'packages/plugin-art-creator');
console.log('Plugin directory:', pluginDir);
console.log('Plugin directory exists:', fs.existsSync(pluginDir) ? 'Yes' : 'No');

// Check if the plugin is built
const distDir = path.resolve(pluginDir, 'dist');
console.log('Dist directory:', distDir);
console.log('Dist directory exists:', fs.existsSync(distDir) ? 'Yes' : 'No');

// Check if the plugin is linked in the agent's node_modules
const agentPluginPath = path.resolve(__dirname, 'agent/node_modules/@elizaos/plugin-art-creator');
console.log('Agent plugin path:', agentPluginPath);
console.log('Agent plugin path exists:', fs.existsSync(agentPluginPath) ? 'Yes' : 'No');

// Check if the plugin is linked via symbolic link
try {
  const stats = fs.lstatSync(agentPluginPath);
  console.log('Is symbolic link:', stats.isSymbolicLink() ? 'Yes' : 'No');
  
  if (stats.isSymbolicLink()) {
    const linkTarget = fs.readlinkSync(agentPluginPath);
    console.log('Link target:', linkTarget);
    
    // Check if the target exists
    const targetPath = path.resolve(path.dirname(agentPluginPath), linkTarget);
    console.log('Resolved target path:', targetPath);
    console.log('Target exists:', fs.existsSync(targetPath) ? 'Yes' : 'No');
  }
} catch (error) {
  console.error('Error checking symbolic link:', error.message);
}

console.log('\nTest completed successfully'); 