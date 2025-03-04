export interface Style {
  id?: string;
  name: string;
  description?: string;
  visualCharacteristics?: string[];
  colorPalette?: string[];
  texture?: string;
  parameters?: Record<string, any>;
  creator?: string;
  version?: number;
  created?: Date;
  modified?: Date;
  isPublic?: boolean;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  preferences?: {
    styles?: string[];
    themes?: string[];
  };
}

export interface FeedbackScore {
  userId: string;
  styleId: string;
  score: number;
  timestamp: Date;
}

export interface StyleMetrics {
  popularity: number;
  engagement: number;
  diversity: number;
  views?: number;
  imports?: number;
}

export interface AudienceFeedback {
  userId: string;
  styleId: string;
  rating: number;
  timestamp: Date;
} 