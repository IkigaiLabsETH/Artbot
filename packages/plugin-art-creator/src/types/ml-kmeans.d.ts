declare module 'ml-kmeans' {
  export interface KMeansOptions {
    maxIterations?: number;
    tolerance?: number;
    distanceFunction?: (a: number[], b: number[]) => number;
    seed?: number;
  }

  export interface KMeansResult {
    clusters: number[];
    centroids: number[][];
    iterations: number;
    converged: boolean;
  }

  export class KMeans {
    constructor(options?: KMeansOptions);
    cluster(data: number[][], k: number): KMeansResult;
  }
} 