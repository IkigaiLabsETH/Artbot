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
  
  // Regular expression to match relative imports without file extensions
  const importRegex = /from\s+['"](\.[^'"]*)['"]/g;
  
  // Replace imports to add .js extension
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if the import already has an extension
    if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
      return match;
    }
    
    return `from '${importPath}.js'`;
  });
  
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
  
  console.log('All plugin imports have been fixed!');
}

main(); 