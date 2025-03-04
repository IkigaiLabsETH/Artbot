import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Memory, MemoryType } from './index.js';

/**
 * Interface for memory export options
 */
export interface MemoryExportOptions {
  types?: MemoryType[];
  tags?: string[];
  since?: Date;
  limit?: number;
  includeEmbeddings?: boolean;
}

/**
 * Interface for memory import options
 */
export interface MemoryImportOptions {
  overwriteExisting?: boolean;
  preserveIds?: boolean;
  validateMemories?: boolean;
  importTags?: string[];
}

/**
 * Interface for memory export file
 */
export interface MemoryExportFile {
  version: string;
  exportDate: string;
  source: string;
  memories: Memory[];
  metadata: {
    totalMemories: number;
    typeDistribution: Record<string, number>;
    tags: string[];
  };
}

/**
 * Interface for memory import result
 */
export interface MemoryImportResult {
  totalMemories: number;
  importedMemories: number;
  skippedMemories: number;
  errors: string[];
  importedIds: string[];
}

/**
 * Collaborative memory service
 * Enables sharing and importing memories between different ArtBot instances
 */
export class CollaborativeMemory {
  private baseDir: string;
  
  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), '.artbot', 'shared');
  }
  
  /**
   * Initialize the collaborative memory service
   */
  async initialize(): Promise<void> {
    try {
      // Create shared memory directory if it doesn't exist
      await fs.mkdir(this.baseDir, { recursive: true });
      console.log(`✅ Collaborative memory initialized at ${this.baseDir}`);
    } catch (error) {
      console.error('Error initializing collaborative memory:', error);
      throw error;
    }
  }
  
  /**
   * Export memories to a file
   */
  async exportMemories(
    memories: Memory[],
    options: MemoryExportOptions = {}
  ): Promise<string> {
    try {
      // Filter memories based on options
      let filteredMemories = [...memories];
      
      if (options.types && options.types.length > 0) {
        filteredMemories = filteredMemories.filter(memory => 
          options.types!.includes(memory.type)
        );
      }
      
      if (options.tags && options.tags.length > 0) {
        filteredMemories = filteredMemories.filter(memory => 
          options.tags!.some(tag => memory.tags.includes(tag))
        );
      }
      
      if (options.since) {
        filteredMemories = filteredMemories.filter(memory => 
          memory.createdAt >= options.since!
        );
      }
      
      if (options.limit) {
        filteredMemories = filteredMemories.slice(0, options.limit);
      }
      
      // Process memories for export
      const exportMemories = filteredMemories.map(memory => {
        const exportMemory = { ...memory };
        
        // Remove embeddings if not included
        if (!options.includeEmbeddings) {
          exportMemory.embedding = [];
        }
        
        return exportMemory;
      });
      
      // Calculate type distribution
      const typeDistribution: Record<string, number> = {};
      for (const memory of exportMemories) {
        typeDistribution[memory.type] = (typeDistribution[memory.type] || 0) + 1;
      }
      
      // Collect all tags
      const allTags = new Set<string>();
      for (const memory of exportMemories) {
        for (const tag of memory.tags) {
          allTags.add(tag);
        }
      }
      
      // Create export file
      const exportFile: MemoryExportFile = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        source: 'ArtBot',
        memories: exportMemories,
        metadata: {
          totalMemories: exportMemories.length,
          typeDistribution,
          tags: Array.from(allTags)
        }
      };
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `memories-export-${timestamp}.json`;
      const filePath = path.join(this.baseDir, filename);
      
      // Write to file
      await fs.writeFile(filePath, JSON.stringify(exportFile, null, 2), 'utf-8');
      
      console.log(`✅ Exported ${exportMemories.length} memories to ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Error exporting memories:', error);
      throw error;
    }
  }
  
  /**
   * Import memories from a file
   */
  async importMemories(
    filePath: string,
    options: MemoryImportOptions = {}
  ): Promise<MemoryImportResult> {
    try {
      // Read import file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const importFile = JSON.parse(fileContent) as MemoryExportFile;
      
      // Validate import file
      if (!importFile.version || !importFile.memories || !Array.isArray(importFile.memories)) {
        throw new Error('Invalid memory export file format');
      }
      
      const result: MemoryImportResult = {
        totalMemories: importFile.memories.length,
        importedMemories: 0,
        skippedMemories: 0,
        errors: [],
        importedIds: []
      };
      
      // Process memories
      const processedMemories: Memory[] = [];
      
      for (const memory of importFile.memories) {
        try {
          // Validate memory if required
          if (options.validateMemories) {
            this.validateMemory(memory);
          }
          
          // Process memory
          const processedMemory = { ...memory };
          
          // Generate new ID if not preserving IDs
          if (!options.preserveIds) {
            processedMemory.id = uuidv4();
          }
          
          // Add import tags if specified
          if (options.importTags && options.importTags.length > 0) {
            processedMemory.tags = [...new Set([...processedMemory.tags, ...options.importTags])];
          }
          
          // Add import metadata
          processedMemory.metadata = {
            ...processedMemory.metadata,
            imported: true,
            importDate: new Date().toISOString(),
            importSource: importFile.source
          };
          
          // Add to processed memories
          processedMemories.push(processedMemory);
          result.importedIds.push(processedMemory.id);
          result.importedMemories++;
        } catch (error) {
          result.skippedMemories++;
          result.errors.push(`Error processing memory ${memory.id}: ${error}`);
        }
      }
      
      console.log(`✅ Imported ${result.importedMemories} memories from ${filePath}`);
      return result;
    } catch (error) {
      console.error('Error importing memories:', error);
      throw error;
    }
  }
  
  /**
   * List available memory export files
   */
  async listExportFiles(): Promise<Array<{ filename: string, path: string, date: Date }>> {
    try {
      const files = await fs.readdir(this.baseDir);
      
      const exportFiles = files
        .filter(file => file.startsWith('memories-export-') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.baseDir, file);
          
          // Extract date from filename
          const dateMatch = file.match(/memories-export-(.+)\.json/);
          const dateStr = dateMatch ? dateMatch[1].replace(/-/g, ':') : '';
          const date = dateStr ? new Date(dateStr) : new Date();
          
          return {
            filename: file,
            path: filePath,
            date
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
      
      return exportFiles;
    } catch (error) {
      console.error('Error listing export files:', error);
      return [];
    }
  }
  
  /**
   * Delete a memory export file
   */
  async deleteExportFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, filename);
      
      // Check if file exists
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!exists) {
        return false;
      }
      
      // Delete file
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting export file ${filename}:`, error);
      return false;
    }
  }
  
  /**
   * Validate a memory object
   */
  private validateMemory(memory: any): void {
    // Check required fields
    if (!memory.id) throw new Error('Memory ID is required');
    if (!memory.type) throw new Error('Memory type is required');
    if (!memory.content) throw new Error('Memory content is required');
    if (!Array.isArray(memory.tags)) throw new Error('Memory tags must be an array');
    
    // Check if type is valid
    if (!Object.values(MemoryType).includes(memory.type)) {
      throw new Error(`Invalid memory type: ${memory.type}`);
    }
    
    // Check if embedding is an array
    if (memory.embedding && !Array.isArray(memory.embedding)) {
      throw new Error('Memory embedding must be an array');
    }
    
    // Check if metadata is an object
    if (memory.metadata && typeof memory.metadata !== 'object') {
      throw new Error('Memory metadata must be an object');
    }
  }
  
  /**
   * Merge memories from multiple ArtBot instances
   */
  mergeMemories(
    memorySets: Array<{ source: string, memories: Memory[] }>,
    options: {
      deduplicationStrategy?: 'keepFirst' | 'keepNewest' | 'keepAll';
      preserveSourceInfo?: boolean;
    } = {}
  ): Memory[] {
    const deduplicationStrategy = options.deduplicationStrategy || 'keepNewest';
    const preserveSourceInfo = options.preserveSourceInfo !== false;
    
    // Map to track memories by content hash
    const memoryMap = new Map<string, Memory>();
    
    // Process each memory set
    for (const { source, memories } of memorySets) {
      for (const memory of memories) {
        // Generate content hash for deduplication
        const contentHash = this.generateContentHash(memory);
        
        // Add source info if preserving
        if (preserveSourceInfo) {
          memory.metadata = {
            ...memory.metadata,
            mergeSource: source
          };
        }
        
        // Apply deduplication strategy
        if (memoryMap.has(contentHash)) {
          const existingMemory = memoryMap.get(contentHash)!;
          
          switch (deduplicationStrategy) {
            case 'keepFirst':
              // Keep the first memory encountered (do nothing)
              break;
              
            case 'keepNewest':
              // Keep the newer memory
              if (memory.createdAt > existingMemory.createdAt) {
                memoryMap.set(contentHash, memory);
              }
              break;
              
            case 'keepAll':
              // Keep all memories by generating a new ID
              const uniqueMemory = { ...memory, id: uuidv4() };
              memoryMap.set(`${contentHash}-${uniqueMemory.id}`, uniqueMemory);
              break;
          }
        } else {
          // No duplicate, add to map
          memoryMap.set(contentHash, memory);
        }
      }
    }
    
    // Return merged memories
    return Array.from(memoryMap.values());
  }
  
  /**
   * Generate a content hash for deduplication
   */
  private generateContentHash(memory: Memory): string {
    // Create a string representation of the memory content
    let contentStr = '';
    
    if (typeof memory.content === 'string') {
      contentStr = memory.content;
    } else if (typeof memory.content === 'object') {
      contentStr = JSON.stringify(memory.content);
    }
    
    // Add type for more specific matching
    contentStr = `${memory.type}:${contentStr}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < contentStr.length; i++) {
      const char = contentStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `${memory.type}-${hash}`;
  }
} 