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
  
  // Fix imports for types.js to types/index.js
  content = content.replace(/from\s+['"](.*)\/types\.js['"]/g, "from '$1/types/index.js'");
  
  // Fix imports for utils.js to utils/index.js
  content = content.replace(/from\s+['"](.*)\/utils\.js['"]/g, "from '$1/utils/index.js'");
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
}

// Main function
function main() {
  const pluginDir = path.join(__dirname, 'packages/plugin-art-creator/src');
  
  if (!fs.existsSync(pluginDir)) {
    console.log(`Plugin directory does not exist: ${pluginDir}`);
    return;
  }
  
  const tsFiles = getTypeScriptFiles(pluginDir);
  
  console.log(`Found ${tsFiles.length} TypeScript files to process in plugin directory`);
  
  tsFiles.forEach(filePath => {
    fixImportsInFile(filePath);
  });
  
  console.log('All plugin directory imports have been fixed!');
}

main(); 