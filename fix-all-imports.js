import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all TypeScript files
function getTypeScriptFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getTypeScriptFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Step 1: Add .js extensions to relative imports
  const importRegex = /from\s+['"](\.[^'"]*)['"]/g;
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if the import already has an extension
    if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
      return match;
    }
    
    return `from '${importPath}.js'`;
  });
  
  // Step 2: Fix directory structure in imports
  
  // Fix imports for services/ai.js to services/ai/index.js
  content = content.replace(/from\s+['"](.*)\/ai\.js['"]/g, "from '$1/ai/index.js'");
  
  // Fix imports for services/multiagent.js to services/multiagent/index.js
  content = content.replace(/from\s+['"](.*)\/multiagent\.js['"]/g, "from '$1/multiagent/index.js'");
  
  // Fix imports for services/style.js to services/style/index.js
  content = content.replace(/from\s+['"](.*)\/style\.js['"]/g, "from '$1/style/index.js'");
  
  // Fix imports for services/replicate.js to services/replicate/index.js
  content = content.replace(/from\s+['"](.*)\/replicate\.js['"]/g, "from '$1/replicate/index.js'");
  
  // Fix imports for services/memory.js to services/memory/index.js
  content = content.replace(/from\s+['"](.*)\/memory\.js['"]/g, "from '$1/memory/index.js'");
  
  // Fix imports for services/evolution.js to services/evolution/index.js
  content = content.replace(/from\s+['"](.*)\/evolution\.js['"]/g, "from '$1/evolution/index.js'");
  
  // Fix imports for services/social.js to services/social/index.js
  content = content.replace(/from\s+['"](.*)\/social\.js['"]/g, "from '$1/social/index.js'");
  
  // Step 3: Fix specific import patterns
  
  // Fix imports for @elizaos/core
  content = content.replace(/from\s+['"]@elizaos\/core['"]/g, "from '@elizaos/core'");
  
  // Fix imports for ../../../types
  content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/types['"]/g, "from '../../../types/index.js'");
  
  // Fix imports for ../../../utils
  content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/utils['"]/g, "from '../../../utils/index.js'");
  
  // Fix imports for ../../types
  content = content.replace(/from\s+['"]\.\.\/\.\.\/types['"]/g, "from '../../types/index.js'");
  
  // Fix imports for ../../utils
  content = content.replace(/from\s+['"]\.\.\/\.\.\/utils['"]/g, "from '../../utils/index.js'");
  
  // Fix imports for ../types
  content = content.replace(/from\s+['"]\.\.\/types['"]/g, "from '../types/index.js'");
  
  // Fix imports for ../utils
  content = content.replace(/from\s+['"]\.\.\/utils['"]/g, "from '../utils/index.js'");
  
  // Fix imports for ./types
  content = content.replace(/from\s+['"]\.\/types['"]/g, "from './types/index.js'");
  
  // Fix imports for ./utils
  content = content.replace(/from\s+['"]\.\/utils['"]/g, "from './utils/index.js'");
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
}

// Main function
function main() {
  // Process main src directory
  const srcDir = path.join(__dirname, 'src');
  if (fs.existsSync(srcDir)) {
    const srcFiles = getTypeScriptFiles(srcDir);
    console.log(`Found ${srcFiles.length} TypeScript files to process in src directory`);
    srcFiles.forEach(filePath => {
      fixImportsInFile(filePath);
    });
  }
  
  // Process plugin-art-creator directory
  const pluginDir = path.join(__dirname, 'packages/plugin-art-creator/src');
  if (fs.existsSync(pluginDir)) {
    const pluginFiles = getTypeScriptFiles(pluginDir);
    console.log(`Found ${pluginFiles.length} TypeScript files to process in plugin directory`);
    pluginFiles.forEach(filePath => {
      fixImportsInFile(filePath);
    });
  }
  
  console.log('All imports have been fixed!');
}

main(); 