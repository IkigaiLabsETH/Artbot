import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for image metadata
 */
export interface ImageMetadata {
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

/**
 * Interface for reference images catalog
 */
export interface ReferenceImagesCatalog {
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
 * ReferenceImageProvider provides access to the curated reference images
 * for use by the ArtBot's agents, particularly the StylistAgent.
 */
export class ReferenceImageProvider {
  private catalog: ReferenceImagesCatalog | null = null;
  private baseDir: string;
  
  /**
   * Constructor
   * @param baseDir Base directory for reference images
   */
  constructor(baseDir: string = path.join(process.cwd(), 'reference_images')) {
    this.baseDir = baseDir;
  }
  
  /**
   * Initialize the provider by loading or building the catalog
   */
  async initialize(): Promise<void> {
    try {
      // Check if catalog exists
      const catalogPath = path.join(this.baseDir, 'catalog.json');
      
      if (fs.existsSync(catalogPath)) {
        // Load existing catalog
        const catalogData = fs.readFileSync(catalogPath, 'utf8');
        this.catalog = JSON.parse(catalogData);
        console.log(`Loaded reference images catalog with ${this.catalog.total_images} images`);
      } else {
        // Build new catalog
        await this.buildCatalog();
      }
    } catch (error) {
      console.error('Error initializing ReferenceImageProvider:', error);
      // Create empty catalog as fallback
      this.catalog = {
        total_images: 0,
        categories: {},
        tags_index: {}
      };
    }
  }
  
  /**
   * Build the reference images catalog
   */
  private async buildCatalog(): Promise<void> {
    console.log('Building reference images catalog...');
    
    const catalog: ReferenceImagesCatalog = {
      total_images: 0,
      categories: {},
      tags_index: {}
    };
    
    try {
      // Check if base directory exists
      if (!fs.existsSync(this.baseDir)) {
        console.warn(`Reference images directory not found: ${this.baseDir}`);
        this.catalog = catalog;
        return;
      }
      
      // Get all category directories
      const categories = fs.readdirSync(this.baseDir, { withFileTypes: true });
      
      for (const category of categories) {
        // Skip non-directories and special files
        if (!category.isDirectory() || category.name.startsWith('.')) {
          continue;
        }
        
        const categoryPath = path.join(this.baseDir, category.name);
        const categoryImages = fs.readdirSync(categoryPath);
        
        // Initialize category in catalog
        catalog.categories[category.name] = {
          count: 0,
          images: []
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
            category: category.name
          };
          
          // Try to load additional metadata if it exists
          try {
            if (fs.existsSync(metadataPath)) {
              const metadataContent = fs.readFileSync(metadataPath, 'utf8');
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
      fs.writeFileSync(
        path.join(this.baseDir, 'catalog.json'),
        JSON.stringify(catalog, null, 2),
        'utf8'
      );
      
      this.catalog = catalog;
      console.log(`Reference images catalog built with ${catalog.total_images} images`);
      
    } catch (error) {
      console.error('Error building reference images catalog:', error);
      this.catalog = catalog;
    }
  }
  
  /**
   * Get random reference images based on specified criteria
   */
  getRandomReferenceImages(
    options: {
      category?: string;
      tags?: string[];
      count?: number;
    } = {}
  ): ImageMetadata[] {
    if (!this.catalog) {
      console.warn('Reference images catalog not initialized');
      return [];
    }
    
    const { category, tags, count = 1 } = options;
    let candidateImages: ImageMetadata[] = [];
    
    // Filter by category if specified
    if (category && this.catalog.categories[category]) {
      candidateImages = [...this.catalog.categories[category].images];
    } else {
      // Otherwise, use all images
      Object.values(this.catalog.categories).forEach(cat => {
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
    return this.shuffleArray(candidateImages).slice(0, Math.min(count, candidateImages.length));
  }
  
  /**
   * Get reference images that match a specific style description
   */
  getStyleReferenceImages(
    styleDescription: string,
    count: number = 3
  ): ImageMetadata[] {
    if (!this.catalog) {
      console.warn('Reference images catalog not initialized');
      return [];
    }
    
    // Extract key terms from the style description
    const keyTerms = this.extractKeyTerms(styleDescription);
    
    // Score each image based on how well it matches the key terms
    const scoredImages: Array<{ image: ImageMetadata; score: number }> = [];
    
    Object.values(this.catalog.categories).forEach(category => {
      category.images.forEach(image => {
        let score = 0;
        
        // Check tags
        if (image.tags) {
          keyTerms.forEach(term => {
            if (image.tags!.some(tag => tag.toLowerCase().includes(term.toLowerCase()))) {
              score += 2;
            }
          });
        }
        
        // Check title
        if (image.title) {
          keyTerms.forEach(term => {
            if (image.title!.toLowerCase().includes(term.toLowerCase())) {
              score += 1;
            }
          });
        }
        
        // Check description
        if (image.description) {
          keyTerms.forEach(term => {
            if (image.description!.toLowerCase().includes(term.toLowerCase())) {
              score += 1;
            }
          });
        }
        
        // Check style attributes
        if (image.style_attributes) {
          // Check composition
          if (image.style_attributes.composition) {
            keyTerms.forEach(term => {
              if (image.style_attributes!.composition!.toLowerCase().includes(term.toLowerCase())) {
                score += 1.5;
              }
            });
          }
          
          // Check texture
          if (image.style_attributes.texture) {
            keyTerms.forEach(term => {
              if (image.style_attributes!.texture!.toLowerCase().includes(term.toLowerCase())) {
                score += 1.5;
              }
            });
          }
          
          // Check mood
          if (image.style_attributes.mood) {
            keyTerms.forEach(term => {
              if (image.style_attributes!.mood!.toLowerCase().includes(term.toLowerCase())) {
                score += 1.5;
              }
            });
          }
          
          // Check technique
          if (image.style_attributes.technique) {
            keyTerms.forEach(term => {
              if (image.style_attributes!.technique!.toLowerCase().includes(term.toLowerCase())) {
                score += 1.5;
              }
            });
          }
        }
        
        if (score > 0) {
          scoredImages.push({ image, score });
        }
      });
    });
    
    // Sort by score (descending)
    scoredImages.sort((a, b) => b.score - a.score);
    
    // Return top matches
    return scoredImages.slice(0, count).map(item => item.image);
  }
  
  /**
   * Get all available categories
   */
  getCategories(): string[] {
    if (!this.catalog) {
      console.warn('Reference images catalog not initialized');
      return [];
    }
    
    return Object.keys(this.catalog.categories);
  }
  
  /**
   * Get all available tags
   */
  getTags(): string[] {
    if (!this.catalog) {
      console.warn('Reference images catalog not initialized');
      return [];
    }
    
    return Object.keys(this.catalog.tags_index);
  }
  
  /**
   * Get catalog statistics
   */
  getStats(): {
    totalImages: number;
    categoryCounts: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
  } {
    if (!this.catalog) {
      console.warn('Reference images catalog not initialized');
      return {
        totalImages: 0,
        categoryCounts: {},
        topTags: []
      };
    }
    
    // Get category counts
    const categoryCounts: Record<string, number> = {};
    Object.entries(this.catalog.categories).forEach(([category, data]) => {
      categoryCounts[category] = data.count;
    });
    
    // Get tag counts
    const tagCounts: Record<string, number> = {};
    Object.entries(this.catalog.tags_index).forEach(([tag, filepaths]) => {
      tagCounts[tag] = filepaths.length;
    });
    
    // Sort tags by count
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalImages: this.catalog.total_images,
      categoryCounts,
      topTags
    };
  }
  
  /**
   * Extract key terms from a style description
   */
  private extractKeyTerms(text: string): string[] {
    // Split text into words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common words
    const commonWords = [
      'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
      'his', 'from', 'they', 'will', 'would', 'there', 'their', 'what', 'about',
      'which', 'when', 'make', 'like', 'time', 'just', 'know', 'take', 'people',
      'into', 'year', 'your', 'good', 'some', 'could', 'them', 'than', 'then',
      'look', 'only', 'come', 'over', 'think', 'also', 'back', 'after', 'work',
      'first', 'well', 'even', 'want', 'because', 'these', 'give', 'most'
    ];
    
    const filteredWords = words.filter(word => !commonWords.includes(word));
    
    // Get unique terms
    return [...new Set(filteredWords)];
  }
  
  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
} 