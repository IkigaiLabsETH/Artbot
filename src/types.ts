// Style definition
export interface Style {
  id?: string;
  name: string;
  creator: string;
  parameters: Record<string, any>;
  version: number;
  created: Date;
  modified: Date;
  isPublic: boolean;
  tags: string[];
}

// Style analysis
export interface StyleAnalysis {
  id: string;
  metrics: StyleMetrics;
  elements: string[];
}

// Style metrics
export interface StyleMetrics {
  coherence: number;
  stability: number;
  compatibility: number;
}

// Artwork definition
export interface Artwork {
  id: string;
  title: string;
  description?: string;
  creator: string;
  style: Style;
  created: Date;
  imageUrl?: string;
  elements?: string[];
  tags: string[];
}

// Model prediction
export interface ModelPrediction {
  id: string;
  model: string;
  input: Record<string, any>;
  output: any;
  created: Date;
  status: 'pending' | 'success' | 'failed';
  error?: string;
} 