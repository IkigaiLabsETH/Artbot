# NFT Trading Automation

This guide provides comprehensive documentation for working with the NFT trading automation features in the ArtBot platform.

## Overview

The NFT trading automation system enables autonomous trading strategies for NFT collections, focusing on:

- Floor price analysis and sweeping
- Trust score calculation for collections and tokens
- Market inefficiency detection
- Position management with risk-adjusted sizing
- Real-time monitoring and error recovery

## Architecture

The trading automation is built on a modular architecture:

```
/packages/plugin-nft-collections
  /src
    /services         // Core services & Reservoir integration
      /reservoir     // Reservoir API integration
      /jupiter      // Token swap integration
      /trading      // Trading execution logic
      /analytics   // Market analysis services
    /evaluators    // Market analysis & opportunity detection
    /actions      // Trading action implementations
    /providers    // Data providers & external integrations
    /utils        // Shared utilities & helpers
    /types       // TypeScript type definitions
    /constants   // Shared constants & configs
```

## Core Components

### Token Provider

The Token Provider manages market data and performs validation:

- Retrieves and caches token data (5-minute TTL)
- Validates token security parameters
- Analyzes holder distribution
- Tracks historical price data

```typescript
// Example token validation
const validateToken = async (tokenAddress: string): Promise<ValidationResult> => {
  const tokenData = await tokenProvider.getTokenData(tokenAddress);
  
  // Apply validation rules
  if (tokenData.marketCap < SAFETY_LIMITS.MIN_MARKET_CAP) {
    return { valid: false, reason: 'Market cap too low' };
  }
  
  if (tokenData.liquidity < SAFETY_LIMITS.MIN_LIQUIDITY) {
    return { valid: false, reason: 'Insufficient liquidity' };
  }
  
  // Check holder concentration
  if (tokenData.topHolderPercentage > SAFETY_LIMITS.MAX_TOP_HOLDER_CONCENTRATION) {
    return { valid: false, reason: 'Top holder concentration too high' };
  }
  
  return { valid: true };
};
```

### Position Management

The Position Manager handles:

- Order book tracking
- Position sizing based on liquidity
- Risk-adjusted entry and exit
- P&L calculation

```typescript
// Example position sizing
const calculatePositionSize = (
  availableFunds: number,
  tokenLiquidity: number,
  riskScore: number
): number => {
  // Base position size as percentage of available funds
  let positionSize = availableFunds * SAFETY_LIMITS.MAX_POSITION_SIZE;
  
  // Adjust based on liquidity
  const liquidityFactor = Math.min(1, tokenLiquidity / SAFETY_LIMITS.TARGET_LIQUIDITY);
  positionSize *= liquidityFactor;
  
  // Adjust based on risk score (0-1, lower is riskier)
  positionSize *= riskScore;
  
  return positionSize;
};
```

### Floor Sweeping

The Floor Sweeping system:

- Detects thin floors (low listing count at floor price)
- Identifies undervalued NFTs based on rarity and traits
- Executes sweep strategies with configurable parameters
- Manages position exit based on market conditions

```typescript
// Example floor detection
const detectThinFloor = async (
  collectionAddress: string,
  depthThreshold: number = 5
): Promise<boolean> => {
  const floorData = await reservoirService.getFloorDepth(collectionAddress);
  
  // Check if floor is thin (few listings at floor price)
  const isFloorThin = floorData.depthCount < depthThreshold;
  
  return isFloorThin;
};
```

## Safety Parameters

The system enforces strict safety parameters to manage risk:

```typescript
const SAFETY_LIMITS = {
  MAX_POSITION_SIZE: 0.1,  // 10% of portfolio
  MAX_SLIPPAGE: 0.05,     // 5% slippage
  MIN_LIQUIDITY: 1000,    // $1000 minimum liquidity
  MIN_MARKET_CAP: 100000, // $100k minimum market cap
  MAX_PRICE_IMPACT: 0.03, // 3% price impact
  STOP_LOSS: 0.15,        // 15% stop loss
  TARGET_LIQUIDITY: 10000, // $10k target liquidity
  MAX_TOP_HOLDER_CONCENTRATION: 0.5, // 50% max concentration
};
```

## Trust Score Calculation

The Trust Score system evaluates collections and tokens based on:

- Historical trading volume and patterns
- Holder distribution metrics
- Social sentiment analysis
- Team background verification
- Smart contract security audits

```typescript
// Example trust score calculation
const calculateTrustScore = (
  collection: CollectionData,
  socialData: SocialData,
  contractAudit: AuditData
): number => {
  let score = 0;
  const weights = {
    volume: 0.2,
    holders: 0.15,
    social: 0.25,
    team: 0.15,
    contract: 0.25
  };
  
  // Volume score (0-1)
  const volumeScore = Math.min(collection.volume / 1000, 1);
  
  // Holder distribution score (0-1)
  const holderScore = 1 - (collection.topHolderPercentage / 0.5);
  
  // Social sentiment score (0-1)
  const socialScore = (socialData.positiveRatio + socialData.engagementRate) / 2;
  
  // Team verification score (0-1)
  const teamScore = collection.teamVerified ? 1 : 0.5;
  
  // Contract audit score (0-1)
  const contractScore = contractAudit.verified ? 1 : 0.3;
  
  // Weighted average
  score = (
    volumeScore * weights.volume +
    holderScore * weights.holders +
    socialScore * weights.social +
    teamScore * weights.team +
    contractScore * weights.contract
  );
  
  return score;
};
```

## Error Recovery

The system implements robust error recovery procedures:

1. Immediate trade suspension on critical errors
2. Automatic position closure for risk mitigation
3. System state reset procedures
4. Admin notifications for manual intervention

```typescript
// Example error recovery
const handleTradingError = async (
  error: Error,
  activePositions: Position[]
): Promise<void> => {
  // Log error
  logger.error('Trading error detected', { error, positions: activePositions });
  
  // Suspend trading
  await tradingService.suspendTrading();
  
  // Close positions if critical error
  if (isCriticalError(error)) {
    for (const position of activePositions) {
      await tradingService.closePosition(position.id);
    }
  }
  
  // Notify admins
  await notificationService.notifyAdmins({
    type: 'ERROR',
    message: `Trading error: ${error.message}`,
    data: { error, positions: activePositions }
  });
  
  // Reset system state if needed
  if (requiresStateReset(error)) {
    await systemService.resetState();
  }
};
```

## Contributing to NFT Trading Automation

When contributing to the NFT trading automation features, please follow these guidelines:

1. **Safety First**: All changes must maintain or improve the safety mechanisms
2. **Performance Matters**: Trading code must be optimized for speed and efficiency
3. **Test Thoroughly**: Include tests with realistic market conditions
4. **Document Changes**: Update this guide with any architectural changes

### Pull Request Requirements

PRs related to trading functionality must include:

1. Detailed explanation of algorithm changes
2. Performance benchmarks (before/after)
3. Risk assessment
4. Test coverage for new functionality
5. Documentation updates

## API Reference

For detailed API documentation of the trading services, see the [API Documentation](../api/nft-trading.md).

## Troubleshooting

Common issues and their solutions:

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Failed trades | Slippage too low | Increase MAX_SLIPPAGE parameter |
| Position sizing errors | Insufficient liquidity | Check MIN_LIQUIDITY threshold |
| Trust score inaccuracy | Outdated social data | Refresh social data cache |
| System suspension | Critical error triggered | Check logs and reset state |

## Further Reading

- [Reservoir Protocol Documentation](https://docs.reservoir.tools/)
- [NFT Market Analysis Guide](https://docs.example.com/nft-analysis)
- [Risk Management Best Practices](https://docs.example.com/risk-management) 