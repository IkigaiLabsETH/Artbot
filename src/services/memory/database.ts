import * as fs from 'fs/promises';
import * as path from 'path';
import { Memory, MemoryType } from './index.js';

/**
 * Interface for memory database operations
 */
export interface MemoryDatabase {
  initialize(): Promise<void>;
  saveMemory(memory: Memory): Promise<void>;
  getMemory(id: string): Promise<Memory | null>;
  getAllMemories(): Promise<Memory[]>;
  getMemoriesByType(type: MemoryType): Promise<Memory[]>;
  getMemoriesByTags(tags: string[]): Promise<Memory[]>;
  updateMemory(memory: Memory): Promise<void>;
  deleteMemory(id: string): Promise<boolean>;
  close(): Promise<void>;
}

/**
 * File-based memory database implementation
 * Stores memories as JSON files in a directory structure
 */
export class FileMemoryDatabase implements MemoryDatabase {
  private baseDir: string;
  private memoryCache: Map<string, Memory> = new Map();
  private initialized: boolean = false;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), '.artbot', 'memories');
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create base directory if it doesn't exist
      await fs.mkdir(this.baseDir, { recursive: true });
      
      // Create type-specific directories
      for (const type of Object.values(MemoryType)) {
        await fs.mkdir(path.join(this.baseDir, type), { recursive: true });
      }
      
      // Load all memories into cache
      await this.loadAllMemories();
      
      this.initialized = true;
      console.log(`📚 Memory database initialized at ${this.baseDir}`);
      console.log(`📊 Loaded ${this.memoryCache.size} memories from storage`);
    } catch (error) {
      console.error('Error initializing memory database:', error);
      throw error;
    }
  }

  /**
   * Save a memory to the database
   */
  async saveMemory(memory: Memory): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Add to cache
      this.memoryCache.set(memory.id, memory);
      
      // Save to file
      const filePath = this.getMemoryFilePath(memory);
      await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error saving memory ${memory.id}:`, error);
      throw error;
    }
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Check cache first
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id) || null;
    }

    // Not in cache, try to load from file
    try {
      for (const type of Object.values(MemoryType)) {
        const filePath = path.join(this.baseDir, type, `${id}.json`);
        try {
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          if (exists) {
            const data = await fs.readFile(filePath, 'utf-8');
            const memory = JSON.parse(data) as Memory;
            
            // Add to cache
            this.memoryCache.set(memory.id, memory);
            
            return memory;
          }
        } catch (e) {
          // File doesn't exist in this type directory, continue to next
        }
      }
      
      // Memory not found
      return null;
    } catch (error) {
      console.error(`Error getting memory ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all memories
   */
  async getAllMemories(): Promise<Memory[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return Array.from(this.memoryCache.values());
  }

  /**
   * Get memories by type
   */
  async getMemoriesByType(type: MemoryType): Promise<Memory[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return Array.from(this.memoryCache.values()).filter(memory => memory.type === type);
  }

  /**
   * Get memories by tags
   */
  async getMemoriesByTags(tags: string[]): Promise<Memory[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return Array.from(this.memoryCache.values()).filter(memory => 
      tags.some(tag => memory.tags.includes(tag))
    );
  }

  /**
   * Update a memory
   */
  async updateMemory(memory: Memory): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Check if memory exists
      const existingMemory = await this.getMemory(memory.id);
      if (!existingMemory) {
        throw new Error(`Memory ${memory.id} not found`);
      }
      
      // If memory type has changed, delete old file
      if (existingMemory.type !== memory.type) {
        const oldFilePath = this.getMemoryFilePath(existingMemory);
        await fs.unlink(oldFilePath);
      }
      
      // Update cache
      this.memoryCache.set(memory.id, memory);
      
      // Save to file
      const filePath = this.getMemoryFilePath(memory);
      await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error updating memory ${memory.id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Check if memory exists
      const memory = await this.getMemory(id);
      if (!memory) {
        return false;
      }
      
      // Remove from cache
      this.memoryCache.delete(id);
      
      // Delete file
      const filePath = this.getMemoryFilePath(memory);
      await fs.unlink(filePath);
      
      return true;
    } catch (error) {
      console.error(`Error deleting memory ${id}:`, error);
      return false;
    }
  }

  /**
   * Close the database
   */
  async close(): Promise<void> {
    // Nothing to do for file-based database
    this.memoryCache.clear();
    this.initialized = false;
  }

  /**
   * Load all memories into cache
   */
  private async loadAllMemories(): Promise<void> {
    try {
      for (const type of Object.values(MemoryType)) {
        const typeDir = path.join(this.baseDir, type);
        
        try {
          const files = await fs.readdir(typeDir);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const filePath = path.join(typeDir, file);
              const data = await fs.readFile(filePath, 'utf-8');
              const memory = JSON.parse(data) as Memory;
              
              // Add to cache
              this.memoryCache.set(memory.id, memory);
            }
          }
        } catch (e) {
          // Directory might not exist yet, continue to next
        }
      }
    } catch (error) {
      console.error('Error loading memories:', error);
      throw error;
    }
  }

  /**
   * Get the file path for a memory
   */
  private getMemoryFilePath(memory: Memory): string {
    return path.join(this.baseDir, memory.type, `${memory.id}.json`);
  }
}

/**
 * Factory function to create a memory database
 */
export function createMemoryDatabase(type: 'file' = 'file', config: any = {}): MemoryDatabase {
  switch (type) {
    case 'file':
      return new FileMemoryDatabase(config.baseDir);
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
} 