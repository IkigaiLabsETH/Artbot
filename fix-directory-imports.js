import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all TypeScript files
function getTypeScriptFiles(dir, fileList = []) {
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
  
  // Fix imports for services/ai.js to services/ai/index.js
  content = content.replace(/from\s+['"](.*)\/ai\.js['"]/g, "from '$1/ai/index.js'");
  
  // Fix imports for services/multiagent.js to services/multiagent/index.js
  content = content.replace(/from\s+['"](.*)\/multiagent\.js['"]/g, "from '$1/multiagent/index.js'");
  
  // Fix imports for services/style.js to services/style/index.js
  content = content.replace(/from\s+['"](.*)\/style\.js['"]/g, "from '$1/style/index.js'");
  
  // Fix imports for services/replicate.js to services/replicate/index.js
  content = content.replace(/from\s+['"](.*)\/replicate\.js['"]/g, "from '$1/replicate/index.js'");
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = getTypeScriptFiles(srcDir);
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  tsFiles.forEach(filePath => {
    fixImportsInFile(filePath);
  });
  
  console.log('All directory imports have been fixed!');
}

main(); 