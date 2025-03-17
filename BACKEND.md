# IKIGAI Protocol Backend Deployment Guide

## Overview

This guide details the deployment process for the IKIGAI Protocol's art generation backend service using decentralized infrastructure. The backend handles secure image generation requests using Node.js/TypeScript and returns the results to the frontend.

## Prerequisites

- Node.js v18.6+
- pnpm (recommended) or npm
- TypeScript 5.0.4+
- IPFS (for decentralized storage)
- Fleek account (for deployment)

## Project Structure

```
backend/
├── src/
│   ├── api/              # API routes
│   ├── services/         # Business logic
│   │   └── generation/   # Art generation service
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── scripts/             # Art generation scripts in TypeScript
├── .fleek.json         # Fleek configuration
├── package.json        # Node.js dependencies
└── tsconfig.json       # TypeScript configuration
```

## Local Development Setup

1. **Install Dependencies**

```bash
# Install dependencies
pnpm install

# Install IPFS CLI (optional, for local testing)
npm install -g ipfs
```

2. **Environment Configuration**

Create a `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=http://localhost:3000

# IPFS Configuration
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your-project-id
IPFS_PROJECT_SECRET=your-project-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# Art Generation
GENERATION_TIMEOUT_MS=60000
MAX_CONCURRENT_GENERATIONS=2
```

3. **Start Development Server**

```bash
# Start the backend server
pnpm dev

# In a separate terminal, start local IPFS node (optional)
ipfs daemon
```

## Decentralized Deployment

### 1. Fleek Setup

1. Create a Fleek account at https://fleek.co
2. Connect your GitHub repository
3. Create a new site/deployment

Configure your `.fleek.json`:

```json
{
  "site": {
    "id": "your-site-id",
    "team": "your-team-name",
    "platform": "ipfs",
    "buildCommand": "pnpm build",
    "publicDir": "dist",
    "baseDir": "backend"
  },
  "build": {
    "image": "node:18",
    "command": "pnpm install && pnpm build",
    "publicDir": "dist",
    "environment": {
      "NODE_VERSION": "18"
    }
  }
}
```

### 2. IPFS Storage Integration

```typescript
// src/services/storage/ipfs.ts
import { create, IPFSHTTPClient } from 'ipfs-http-client';

const auth = Buffer.from(
  `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
).toString('base64');

const ipfs: IPFSHTTPClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${auth}`,
  },
});

export const uploadToIPFS = async (data: Buffer): Promise<string> => {
  const result = await ipfs.add(data);
  return result.path;
};

export const getFromIPFS = async (cid: string): Promise<Buffer> => {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
```

### 3. Art Generation Service

```typescript
// src/services/generation/artGenerator.ts
import { createCanvas, loadImage } from 'canvas';
import { uploadToIPFS } from '../storage/ipfs';

export class ArtGenerator {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number = 1024, height: number = 1024) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
  }

  async generateArt(params: GenerationParams): Promise<string> {
    // Your existing art generation logic here
    // This is where you'd implement your current Node.js art generation code
    
    // Convert canvas to buffer
    const buffer = this.canvas.toBuffer('image/png');
    
    // Upload to IPFS
    const ipfsHash = await uploadToIPFS(buffer);
    return ipfsHash;
  }
}
```

## API Implementation

### 1. Generation Endpoint

```typescript
// src/api/routes/generation.ts
import { Router } from 'express';
import { ArtGenerator } from '../services/generation/artGenerator';
import { authMiddleware, rateLimiter } from '../middleware';

const router = Router();
const generator = new ArtGenerator();

router.post('/generate', 
  authMiddleware,
  rateLimiter,
  async (req, res) => {
    try {
      const ipfsHash = await generator.generateArt(req.body);
      res.json({ 
        success: true, 
        ipfsHash,
        url: `https://ipfs.io/ipfs/${ipfsHash}`
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

export default router;
```

## Decentralized Hosting Options

1. **Fleek**
   - IPFS & Filecoin integration
   - Automatic deployments
   - Edge hosting
   - Built-in CDN

2. **Spheron**
   - Multi-chain deployment
   - IPFS/Arweave storage
   - Automatic scaling

3. **4EVERLAND**
   - IPFS hosting
   - Serverless computing
   - Edge network

## Security Considerations

### 1. API Authentication

```typescript
// src/middleware/auth.ts
import { verifyMessage } from 'ethers';

export const authMiddleware = async (req, res, next) => {
  try {
    const { signature, message, address } = req.headers;
    const recoveredAddress = verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Invalid signature');
    }
    
    req.user = { address };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication' });
  }
};
```

### 2. Rate Limiting

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const generationLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many generation requests, please try again later'
});
```

## Monitoring and Logging

```typescript
// src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Usage
logger.info('Generation started', { params });
logger.error('Generation failed', { error });
```

## Health Checks

```typescript
// src/routes/health.ts
import express from 'express';
import { ipfs } from '../services/storage/ipfs';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check IPFS connection
    await ipfs.id();
    
    // Check art generation service
    const generator = new ArtGenerator();
    await generator.healthCheck();

    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

export default router;
```

## Additional Resources

- [Fleek Documentation](https://docs.fleek.co/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) 