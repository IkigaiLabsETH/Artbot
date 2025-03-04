/**
 * Reference Images Catalog Utility
 * 
 * This utility scans the reference_images directory and generates a catalog
 * that can be used by the ArtBot system for inspiration and style guidance.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

interface ImageMetadata {
  filename: string;
  title?: string;
  artist?: string;
  year?: string;
  source?: string;
  license?: string;
  categories?: string[];
  tags?: string[];
  style_attributes?: {
    color_palette?: string[];
    composition?: string;
    texture?: string;
    mood?: string;
    technique?: string;
  };
  prompt_used?: string;
  description?: string;
  inspiration_value?: string;
  added_date?: string;
  added_by?: string;
  filepath: string;
  category: string;
}

interface ReferenceImagesCatalog {
  total_images: number;
  categories: {
    [category: string]: {
      count: number;
      images: ImageMetadata[];
    };
  };
  tags_index: {
    [tag: string]: string[]; // Array of filepaths
  };
}

/**
 * Scans the reference_images directory and builds a catalog
 */
export async function buildReferenceImagesCatalog(
  baseDir: string = path.join(process.cwd(), 'reference_images')
): Promise<ReferenceImagesCatalog> {
  const catalog: ReferenceImagesCatalog = {
    total_images: 0,
    categories: {},
    tags_index: {},
  };

  try {
    // Get all category directories
    const categories = await readdir(baseDir, { withFileTypes: true });
    
    for (const category of categories) {
      // Skip non-directories and special files
      if (!category.isDirectory() || category.name.startsWith('.')) {
        continue;
      }
      
      const categoryPath = path.join(baseDir, category.name);
      const categoryImages = await readdir(categoryPath);
      
      // Initialize category in catalog
      catalog.categories[category.name] = {
        count: 0,
        images: [],
      };
      
      // Process each image in the category
      for (const filename of categoryImages) {
        // Skip non-image files and metadata files
        if (
          !filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
          filename.startsWith('.')
        ) {
          continue;
        }
        
        const imagePath = path.join(categoryPath, filename);
        const metadataPath = path.join(
          categoryPath, 
          `${path.basename(filename, path.extname(filename))}.json`
        );
        
        // Create basic metadata
        const imageMetadata: ImageMetadata = {
          filename,
          filepath: imagePath,
          category: category.name,
        };
        
        // Try to load additional metadata if it exists
        try {
          if (fs.existsSync(metadataPath)) {
            const metadataContent = await readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent);
            Object.assign(imageMetadata, metadata);
          }
        } catch (error) {
          console.warn(`Error reading metadata for ${filename}:`, error);
        }
        
        // Add to category
        catalog.categories[category.name].images.push(imageMetadata);
        catalog.categories[category.name].count++;
        catalog.total_images++;
        
        // Index by tags
        if (imageMetadata.tags) {
          for (const tag of imageMetadata.tags) {
            if (!catalog.tags_index[tag]) {
              catalog.tags_index[tag] = [];
            }
            catalog.tags_index[tag].push(imagePath);
          }
        }
      }
    }
    
    // Save the catalog to a file
    await writeFile(
      path.join(baseDir, 'catalog.json'),
      JSON.stringify(catalog, null, 2),
      'utf8'
    );
    
    console.log(`Reference images catalog built with ${catalog.total_images} images`);
    return catalog;
    
  } catch (error) {
    console.error('Error building reference images catalog:', error);
    throw error;
  }
}

/**
 * Gets random reference images based on specified criteria
 */
export function getRandomReferenceImages(
  catalog: ReferenceImagesCatalog,
  options: {
    category?: string;
    tags?: string[];
    count?: number;
  } = {}
): ImageMetadata[] {
  const { category, tags, count = 1 } = options;
  let candidateImages: ImageMetadata[] = [];
  
  // Filter by category if specified
  if (category && catalog.categories[category]) {
    candidateImages = [...catalog.categories[category].images];
  } else {
    // Otherwise, use all images
    Object.values(catalog.categories).forEach(cat => {
      candidateImages.push(...cat.images);
    });
  }
  
  // Filter by tags if specified
  if (tags && tags.length > 0) {
    candidateImages = candidateImages.filter(img => {
      if (!img.tags) return false;
      return tags.some(tag => img.tags!.includes(tag));
    });
  }
  
  // Shuffle and return requested count
  return shuffleArray(candidateImages).slice(0, Math.min(count, candidateImages.length));
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Command line interface for building the catalog
 */
if (require.main === module) {
  buildReferenceImagesCatalog()
    .then(() => console.log('Catalog generation complete'))
    .catch(err => console.error('Catalog generation failed:', err));
} 