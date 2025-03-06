import { readFile, writeFile } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface HashResult {
  path: string;
  hash: string;
  size: number;
}

class HashGenerator {
  private static readonly IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];
  
  static async generateHashes(imagesDir: string, catalogPath: string): Promise<void> {
    try {
      // Read catalog
      const catalogContent = await readFile(catalogPath, 'utf-8');
      const catalog = JSON.parse(catalogContent);
      
      // Find all images recursively
      const imageFiles = await this.findImageFiles(imagesDir);

      console.log(`Found ${imageFiles.length} images to process`);

      // Process each image
      for (const imagePath of imageFiles) {
        try {
          // Read image file
          const imageContent = await readFile(imagePath);
          
          // Generate hash
          const hash = createHash('sha256').update(imageContent).digest('hex');
          const size = imageContent.length;

          // Update catalog entries that reference this image
          this.updateCatalogReferences(catalog, imagePath, hash, size);
          
          console.log(`Generated hash for ${imagePath}: ${hash}`);
        } catch (error) {
          console.error(`Error processing ${imagePath}:`, error);
        }
      }

      // Save updated catalog
      await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
      console.log('Updated catalog with file hashes');

    } catch (error) {
      console.error('Error generating hashes:', error);
      process.exit(1);
    }
  }

  private static async findImageFiles(dir: string): Promise<string[]> {
    const files = await readdir(dir, { withFileTypes: true });
    const imageFiles: string[] = [];

    for (const file of files) {
      const fullPath = join(dir, file.name);
      if (file.isDirectory()) {
        imageFiles.push(...await this.findImageFiles(fullPath));
      } else if (this.IMAGE_EXTENSIONS.includes(extname(file.name).toLowerCase())) {
        imageFiles.push(fullPath);
      }
    }

    return imageFiles;
  }

  private static updateCatalogReferences(catalog: any, imagePath: string, hash: string, size: number): void {
    const filename = imagePath.split('/').pop();
    
    Object.values(catalog.categories).forEach((category: any) => {
      if (category.images) {
        category.images.forEach((image: any) => {
          if (image.filename === filename) {
            // Update image hash
            image.hash = hash;
            image.size = size;
            
            // Update file references in properties
            if (image.properties && image.properties.files) {
              image.properties.files = image.properties.files.map((file: any) => {
                if (file.uri.includes(filename)) {
                  return { 
                    ...file, 
                    hash,
                    size
                  };
                }
                return file;
              });
            }
          }
        });
      }
    });
  }
}

// Run if import.meta.url is same as the executed file
if (import.meta.url.endsWith(process.argv[1])) {
  const imagesDir = join(__dirname, '../reference_images');
  const catalogPath = join(imagesDir, 'catalog.json');
  
  HashGenerator.generateHashes(imagesDir, catalogPath)
    .then(() => console.log('Hash generation complete'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { HashGenerator }; 