#!/usr/bin/env node

/**
 * Reference Images Import Utility
 * 
 * This script helps import and organize reference images for the ArtBot.
 * It can:
 * 1. Import images from a source directory
 * 2. Prompt for metadata
 * 3. Organize images into the appropriate category folders
 * 4. Generate metadata JSON files
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const { execSync } = require('child_process');

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// Available categories
const CATEGORIES = [
  'abstract',
  'figurative',
  'landscape',
  'portrait',
  'conceptual',
  'surreal',
  'geometric',
  'organic',
  'digital',
  'traditional'
];

// Main function
async function main() {
  console.log('\n=== ArtBot Reference Images Import Utility ===\n');
  
  try {
    const mode = await question(
      'Choose operation mode:\n' +
      '1. Import images from a directory\n' +
      '2. Add metadata to existing images\n' +
      '3. Generate catalog from existing images\n' +
      'Enter choice (1-3): '
    );
    
    switch (mode) {
      case '1':
        await importImages();
        break;
      case '2':
        await addMetadata();
        break;
      case '3':
        await generateCatalog();
        break;
      default:
        console.log('Invalid choice. Exiting.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Import images from a directory
async function importImages() {
  const sourceDir = await question('Enter source directory path: ');
  
  if (!fs.existsSync(sourceDir)) {
    console.error('Source directory does not exist!');
    return;
  }
  
  const files = await readdir(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );
  
  console.log(`Found ${imageFiles.length} image files.`);
  
  if (imageFiles.length === 0) {
    console.log('No images to import. Exiting.');
    return;
  }
  
  // Ensure reference_images directory exists
  const baseDir = path.join(process.cwd(), 'reference_images');
  if (!fs.existsSync(baseDir)) {
    await mkdir(baseDir, { recursive: true });
  }
  
  // Ensure all category directories exist
  for (const category of CATEGORIES) {
    const categoryPath = path.join(baseDir, category);
    if (!fs.existsSync(categoryPath)) {
      await mkdir(categoryPath, { recursive: true });
    }
  }
  
  // Process each image
  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const sourcePath = path.join(sourceDir, filename);
    
    console.log(`\nProcessing image ${i + 1}/${imageFiles.length}: ${filename}`);
    
    // Display the image if possible
    try {
      if (process.platform === 'darwin') {
        execSync(`open "${sourcePath}"`);
      } else if (process.platform === 'win32') {
        execSync(`start "" "${sourcePath}"`);
      } else if (process.platform === 'linux') {
        execSync(`xdg-open "${sourcePath}"`);
      }
    } catch (error) {
      console.log('Could not open image for preview.');
    }
    
    // Get category
    console.log('\nAvailable categories:');
    CATEGORIES.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`);
    });
    
    const categoryIndex = await question('Select category (1-10): ');
    const category = CATEGORIES[parseInt(categoryIndex, 10) - 1] || 'abstract';
    
    // Get basic metadata
    const title = await question('Title (optional): ');
    const artist = await question('Artist (optional): ');
    const tagsInput = await question('Tags (comma-separated, optional): ');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Generate destination filename
    const ext = path.extname(filename);
    const baseFilename = path.basename(filename, ext);
    const destFilename = `${baseFilename}${ext}`;
    const destPath = path.join(baseDir, category, destFilename);
    
    // Copy the file
    await copyFile(sourcePath, destPath);
    console.log(`Copied to ${destPath}`);
    
    // Create metadata file
    const metadata = {
      filename: destFilename,
      title: title || undefined,
      artist: artist || undefined,
      categories: [category],
      tags: tags.length > 0 ? tags : undefined,
      added_date: new Date().toISOString().split('T')[0]
    };
    
    const metadataPath = path.join(
      baseDir, 
      category, 
      `${baseFilename}.json`
    );
    
    await writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf8'
    );
    
    console.log(`Created metadata at ${metadataPath}`);
  }
  
  console.log('\nImport complete!');
}

// Add metadata to existing images
async function addMetadata() {
  const baseDir = path.join(process.cwd(), 'reference_images');
  
  if (!fs.existsSync(baseDir)) {
    console.error('Reference images directory does not exist!');
    return;
  }
  
  // Choose category
  console.log('\nAvailable categories:');
  CATEGORIES.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat}`);
  });
  
  const categoryIndex = await question('Select category (1-10): ');
  const category = CATEGORIES[parseInt(categoryIndex, 10) - 1];
  
  if (!category) {
    console.log('Invalid category. Exiting.');
    return;
  }
  
  const categoryPath = path.join(baseDir, category);
  
  if (!fs.existsSync(categoryPath)) {
    console.error(`Category directory ${category} does not exist!`);
    return;
  }
  
  const files = await readdir(categoryPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );
  
  console.log(`Found ${imageFiles.length} image files in ${category}.`);
  
  if (imageFiles.length === 0) {
    console.log('No images to process. Exiting.');
    return;
  }
  
  // Process each image
  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const imagePath = path.join(categoryPath, filename);
    const baseFilename = path.basename(filename, path.extname(filename));
    const metadataPath = path.join(categoryPath, `${baseFilename}.json`);
    
    // Skip if metadata already exists
    if (fs.existsSync(metadataPath)) {
      console.log(`Metadata already exists for ${filename}, skipping.`);
      continue;
    }
    
    console.log(`\nProcessing image ${i + 1}/${imageFiles.length}: ${filename}`);
    
    // Display the image if possible
    try {
      if (process.platform === 'darwin') {
        execSync(`open "${imagePath}"`);
      } else if (process.platform === 'win32') {
        execSync(`start "" "${imagePath}"`);
      } else if (process.platform === 'linux') {
        execSync(`xdg-open "${imagePath}"`);
      }
    } catch (error) {
      console.log('Could not open image for preview.');
    }
    
    // Get basic metadata
    const title = await question('Title (optional): ');
    const artist = await question('Artist (optional): ');
    const tagsInput = await question('Tags (comma-separated, optional): ');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    const description = await question('Description (optional): ');
    
    // Create metadata file
    const metadata = {
      filename,
      title: title || undefined,
      artist: artist || undefined,
      categories: [category],
      tags: tags.length > 0 ? tags : undefined,
      description: description || undefined,
      added_date: new Date().toISOString().split('T')[0]
    };
    
    await writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf8'
    );
    
    console.log(`Created metadata at ${metadataPath}`);
  }
  
  console.log('\nMetadata addition complete!');
}

// Generate catalog from existing images
async function generateCatalog() {
  console.log('Generating catalog from existing images...');
  
  try {
    // Use the TypeScript utility to generate the catalog
    execSync('npx ts-node src/utils/reference_images_catalog.ts', { stdio: 'inherit' });
    console.log('Catalog generation complete!');
  } catch (error) {
    console.error('Error generating catalog:', error);
  }
}

// Run the main function
main().catch(console.error); 