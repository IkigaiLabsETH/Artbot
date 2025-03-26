import { ArtDirection } from '../types/ArtDirection.js';

export type MargritteCategory = 
  | 'object_displacement'
  | 'scale_distortion'
  | 'time_paradox'
  | 'identity_concealment'
  | 'word_image_paradox'
  | 'metamorphosis'
  | 'spatial_illusion'
  | 'object_multiplication';

// Define category-specific art directions
export const Margritte_CATEGORIES: Record<MargritteCategory, ArtDirection> = {
  object_displacement: {
    styleEmphasis: [
      "floating object placement",
      "impossible spatial relationships",
      "gravity defiance",
      "object displacement theory",
      "surreal positioning"
    ],
    visualElements: [
      "floating rocks",
      "levitating objects",
      "suspended everyday items",
      "gravity-defying elements",
      "displaced familiar objects"
    ],
    compositionGuidelines: [
      "precise object placement",
      "perfect shadow casting",
      "spatial tension",
      "balanced displacement",
      "controlled chaos"
    ]
  },

  scale_distortion: {
    styleEmphasis: [
      "scale manipulation",
      "size relationships",
      "proportional distortion"
    ],
    visualElements: [
      "oversized objects",
      "miniaturized elements",
      "scale contrasts"
    ],
    compositionGuidelines: [
      "dramatic scale differences",
      "proportional relationships",
      "size hierarchy"
    ]
  },

  time_paradox: {
    styleEmphasis: [
      "temporal manipulation",
      "time distortion",
      "chronological paradox"
    ],
    visualElements: [
      "multiple time states",
      "temporal overlaps",
      "time-based elements"
    ],
    compositionGuidelines: [
      "temporal layering",
      "chronological juxtaposition",
      "time-space relationships"
    ]
  },

  identity_concealment: {
    styleEmphasis: [
      "hidden identity",
      "obscured faces",
      "anonymous presence"
    ],
    visualElements: [
      "covered faces",
      "obscuring objects",
      "identity masks"
    ],
    compositionGuidelines: [
      "strategic concealment",
      "identity hiding",
      "anonymous positioning"
    ]
  },

  word_image_paradox: {
    styleEmphasis: [
      "word-image relationships",
      "linguistic paradox",
      "textual integration"
    ],
    visualElements: [
      "text elements",
      "word-object relationships",
      "linguistic components"
    ],
    compositionGuidelines: [
      "text placement",
      "word-image balance",
      "linguistic integration"
    ]
  },

  metamorphosis: {
    styleEmphasis: [
      "transformation",
      "object mutation",
      "form evolution"
    ],
    visualElements: [
      "transforming objects",
      "mutating forms",
      "evolutionary elements"
    ],
    compositionGuidelines: [
      "transformation staging",
      "metamorphic flow",
      "evolutionary progression"
    ]
  },

  spatial_illusion: {
    styleEmphasis: [
      "spatial manipulation",
      "perspective illusion",
      "depth paradox"
    ],
    visualElements: [
      "impossible spaces",
      "perspective tricks",
      "spatial anomalies"
    ],
    compositionGuidelines: [
      "spatial organization",
      "perspective manipulation",
      "depth illusion"
    ]
  },

  object_multiplication: {
    styleEmphasis: [
      "object repetition",
      "pattern creation",
      "multiplication effect"
    ],
    visualElements: [
      "repeated objects",
      "pattern elements",
      "multiplied forms"
    ],
    compositionGuidelines: [
      "repetition placement",
      "pattern organization",
      "multiplication balance"
    ]
  }
};

export function combineMargritteCategories(categories: MargritteCategory[]): ArtDirection {
  const initialValue: ArtDirection = {
    styleEmphasis: [],
    visualElements: [],
    compositionGuidelines: []
  };

  return categories.reduce((combined, category) => {
    const categoryConfig = Margritte_CATEGORIES[category];
    return {
      styleEmphasis: [...(combined.styleEmphasis || []), ...(categoryConfig.styleEmphasis || [])],
      visualElements: [...(combined.visualElements || []), ...(categoryConfig.visualElements || [])],
      compositionGuidelines: [...(combined.compositionGuidelines || []), ...(categoryConfig.compositionGuidelines || [])]
    };
  }, initialValue);
} 