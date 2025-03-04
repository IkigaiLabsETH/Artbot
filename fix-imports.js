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
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = getTypeScriptFiles(srcDir);
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  tsFiles.forEach(filePath => {
    fixImportsInFile(filePath);
  });
  
  console.log('All imports have been fixed!');
}

main(); 