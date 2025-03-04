import { Memory, MemoryType } from './index.js';

/**
 * Interface for memory visualization options
 */
export interface MemoryVisualizationOptions {
  format?: 'json' | 'dot' | 'html';
  includeContent?: boolean;
  minSimilarity?: number;
  maxNodes?: number;
  focusMemoryId?: string;
  focusType?: MemoryType;
  focusTags?: string[];
}

/**
 * Memory visualization service
 * Provides tools to visualize memory connections and influences
 */
export class MemoryVisualization {
  /**
   * Generate a visualization of memory connections
   */
  static generateMemoryGraph(
    memories: Memory[],
    options: MemoryVisualizationOptions = {}
  ): string {
    const format = options.format || 'json';
    const includeContent = options.includeContent || false;
    const minSimilarity = options.minSimilarity || 0.5;
    const maxNodes = options.maxNodes || 50;
    
    // Filter memories based on options
    let filteredMemories = [...memories];
    
    if (options.focusMemoryId) {
      filteredMemories = filteredMemories.filter(m => 
        m.id === options.focusMemoryId || 
        this.findConnectedMemories(memories, options.focusMemoryId, minSimilarity).includes(m.id)
      );
    }
    
    if (options.focusType) {
      filteredMemories = filteredMemories.filter(m => m.type === options.focusType);
    }
    
    if (options.focusTags && options.focusTags.length > 0) {
      filteredMemories = filteredMemories.filter(m => 
        options.focusTags!.some(tag => m.tags.includes(tag))
      );
    }
    
    // Limit the number of nodes
    if (filteredMemories.length > maxNodes) {
      filteredMemories = filteredMemories.slice(0, maxNodes);
    }
    
    // Generate connections between memories
    const connections: Array<{source: string, target: string, weight: number}> = [];
    
    for (let i = 0; i < filteredMemories.length; i++) {
      for (let j = i + 1; j < filteredMemories.length; j++) {
        const memory1 = filteredMemories[i];
        const memory2 = filteredMemories[j];
        
        // Calculate similarity between memories
        const similarity = this.calculateMemorySimilarity(memory1, memory2);
        
        if (similarity >= minSimilarity) {
          connections.push({
            source: memory1.id,
            target: memory2.id,
            weight: similarity
          });
        }
      }
    }
    
    // Generate visualization based on format
    switch (format) {
      case 'dot':
        return this.generateDotGraph(filteredMemories, connections, includeContent);
      case 'html':
        return this.generateHtmlGraph(filteredMemories, connections, includeContent);
      case 'json':
      default:
        return this.generateJsonGraph(filteredMemories, connections, includeContent);
    }
  }
  
  /**
   * Find connected memories
   */
  private static findConnectedMemories(
    memories: Memory[],
    memoryId: string,
    minSimilarity: number
  ): string[] {
    const memory = memories.find(m => m.id === memoryId);
    if (!memory) {
      return [];
    }
    
    return memories
      .filter(m => m.id !== memoryId)
      .filter(m => this.calculateMemorySimilarity(memory, m) >= minSimilarity)
      .map(m => m.id);
  }
  
  /**
   * Calculate similarity between two memories
   */
  private static calculateMemorySimilarity(memory1: Memory, memory2: Memory): number {
    // If memories are of different types, reduce similarity
    if (memory1.type !== memory2.type) {
      return this.calculateCosineSimilarity(memory1.embedding, memory2.embedding) * 0.8;
    }
    
    // If memories share tags, increase similarity
    const sharedTags = memory1.tags.filter(tag => memory2.tags.includes(tag));
    const tagBoost = sharedTags.length > 0 ? 0.1 * Math.min(sharedTags.length / 3, 0.2) : 0;
    
    // Calculate base similarity using cosine similarity of embeddings
    const baseSimilarity = this.calculateCosineSimilarity(memory1.embedding, memory2.embedding);
    
    return Math.min(baseSimilarity + tagBoost, 1.0);
  }
  
  /**
   * Calculate cosine similarity between two embeddings
   */
  private static calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  /**
   * Generate JSON graph
   */
  private static generateJsonGraph(
    memories: Memory[],
    connections: Array<{source: string, target: string, weight: number}>,
    includeContent: boolean
  ): string {
    const nodes = memories.map(memory => {
      const node: any = {
        id: memory.id,
        type: memory.type,
        tags: memory.tags,
        metadata: memory.metadata,
        createdAt: memory.createdAt,
        accessCount: memory.accessCount
      };
      
      if (includeContent) {
        node.content = memory.content;
      }
      
      return node;
    });
    
    const graph = {
      nodes,
      edges: connections
    };
    
    return JSON.stringify(graph, null, 2);
  }
  
  /**
   * Generate DOT graph (for Graphviz)
   */
  private static generateDotGraph(
    memories: Memory[],
    connections: Array<{source: string, target: string, weight: number}>,
    includeContent: boolean
  ): string {
    let dot = 'graph MemoryGraph {\n';
    dot += '  node [shape=box, style=filled];\n';
    
    // Add nodes
    for (const memory of memories) {
      const label = this.getMemoryLabel(memory, includeContent);
      const color = this.getMemoryColor(memory.type);
      
      dot += `  "${memory.id}" [label="${label}", fillcolor="${color}"];\n`;
    }
    
    // Add edges
    for (const connection of connections) {
      const width = Math.max(connection.weight * 5, 1);
      dot += `  "${connection.source}" -- "${connection.target}" [penwidth=${width}, label="${connection.weight.toFixed(2)}"];\n`;
    }
    
    dot += '}';
    
    return dot;
  }
  
  /**
   * Generate HTML graph (using D3.js)
   */
  private static generateHtmlGraph(
    memories: Memory[],
    connections: Array<{source: string, target: string, weight: number}>,
    includeContent: boolean
  ): string {
    const nodes = memories.map(memory => {
      return {
        id: memory.id,
        label: this.getMemoryLabel(memory, includeContent),
        type: memory.type,
        color: this.getMemoryColor(memory.type)
      };
    });
    
    const links = connections.map(connection => {
      return {
        source: connection.source,
        target: connection.target,
        value: connection.weight
      };
    });
    
    const data = JSON.stringify({ nodes, links });
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Memory Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .node { stroke: #fff; stroke-width: 1.5px; }
    .link { stroke: #999; stroke-opacity: 0.6; }
    .tooltip {
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    }
  </style>
</head>
<body>
  <div id="graph"></div>
  <div class="tooltip"></div>
  
  <script>
    const data = ${data};
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    const tooltip = d3.select('.tooltip');
    
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(d => 100 * (1 - d.value)))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke-width', d => d.value * 5);
    
    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 10)
      .attr('fill', d => d.color)
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(d.label)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
    
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  </script>
</body>
</html>
    `;
  }
  
  /**
   * Get memory label for visualization
   */
  private static getMemoryLabel(memory: Memory, includeContent: boolean): string {
    let label = `Type: ${memory.type}\\n`;
    
    if (memory.metadata.title) {
      label += `Title: ${memory.metadata.title}\\n`;
    }
    
    if (memory.tags.length > 0) {
      label += `Tags: ${memory.tags.join(', ')}\\n`;
    }
    
    if (includeContent) {
      const content = typeof memory.content === 'string' 
        ? memory.content 
        : JSON.stringify(memory.content);
      
      // Truncate content if too long
      const truncatedContent = content.length > 100 
        ? content.substring(0, 97) + '...' 
        : content;
      
      label += `Content: ${truncatedContent}\\n`;
    }
    
    return label;
  }
  
  /**
   * Get memory color based on type
   */
  private static getMemoryColor(type: MemoryType): string {
    switch (type) {
      case MemoryType.VISUAL:
        return '#4285F4'; // Blue
      case MemoryType.TEXTUAL:
        return '#34A853'; // Green
      case MemoryType.STYLE:
        return '#FBBC05'; // Yellow
      case MemoryType.FEEDBACK:
        return '#EA4335'; // Red
      case MemoryType.SOCIAL:
        return '#AA46BC'; // Purple
      case MemoryType.EXPERIENCE:
        return '#00ACC1'; // Cyan
      default:
        return '#9E9E9E'; // Gray
    }
  }
} 