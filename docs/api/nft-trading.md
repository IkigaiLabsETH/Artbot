# NFT Trading API Reference

This document provides detailed API documentation for the NFT trading automation services.

## ReservoirService

The `ReservoirService` provides integration with the Reservoir Protocol for NFT market data and trading.

### Methods

#### `getCollectionFloor`

Retrieves the current floor price for a collection.

```typescript
async getCollectionFloor(
  collectionAddress: string,
  options?: FloorOptions
): Promise<FloorPrice>
```

**Parameters:**
- `collectionAddress`: The contract address of the NFT collection
- `options`: Optional configuration for the floor price request
  - `currency`: Currency to return prices in (default: 'ETH')
  - `normalized`: Whether to normalize prices across marketplaces (default: true)

**Returns:**
- `FloorPrice` object containing:
  - `price`: The floor price in the requested currency
  - `source`: The marketplace source of the floor price
  - `updatedAt`: Timestamp of when the floor price was last updated

#### `getFloorDepth`

Analyzes the depth of the floor price for a collection.

```typescript
async getFloorDepth(
  collectionAddress: string,
  depthPercentage: number = 0.05
): Promise<FloorDepthResult>
```

**Parameters:**
- `collectionAddress`: The contract address of the NFT collection
- `depthPercentage`: Percentage above floor to analyze (default: 5%)

**Returns:**
- `FloorDepthResult` object containing:
  - `floorPrice`: The current floor price
  - `depthCount`: Number of listings within the depth percentage
  - `pricePoints`: Array of price points and listing counts

#### `executeFloorSweep`

Executes a floor sweep for a collection.

```typescript
async executeFloorSweep(
  collectionAddress: string,
  config: SweepConfig
): Promise<SweepResult>
```

**Parameters:**
- `collectionAddress`: The contract address of the NFT collection
- `config`: Configuration for the sweep operation
  - `budget`: Maximum budget for the sweep
  - `maxPrice`: Maximum price per NFT
  - `quantity`: Maximum number of NFTs to purchase
  - `traits`: Optional trait preferences for targeted sweeping

**Returns:**
- `SweepResult` object containing:
  - `success`: Whether the sweep was successful
  - `purchased`: Array of purchased NFT details
  - `totalSpent`: Total amount spent on the sweep
  - `averagePrice`: Average price per NFT purchased

## TradingService

The `TradingService` handles trading execution and position management.

### Methods

#### `openPosition`

Opens a new trading position.

```typescript
async openPosition(
  config: PositionConfig
): Promise<Position>
```

**Parameters:**
- `config`: Configuration for the position
  - `asset`: Asset to trade (collection address or token address)
  - `type`: Position type ('LONG' or 'SHORT')
  - `size`: Position size in base currency
  - `entryPrice`: Target entry price
  - `stopLoss`: Optional stop loss percentage
  - `takeProfit`: Optional take profit percentage

**Returns:**
- `Position` object containing position details

#### `closePosition`

Closes an existing position.

```typescript
async closePosition(
  positionId: string,
  options?: ClosePositionOptions
): Promise<PositionCloseResult>
```

**Parameters:**
- `positionId`: ID of the position to close
- `options`: Optional configuration for closing
  - `partial`: Percentage of position to close (default: 100%)
  - `forceClose`: Whether to force close regardless of market conditions

**Returns:**
- `PositionCloseResult` object with details of the closed position

#### `getActivePositions`

Retrieves all active trading positions.

```typescript
async getActivePositions(): Promise<Position[]>
```

**Returns:**
- Array of active `Position` objects

#### `suspendTrading`

Suspends all trading activities.

```typescript
async suspendTrading(
  reason: string = 'Manual suspension'
): Promise<void>
```

**Parameters:**
- `reason`: Reason for suspending trading

## TrustScoreService

The `TrustScoreService` calculates and manages trust scores for collections and tokens.

### Methods

#### `calculateCollectionScore`

Calculates a trust score for an NFT collection.

```typescript
async calculateCollectionScore(
  collectionAddress: string
): Promise<TrustScore>
```

**Parameters:**
- `collectionAddress`: The contract address of the NFT collection

**Returns:**
- `TrustScore` object containing:
  - `score`: Numerical score (0-100)
  - `components`: Breakdown of score components
  - `confidence`: Confidence level in the score
  - `updatedAt`: Timestamp of calculation

#### `getCollectionInsights`

Retrieves detailed insights about a collection.

```typescript
async getCollectionInsights(
  collectionAddress: string
): Promise<CollectionInsights>
```

**Parameters:**
- `collectionAddress`: The contract address of the NFT collection

**Returns:**
- `CollectionInsights` object with detailed metrics and analysis

## AnalyticsService

The `AnalyticsService` provides market analysis and opportunity detection.

### Methods

#### `detectMarketInefficiencies`

Detects market inefficiencies across collections.

```typescript
async detectMarketInefficiencies(
  options?: InefficiencyDetectionOptions
): Promise<MarketInefficiency[]>
```

**Parameters:**
- `options`: Optional configuration for detection
  - `minConfidence`: Minimum confidence level (default: 0.7)
  - `collections`: Optional list of collections to analyze
  - `maxResults`: Maximum number of results to return

**Returns:**
- Array of `MarketInefficiency` objects representing detected opportunities

#### `analyzeTrend`

Analyzes price and volume trends for a collection.

```typescript
async analyzeTrend(
  collectionAddress: string,
  timeframe: Timeframe = '24h'
): Promise<TrendAnalysis>
```

**Parameters:**
- `collectionAddress`: The contract address of the NFT collection
- `timeframe`: Timeframe for analysis ('1h', '24h', '7d', '30d')

**Returns:**
- `TrendAnalysis` object with trend indicators and predictions

## Types

### Position

```typescript
interface Position {
  id: string;
  asset: string;
  type: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  openedAt: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
}
```

### TrustScore

```typescript
interface TrustScore {
  score: number;
  components: {
    volume: number;
    holders: number;
    social: number;
    team: number;
    contract: number;
  };
  confidence: number;
  updatedAt: number;
}
```

### MarketInefficiency

```typescript
interface MarketInefficiency {
  type: 'FLOOR_INEFFICIENCY' | 'TRAIT_INEFFICIENCY' | 'CROSS_MARKET_INEFFICIENCY';
  collection: string;
  confidence: number;
  potentialProfit: number;
  potentialProfitPercentage: number;
  details: Record<string, any>;
  detectedAt: number;
}
```

### FloorDepthResult

```typescript
interface FloorDepthResult {
  floorPrice: number;
  depthCount: number;
  pricePoints: Array<{
    price: number;
    count: number;
  }>;
}
```

## Error Handling

All API methods may throw the following errors:

- `TradingServiceError`: Base error class for trading service errors
- `ReservoirApiError`: Error from Reservoir API calls
- `PositionError`: Error related to position management
- `ValidationError`: Error during validation checks
- `RateLimitError`: Error when rate limits are exceeded

Example error handling:

```typescript
try {
  const position = await tradingService.openPosition(config);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof RateLimitError) {
    // Handle rate limit error
  } else {
    // Handle other errors
  }
}
``` 