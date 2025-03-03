/**
 * Parse idea response from AI into concept, style, and medium
 */
export function parseIdeaResponse(response: string): [string, string, string] {
  try {
    // Try to parse structured format first
    const parts = response.split(' in ').map(p => p.trim());
    if (parts.length >= 2) {
      const [concept, rest] = parts;
      const [style, medium] = rest.split(' using ').map(p => p.trim());
      return [
        concept || 'abstract composition',
        style || 'contemporary',
        medium || 'digital'
      ];
    }

    // Fallback to simple parsing
    return [
      response.trim() || 'abstract composition',
      'contemporary',
      'digital'
    ];
  } catch (error) {
    console.warn('Failed to parse idea response:', error);
    return ['abstract composition', 'contemporary', 'digital'];
  }
}

/**
 * Parse style parameters from model output
 */
export function parseStyleParameters(output: any): Record<string, any> {
  const params: Record<string, any> = {};

  try {
    if (typeof output === 'object' && output !== null) {
      // Extract numeric parameters
      for (const [key, value] of Object.entries(output)) {
        if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
          params[key] = value;
        } else if (typeof value === 'string' && !isNaN(Number(value))) {
          params[key] = Number(value);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to parse style parameters:', error);
  }

  return params;
}

/**
 * Parse feedback score from comment
 */
export function parseFeedbackScore(comment: string): number {
  try {
    // Look for numeric ratings (e.g. "8/10", "4 out of 5")
    const ratingMatch = comment.match(/(\d+)(?:\s*\/\s*|\s+out\s+of\s+)(\d+)/i);
    if (ratingMatch) {
      const [_, score, total] = ratingMatch;
      return Math.min(1, Math.max(0, Number(score) / Number(total)));
    }

    // Look for sentiment words
    const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'perfect'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'awful', 'worst'];

    let score = 0.5; // Neutral starting point
    const words = comment.toLowerCase().split(/\W+/);
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    }

    return Math.min(1, Math.max(0, score));
  } catch (error) {
    console.warn('Failed to parse feedback score:', error);
    return 0.5; // Return neutral score on error
  }
} 