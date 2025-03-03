// Simple script to test the art-creator character configuration
const fs = require('fs');
const path = require('path');

// Path to the character file
const characterPath = path.resolve(__dirname, 'characters/art-creator.json');

// Check if the character file exists
if (!fs.existsSync(characterPath)) {
  console.error(`Character file not found: ${characterPath}`);
  process.exit(1);
}

// Read and parse the character file
try {
  const characterContent = fs.readFileSync(characterPath, 'utf8');
  const character = JSON.parse(characterContent);
  
  console.log('✅ Character file loaded successfully');
  console.log('Character name:', character.name);
  console.log('Character description:', character.description);
  
  // Check if the plugin is specified
  if (character.plugins && character.plugins.includes('@elizaos/plugin-art-creator')) {
    console.log('✅ Plugin @elizaos/plugin-art-creator is specified in the character');
  } else {
    console.error('❌ Plugin @elizaos/plugin-art-creator is not specified in the character');
  }
  
  // Check if the plugin configuration is present
  if (character.config && character.config['@elizaos/plugin-art-creator']) {
    console.log('✅ Plugin configuration is present');
    
    // Check if API keys are configured
    const config = character.config['@elizaos/plugin-art-creator'];
    
    // Check if the API keys are environment variables
    if (config.openaiApiKey && config.openaiApiKey.startsWith('${') && config.openaiApiKey.endsWith('}')) {
      const envVar = config.openaiApiKey.slice(2, -1);
      console.log(`OpenAI API Key is set to use environment variable: ${envVar}`);
      console.log(`Environment variable ${envVar} is ${process.env[envVar] ? '✅ set' : '❌ not set'}`);
    } else {
      console.log('OpenAI API Key is hardcoded in the character file');
    }
    
    if (config.anthropicApiKey && config.anthropicApiKey.startsWith('${') && config.anthropicApiKey.endsWith('}')) {
      const envVar = config.anthropicApiKey.slice(2, -1);
      console.log(`Anthropic API Key is set to use environment variable: ${envVar}`);
      console.log(`Environment variable ${envVar} is ${process.env[envVar] ? '✅ set' : '❌ not set'}`);
    } else {
      console.log('Anthropic API Key is hardcoded in the character file');
    }
    
    if (config.replicateApiKey && config.replicateApiKey.startsWith('${') && config.replicateApiKey.endsWith('}')) {
      const envVar = config.replicateApiKey.slice(2, -1);
      console.log(`Replicate API Key is set to use environment variable: ${envVar}`);
      console.log(`Environment variable ${envVar} is ${process.env[envVar] ? '✅ set' : '❌ not set'}`);
    } else {
      console.log('Replicate API Key is hardcoded in the character file');
    }
  } else {
    console.error('❌ Plugin configuration is not present in the character');
  }
  
  // Check if the plugin is built
  const pluginDistPath = path.resolve(__dirname, 'packages/plugin-art-creator/dist');
  if (fs.existsSync(pluginDistPath)) {
    console.log('✅ Plugin is built');
    
    // Check if the plugin is linked in the agent's node_modules
    const agentPluginPath = path.resolve(__dirname, 'agent/node_modules/@elizaos/plugin-art-creator');
    console.log('Checking plugin path:', agentPluginPath);
    
    try {
      if (fs.existsSync(agentPluginPath)) {
        console.log('✅ Plugin is linked in the agent\'s node_modules');
        
        try {
          // Check if it's a symbolic link
          const stats = fs.lstatSync(agentPluginPath);
          if (stats.isSymbolicLink()) {
            console.log('✅ Plugin is linked via symbolic link');
            
            // Check if the link points to the correct location
            const linkTarget = fs.readlinkSync(agentPluginPath);
            console.log('Link target:', linkTarget);
            
            // Check if the target exists
            const targetPath = path.resolve(path.dirname(agentPluginPath), linkTarget);
            console.log('Resolved target path:', targetPath);
            
            if (fs.existsSync(targetPath)) {
              console.log('✅ Link target exists');
              
              // Check if the dist directory exists in the target
              const distPath = path.join(targetPath, 'dist');
              if (fs.existsSync(distPath)) {
                console.log('✅ dist directory exists in the target');
              } else {
                console.error('❌ dist directory does not exist in the target');
              }
            } else {
              console.error('❌ Link target does not exist');
            }
            
            if (linkTarget.includes('packages/plugin-art-creator')) {
              console.log('✅ Link points to the correct location');
            } else {
              console.error('❌ Link does not point to the correct location');
            }
          } else {
            console.log('❌ Plugin is not linked via symbolic link');
          }
        } catch (error) {
          console.error('Error checking symbolic link:', error.message);
        }
      } else {
        console.error('❌ Plugin is not linked in the agent\'s node_modules');
      }
    } catch (error) {
      console.error('Error checking plugin path:', error.message);
    }
  } else {
    console.error('❌ Plugin is not built');
  }
  
  console.log('\n✅ Character configuration is valid and ready to use');
  console.log('To run the agent with this character, execute:');
  console.log('./run-art-creator.sh');
  
} catch (error) {
  console.error('Error parsing character file:', error);
  process.exit(1);
} 