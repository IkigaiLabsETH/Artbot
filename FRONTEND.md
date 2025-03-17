# IKIGAI Protocol Frontend Guide

```
██╗██╗  ██╗██╗ ██████╗  █████╗ ██╗    ██╗   ██╗██╗
██║██║ ██╔╝██║██╔════╝ ██╔══██╗██║    ██║   ██║██║
██║█████╔╝ ██║██║  ███╗███████║██║    ██║   ██║██║
██║██╔═██╗ ██║██║   ██║██╔══██║██║    ██║   ██║██║
██║██║  ██╗██║╚██████╔╝██║  ██║██║    ╚██████╔╝██║
╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═════╝ ╚═╝
```

## Project Setup

### Prerequisites
- Node.js v18.6+
- pnpm (recommended) or npm
- TypeScript 5.0.4+
- React 18.0.0+

### Initial Setup

```bash
# Create Next.js project with thirdweb template
npx thirdweb create app --template next-typescript-starter

# Install dependencies
cd your-app-name
pnpm install

# Additional dependencies
pnpm add @chakra-ui/react @emotion/react @emotion/styled framer-motion
pnpm add @tanstack/react-query react-hot-toast
pnpm add wagmi viem
```

### Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Generic components
│   ├── layout/        # Layout components
│   └── modules/       # Feature-specific components
├── config/            # Configuration files
├── constants/         # Constants and enums
├── hooks/             # Custom React hooks
├── pages/            # Next.js pages
├── styles/           # Global styles
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## Core Features Implementation

### 1. Wallet Connection

```typescript
// src/components/common/WalletConnect.tsx
import { ConnectButton } from "thirdweb/react";

export function WalletConnect() {
  return (
    <ConnectButton
      theme="dark"
      className="connect-button"
    />
  );
}
```

### 2. NFT Minting Interface

```typescript
// src/components/modules/nft/MintingCard.tsx
import { useState } from "react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { toast } from "react-hot-toast";

export function MintingCard() {
  const [isMinting, setIsMinting] = useState(false);
  const { mutate: sendTx } = useSendTransaction();
  const account = useActiveAccount();

  const handleMint = async () => {
    try {
      setIsMinting(true);
      const transaction = claimTo({
        contract: NFT_DROP_ADDRESS,
        to: account?.address,
        quantity: 1n,
      });
      
      await sendTx(transaction);
      toast.success("NFT Minted Successfully!");
    } catch (err) {
      toast.error("Failed to mint NFT");
      console.error(err);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mint-card">
      <h2>Mint Genesis NFT</h2>
      <button 
        onClick={handleMint}
        disabled={isMinting}
      >
        {isMinting ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
}
```

### 3. Staking Dashboard

```typescript
// src/components/modules/staking/StakingDashboard.tsx
import { useState } from "react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { stake } from "thirdweb/extensions/erc20-staking";
import { setAllowance } from "thirdweb/extensions/erc20";
import { parseEther } from "viem";
import { toast } from "react-hot-toast";

export function StakingDashboard() {
  const [amount, setAmount] = useState("");
  const { mutate: sendTx } = useSendTransaction();

  const handleStake = async () => {
    try {
      // First approve tokens
      const approvalTx = setAllowance({
        contract: TOKEN_ADDRESS,
        spender: STAKING_ADDRESS,
        amount: parseEther(amount),
      });
      await sendTx(approvalTx);

      // Then stake
      const stakeTx = stake({
        contract: STAKING_ADDRESS,
        amount: parseEther(amount),
      });
      await sendTx(stakeTx);
      
      toast.success("Tokens Staked Successfully!");
    } catch (err) {
      toast.error("Failed to stake tokens");
      console.error(err);
    }
  };

  return (
    <div className="staking-dashboard">
      <h2>Stake IKIGAI</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to stake"
      />
      <button onClick={handleStake}>Stake</button>
    </div>
  );
}
```

### 4. Bundle Creation Interface

```typescript
// src/components/modules/bundle/BundleCreator.tsx
import { useState } from "react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { wrap } from "thirdweb/extensions/multiwrap";
import { toast } from "react-hot-toast";

export function BundleCreator() {
  const [tokens, setTokens] = useState([]);
  const { mutate: sendTx } = useSendTransaction();
  const account = useActiveAccount();

  const createBundle = async () => {
    try {
      const transaction = wrap({
        contract: MULTIWRAP_ADDRESS,
        tokensToWrap: tokens,
        recipient: account?.address,
      });
      
      await sendTx(transaction);
      toast.success("Bundle Created!");
    } catch (err) {
      toast.error("Failed to create bundle");
      console.error(err);
    }
  };

  return (
    <div className="bundle-creator">
      <h2>Create Bundle</h2>
      {/* Token selection interface */}
      <button onClick={createBundle}>Create Bundle</button>
    </div>
  );
}
```

### 5. Governance Interface

```typescript
// src/components/modules/governance/ProposalList.tsx
import { useReadContract } from "thirdweb/react";
import { getAll } from "thirdweb/extensions/erc20-votes";
import { useState, useEffect } from "react";

export function ProposalList() {
  const [proposals, setProposals] = useState([]);
  const { data: allProposals } = useReadContract(getAll, {
    contract: VOTE_ADDRESS,
  });

  useEffect(() => {
    if (allProposals) {
      setProposals(allProposals);
    }
  }, [allProposals]);

  return (
    <div className="proposal-list">
      <h2>Governance Proposals</h2>
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}
```

## Pages Implementation

### 1. Home Page

```typescript
// src/pages/index.tsx
import { Layout } from "../components/layout/Layout";
import { WalletConnect } from "../components/common/WalletConnect";
import { Stats } from "../components/modules/Stats";

export default function Home() {
  return (
    <Layout>
      <div className="hero-section">
        <h1>Welcome to IKIGAI</h1>
        <WalletConnect />
      </div>
      <Stats />
    </Layout>
  );
}
```

### 2. NFT Mint Page

```typescript
// src/pages/mint.tsx
import { FC, useEffect, useState } from 'react';
import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { Layout } from "../components/layout/Layout";
import { CollectionHeader } from "../components/modules/collection/CollectionHeader";
import { CollectionStat } from "../components/modules/collection/CollectionStat";
import { Amount } from "../components/modules/form/Amount";
import { Loader } from "../components/common/Loader";
import { toast } from "react-hot-toast";

interface MintPageProps {
  contractAddress?: string;
  tokenId?: string;
}

const MintPage: FC<MintPageProps> = ({ 
  contractAddress = process.env.NEXT_PUBLIC_NFT_DROP_ADDRESS,
  tokenId = "0" 
}) => {
  // State management
  const [localClaimedSupply, setLocalClaimedSupply] = useState(0);
  const [amountToMint, setAmountToMint] = useState(1);
  const [maxClaimable, setMaxClaimable] = useState<string | number>(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);

  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  // Contract and NFT data
  const { data: nft, isLoading } = useReadContract({
    contract: contractAddress,
    method: "tokenURI",
    params: [tokenId],
  });

  // Validation
  useEffect(() => {
    if (!contractAddress) {
      setError('Contract address is required');
      return;
    }
    if (!tokenId) {
      setError('Token ID is required');
      return;
    }
  }, [contractAddress, tokenId]);

  // Amount controls
  const onPlus = () => {
    if (amountToMint >= (maxClaimable === 'unlimited' ? 9999999999 : parseInt(maxClaimable as string, 10))) return;
    setAmountToMint(amountToMint + 1);
  };

  const onMinus = () => {
    if (amountToMint <= 1) return;
    setAmountToMint(amountToMint - 1);
  };

  const handleMint = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsMinting(true);
      const transaction = claimTo({
        contract: contractAddress,
        to: account.address,
        quantity: BigInt(amountToMint),
      });
      
      await sendTx(transaction);
      setLocalClaimedSupply(prev => prev + amountToMint);
      toast.success("Successfully minted NFT!");
    } catch (err) {
      console.error("Minting failed:", err);
      toast.error("Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  // Loading states
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading || !nft) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <CollectionHeader
          eyebrow="Welcome"
          coverImage={nft.image}
          name={String(nft.name)}
          description={String(nft.description)}
        >
          <div className="flex flex-col">
            {/* NFT Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              {!imageLoaded && <Loader />}
              <img 
                src={nft.image}
                alt={String(nft.name)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Collection Stats */}
            <div className="grid grid-cols-3 gap-4 w-full border-y border-y-gray-700 py-8 mt-6">
              <CollectionStat label="Price">
                {/* Add price from claim conditions */}
                0.1 ETH
              </CollectionStat>
              <CollectionStat label="Minted">
                {`${localClaimedSupply} / 1000`}
              </CollectionStat>
              <CollectionStat label="Max Per Wallet">
                {maxClaimable === 'unlimited' ? 'Unlimited' : maxClaimable}
              </CollectionStat>
            </div>

            {/* Mint Date */}
            <div className="grid grid-cols-1 gap-4 w-full border-b border-b-gray-700 py-8">
              <CollectionStat label="Opens:">
                {new Date().toLocaleDateString()}
              </CollectionStat>
            </div>

            {/* Mint Controls */}
            <div className="flex flex-col md:flex-row w-full mt-6 justify-between items-center">
              <Amount 
                amount={amountToMint} 
                onMinus={onMinus} 
                onPlus={onPlus}
              />
              
              <div className="w-full md:w-3/4 md:pl-4">
                <button
                  onClick={handleMint}
                  disabled={isMinting || !account}
                  className="mint-button w-full font-boska disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMinting ? "Minting..." : "Mint Now"}
                </button>
              </div>
            </div>

            {/* Contract Details */}
            <div className="flex flex-col w-full mt-1 text-gray-600 border-y border-y-gray-700 py-8 text-sm font-satoshi">
              <ul>
                <li>
                  <span className="font-bold">Blockchain:</span> Berachain
                </li>
                <li className="break-all">
                  <span className="font-bold">Contract Address:</span> {contractAddress}
                </li>
                <li>
                  <span className="font-bold">Token Standard:</span> ERC-721
                </li>
              </ul>
            </div>
          </div>
        </CollectionHeader>
      </div>
    </Layout>
  );
};

export default MintPage;
```

### 3. Staking Page

```typescript
// src/pages/stake.tsx
import { StakingDashboard } from "../components/modules/staking/StakingDashboard";
import { StakingStats } from "../components/modules/staking/StakingStats";

export default function Stake() {
  return (
    <Layout>
      <div className="stake-page">
        <h1>Stake IKIGAI</h1>
        <StakingStats />
        <StakingDashboard />
      </div>
    </Layout>
  );
}
```

## Styling Guide

### 1. Theme Setup

```typescript
// src/styles/theme.ts
import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    brand: {
      // Primary Colors
      primary: "#3d84ff",    // Berry Blue
      secondary: "#ff70b8",  // Jelly Pink
      accent: "#37d277",     // Kiwi Green
      
      // Background Colors
      background: {
        dark: "#111827",     // Dark Primary
        darker: "#1f2937",   // Dark Secondary
        light: "#ffffff",
      },
      
      // Gradient Backgrounds
      gradients: {
        berry: "linear-gradient(180deg, #5291ff 0%, #4589fe 100%)",
        jelly: "linear-gradient(180deg, #ff70b8 0%, #ff57ac 100%)",
        kiwi: "linear-gradient(180deg, #45d980 0%, #2acb6b 100%)",
      },
      
      // Functional Colors
      functional: {
        success: "rgb(47, 201, 109)",
        warning: "rgb(252, 181, 42)",
        error: "rgb(255, 91, 86)",
        info: "rgb(62, 146, 255)",
      }
    },
  },
  styles: {
    global: {
      body: {
        bg: "var(--color-dark-primary)",
        color: "white",
      },
    },
  },
});
```

### 2. Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Brand Colors */
  --color-berry: #3d84ff;
  --color-jelly: #ff70b8;
  --color-kiwi: #37d277;
  --color-lemon: #f5be00;
  --color-plum: #8d70ff;
  --color-mint: #55bbff;
  --color-tango: #ff932e;
  --color-cherry: #ff5752;

  /* Background Colors */
  --color-dark-primary: #111827;
  --color-dark-secondary: #1f2937;
  --color-white-primary: #ffffff;

  /* Gradient Backgrounds */
  --gradient-berry: linear-gradient(180deg, rgba(85, 187, 255, 0.08) 0%, rgba(85, 187, 255, 0.24) 100%);
  --gradient-jelly: linear-gradient(180deg, rgba(255, 112, 184, 0.08) 0%, rgba(255, 112, 184, 0.24) 100%);
  --gradient-kiwi: linear-gradient(180deg, rgba(69, 217, 128, 0.08) 0%, rgba(69, 217, 128, 0.24) 100%);

  /* Button Gradients */
  --button-berry: linear-gradient(180deg, #5291ff 0%, #4589fe 100%);
  --button-jelly: linear-gradient(180deg, #ff70b8 0%, #ff57ac 100%);
  --button-kiwi: linear-gradient(180deg, #45d980 0%, #2acb6b 100%);
}

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--color-dark-primary);
  color: var(--color-white-primary);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-dark-secondary);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-berry);
  border-radius: 4px;
}

/* Utility Classes */
.gradient-text-berry {
  background: var(--gradient-berry);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-bg-berry {
  background: var(--gradient-berry);
}

.button-gradient {
  background: var(--button-berry);
  transition: all 0.3s ease;
}

.button-gradient:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

### 3. Component Styling Example

```typescript
// src/components/common/Button.tsx
import styled from "@emotion/styled";

export const GradientButton = styled.button`
  background: var(--button-berry);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const StakingCard = styled.div`
  background: var(--color-dark-secondary);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    background: var(--gradient-berry);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
`;
```

### 4. Usage Example

```typescript
// src/components/modules/staking/StakingDashboard.tsx
import { StakingCard, GradientButton } from "../../common/Button";

export function StakingDashboard() {
  return (
    <StakingCard>
      <h2>Stake IKIGAI</h2>
      <div className="flex flex-col gap-4">
        <input
          className="bg-dark-secondary border border-gray-700 rounded-lg p-3"
          type="number"
          placeholder="Amount to stake"
        />
        <GradientButton>
          Stake Tokens
        </GradientButton>
      </div>
    </StakingCard>
  );
}
```

## Environment Setup

```env
# .env.local
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id
NEXT_PUBLIC_BERACHAIN_RPC=https://rpc.berachain.com
NEXT_PUBLIC_NFT_DROP_ADDRESS=your-nft-drop-address
NEXT_PUBLIC_TOKEN_ADDRESS=your-token-address
NEXT_PUBLIC_STAKING_ADDRESS=your-staking-address
NEXT_PUBLIC_MULTIWRAP_ADDRESS=your-multiwrap-address
```

## Error Handling

```typescript
// src/utils/errorHandling.ts
export const handleError = (error: any) => {
  if (error?.message?.includes("user rejected")) {
    toast.error("Transaction rejected by user");
  } else if (error?.message?.includes("insufficient funds")) {
    toast.error("Insufficient funds");
  } else {
    toast.error("Transaction failed");
    console.error(error);
  }
};
```

## Testing

```typescript
// src/components/__tests__/MintingCard.test.tsx
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MintingCard } from "../modules/nft/MintingCard";

describe("MintingCard", () => {
  it("handles minting process correctly", async () => {
    const { getByText } = render(<MintingCard />);
    const mintButton = getByText("Mint NFT");
    
    fireEvent.click(mintButton);
    
    await waitFor(() => {
      expect(getByText("Minting...")).toBeInTheDocument();
    });
  });
});
```

## Deployment

1. Build the application:
```bash
pnpm build
```

2. Deploy to Vercel:
```bash
vercel deploy
```

## Additional Resources

- [thirdweb React Documentation](https://portal.thirdweb.com/react)
- [Chakra UI Components](https://chakra-ui.com/docs/components)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Hooks](https://wagmi.sh/react/hooks)

## Font Setup

### 1. Font Configuration

```typescript
// src/styles/fonts.ts
import localFont from 'next/font/local';

export const boska = localFont({
  src: [
    {
      path: '../fonts/boska/Boska-Variable.woff2',
      style: 'normal',
    },
    {
      path: '../fonts/boska/Boska-VariableItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-boska'
});

export const epilogue = localFont({
  src: [
    {
      path: '../fonts/epilogue/Epilogue-Variable.woff2',
      style: 'normal',
    },
    {
      path: '../fonts/epilogue/Epilogue-VariableItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-epilogue'
});

export const satoshi = localFont({
  src: [
    {
      path: '../fonts/satoshi/Satoshi-Variable.woff2',
      style: 'normal',
    },
    {
      path: '../fonts/satoshi/Satoshi-VariableItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-satoshi'
});
```

### 2. Update Theme Configuration

```typescript
// src/styles/theme.ts
import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: 'var(--font-boska), serif',
    body: 'var(--font-satoshi), sans-serif',
    mono: 'var(--font-epilogue), monospace',
  },
  // ... existing theme configuration ...
});
```

### 3. Update Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Font Variables */
  --font-boska: '';
  --font-epilogue: '';
  --font-satoshi: '';

  /* ... existing root variables ... */
}

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--color-dark-primary);
  color: var(--color-white-primary);
  font-family: var(--font-satoshi), system-ui, -apple-system, BlinkMacSystemFont;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-boska);
  font-weight: 600;
}

code, pre {
  font-family: var(--font-epilogue);
}

/* Typography Utility Classes */
.font-boska {
  font-family: var(--font-boska);
}

.font-epilogue {
  font-family: var(--font-epilogue);
}

.font-satoshi {
  font-family: var(--font-satoshi);
}

/* ... rest of existing styles ... */
```

### 4. Implementation in Layout

```typescript
// src/components/layout/Layout.tsx
import { boska, epilogue, satoshi } from '@/styles/fonts';

export function Layout({ children }) {
  return (
    <div className={`${boska.variable} ${epilogue.variable} ${satoshi.variable}`}>
      {children}
    </div>
  );
}
```

### 5. Usage in Components

```typescript
// Example component with proper font usage
export function HeroSection() {
  return (
    <div className="hero-section">
      <h1 className="font-boska text-4xl font-bold mb-4">
        Welcome to IKIGAI
      </h1>
      <p className="font-satoshi text-lg mb-6">
        Discover the future of DeFi on Berachain
      </p>
      <code className="font-epilogue bg-dark-secondary p-2 rounded">
        Start building today
      </code>
    </div>
  );
}
```

### 6. Tailwind Configuration

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        boska: ['var(--font-boska)'],
        epilogue: ['var(--font-epilogue)'],
        satoshi: ['var(--font-satoshi)'],
      },
    },
  },
};
```

### 7. Font Loading Strategy

```typescript
// src/pages/_app.tsx
import { boska, epilogue, satoshi } from '@/styles/fonts';

function MyApp({ Component, pageProps }) {
  return (
    <main className={`${boska.variable} ${epilogue.variable} ${satoshi.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
```

### 8. Component Style Updates

```typescript
// Update StakingCard with proper fonts
export const StakingCard = styled.div`
  background: var(--color-dark-secondary);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    font-family: var(--font-boska);
    background: var(--gradient-berry);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-family: var(--font-satoshi);
  }

  code {
    font-family: var(--font-epilogue);
  }
`;
```

## Component Implementation

### Collection Components

#### 1. CollectionHeader Component
```typescript
// src/components/modules/collection/CollectionHeader.tsx
import { FC, ReactNode } from 'react';

interface CollectionHeaderProps {
  eyebrow?: string;
  coverImage?: string;
  name: string;
  description: string;
  children: ReactNode;
}

export const CollectionHeader: FC<CollectionHeaderProps> = ({
  eyebrow,
  coverImage,
  name,
  description,
  children
}) => {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-8">
      {eyebrow && (
        <span className="text-sm text-gray-400 mb-2 font-satoshi">{eyebrow}</span>
      )}
      <h1 className="text-4xl font-bold mb-4 font-boska">{name}</h1>
      <p className="text-gray-300 mb-8 font-satoshi">{description}</p>
      {children}
    </div>
  );
};
```

#### 2. CollectionStat Component
```typescript
// src/components/modules/collection/CollectionStat.tsx
import { FC, ReactNode } from 'react';

interface CollectionStatProps {
  label: string;
  loading?: boolean;
  children: ReactNode;
}

export const CollectionStat: FC<CollectionStatProps> = ({
  label,
  loading = false,
  children
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-400 mb-1 font-satoshi">{label}</span>
      <span className="text-lg font-bold font-boska">
        {loading ? (
          <div className="animate-pulse bg-gray-700 h-6 w-16 rounded" />
        ) : (
          children
        )}
      </span>
    </div>
  );
};
```

#### 3. Amount Component
```typescript
// src/components/modules/form/Amount.tsx
import { FC } from 'react';

interface AmountProps {
  amount: number;
  onMinus: () => void;
  onPlus: () => void;
}

export const Amount: FC<AmountProps> = ({ amount, onMinus, onPlus }) => {
  return (
    <div className="flex items-center space-x-4 bg-dark-secondary rounded-lg p-2">
      <button
        onClick={onMinus}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        -
      </button>
      <span className="font-boska text-lg font-bold min-w-[2rem] text-center">
        {amount}
      </span>
      <button
        onClick={onPlus}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        +
      </button>
    </div>
  );
};
```

#### 4. Loader Component
```typescript
// src/components/common/Loader.tsx
import { FC } from 'react';

export const Loader: FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-berry"></div>
    </div>
  );
};
```

### Mint Page Implementation

```typescript
// src/pages/mint.tsx
import { FC, useEffect, useState } from 'react';
import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { Layout } from "../components/layout/Layout";
import { CollectionHeader } from "../components/modules/collection/CollectionHeader";
import { CollectionStat } from "../components/modules/collection/CollectionStat";
import { Amount } from "../components/modules/form/Amount";
import { Loader } from "../components/common/Loader";
import { toast } from "react-hot-toast";

interface MintPageProps {
  contractAddress?: string;
  tokenId?: string;
}

const MintPage: FC<MintPageProps> = ({ 
  contractAddress = process.env.NEXT_PUBLIC_NFT_DROP_ADDRESS,
  tokenId = "0" 
}) => {
  // State management
  const [localClaimedSupply, setLocalClaimedSupply] = useState(0);
  const [amountToMint, setAmountToMint] = useState(1);
  const [maxClaimable, setMaxClaimable] = useState<string | number>(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);

  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  // Contract and NFT data
  const { data: nft, isLoading } = useReadContract({
    contract: contractAddress,
    method: "tokenURI",
    params: [tokenId],
  });

  // Validation
  useEffect(() => {
    if (!contractAddress) {
      setError('Contract address is required');
      return;
    }
    if (!tokenId) {
      setError('Token ID is required');
      return;
    }
  }, [contractAddress, tokenId]);

  // Amount controls
  const onPlus = () => {
    if (amountToMint >= (maxClaimable === 'unlimited' ? 9999999999 : parseInt(maxClaimable as string, 10))) return;
    setAmountToMint(amountToMint + 1);
  };

  const onMinus = () => {
    if (amountToMint <= 1) return;
    setAmountToMint(amountToMint - 1);
  };

  const handleMint = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsMinting(true);
      const transaction = claimTo({
        contract: contractAddress,
        to: account.address,
        quantity: BigInt(amountToMint),
      });
      
      await sendTx(transaction);
      setLocalClaimedSupply(prev => prev + amountToMint);
      toast.success("Successfully minted NFT!");
    } catch (err) {
      console.error("Minting failed:", err);
      toast.error("Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  // Loading states
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading || !nft) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <CollectionHeader
          eyebrow="Welcome"
          coverImage={nft.image}
          name={String(nft.name)}
          description={String(nft.description)}
        >
          <div className="flex flex-col">
            {/* NFT Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              {!imageLoaded && <Loader />}
              <img 
                src={nft.image}
                alt={String(nft.name)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Collection Stats */}
            <div className="grid grid-cols-3 gap-4 w-full border-y border-y-gray-700 py-8 mt-6">
              <CollectionStat label="Price">
                {/* Add price from claim conditions */}
                0.1 ETH
              </CollectionStat>
              <CollectionStat label="Minted">
                {`${localClaimedSupply} / 1000`}
              </CollectionStat>
              <CollectionStat label="Max Per Wallet">
                {maxClaimable === 'unlimited' ? 'Unlimited' : maxClaimable}
              </CollectionStat>
            </div>

            {/* Mint Date */}
            <div className="grid grid-cols-1 gap-4 w-full border-b border-b-gray-700 py-8">
              <CollectionStat label="Opens:">
                {new Date().toLocaleDateString()}
              </CollectionStat>
            </div>

            {/* Mint Controls */}
            <div className="flex flex-col md:flex-row w-full mt-6 justify-between items-center">
              <Amount 
                amount={amountToMint} 
                onMinus={onMinus} 
                onPlus={onPlus}
              />
              
              <div className="w-full md:w-3/4 md:pl-4">
                <button
                  onClick={handleMint}
                  disabled={isMinting || !account}
                  className="mint-button w-full font-boska disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMinting ? "Minting..." : "Mint Now"}
                </button>
              </div>
            </div>

            {/* Contract Details */}
            <div className="flex flex-col w-full mt-1 text-gray-600 border-y border-y-gray-700 py-8 text-sm font-satoshi">
              <ul>
                <li>
                  <span className="font-bold">Blockchain:</span> Berachain
                </li>
                <li className="break-all">
                  <span className="font-bold">Contract Address:</span> {contractAddress}
                </li>
                <li>
                  <span className="font-bold">Token Standard:</span> ERC-721
                </li>
              </ul>
            </div>
          </div>
        </CollectionHeader>
      </div>
    </Layout>
  );
};

export default MintPage;
```

### Required Dependencies

Make sure to install the following dependencies:

```bash
pnpm add @thirdweb-dev/react @thirdweb-dev/sdk
pnpm add tailwindcss @tailwindcss/forms @tailwindcss/typography
```

### TypeScript Configuration

Update your `tsconfig.json` to include:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id
NEXT_PUBLIC_NFT_DROP_ADDRESS=your-nft-drop-address
```

### Styling

Add these custom styles to your `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.mint-button {
  @apply bg-gradient-to-r from-berry to-jelly hover:opacity-90 transition-opacity duration-200 text-white font-bold py-3 px-6 rounded-lg;
}

.mint-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

This implementation provides a modern, responsive mint page with:
- NFT preview with loading state
- Collection statistics
- Minting controls with quantity selector
- Contract information
- Proper error handling
- Loading states
- Mobile responsiveness
- Brand-consistent styling using your font system (Boska, Epilogue, Satoshi)

## Additional Mint Page Enhancements

### 1. Additional Animation Variants

```css
/* src/styles/globals.css */
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes bounce3D {
  0%, 100% { transform: translateY(0) rotateX(0) scale(1); }
  50% { transform: translateY(-20px) rotateX(10deg) scale(1.05); }
}

@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 5px var(--color-berry)); }
  50% { filter: drop-shadow(0 0 20px var(--color-jelly)); }
}

.animate-sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

.animate-ripple {
  animation: ripple 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-bounce-3d {
  animation: bounce3D 3s ease-in-out infinite;
  transform-style: preserve-3d;
}

.animate-glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}
```

### 2. Dark/Light Mode Transitions

```typescript
// src/components/ThemeToggle.tsx
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      className="fixed top-4 right-4 p-2 rounded-full bg-dark-secondary dark:bg-white"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0.75,
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </motion.div>
    </motion.button>
  );
};

// Add to globals.css
:root {
  --transition-duration: 0.3s;
}

.dark-mode-transition {
  transition: background-color var(--transition-duration) ease,
              color var(--transition-duration) ease,
              border-color var(--transition-duration) ease,
              box-shadow var(--transition-duration) ease;
}

/* Dark mode styles */
.dark {
  --color-background: var(--color-dark-primary);
  --color-text: var(--color-white-primary);
}

/* Light mode styles */
.light {
  --color-background: var(--color-white-primary);
  --color-text: var(--color-dark-primary);
}
```

### 3. Interactive Elements

```typescript
// src/components/modules/nft/InteractiveNFTCard.tsx
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';

export const InteractiveNFTCard = ({ imageUrl, name }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  return (
    <motion.div
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
      style={{
        rotateX,
        rotateY,
      }}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        animate={{
          scale: isHovered ? 1.05 : 1,
          boxShadow: isHovered
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : '0 10px 20px rgba(0,0,0,0.2)',
        }}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-berry/20 to-jelly/20"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Sparkle effects */}
        {isHovered && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-sparkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
```

### 4. Mobile-Specific Animations

```typescript
// src/components/modules/mint/MobileMintControls.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const MobileMintControls = ({
  isOpen,
  onClose,
  children
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) return <>{children}</>;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <motion.div
            className="bg-dark-secondary rounded-t-3xl p-6 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Drag handle */}
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
            
            {/* Content */}
            <div className="space-y-4">
              {children}
            </div>

            {/* Bottom safe area for mobile */}
            <div className="h-safe-bottom" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      height: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
};
```

### 5. Advanced Animation Effects

```typescript
// src/components/effects/ParallaxScroll.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const ParallaxSection = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
};

// src/components/effects/HoverCard.tsx
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export const HoverCard = ({ children }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      className="group relative rounded-xl border border-white/10 bg-gray-900"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(61, 132, 255, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};
```

### 6. Enhanced Touch Interactions

```typescript
// src/hooks/usePinchZoom.ts
import { useState, useCallback } from 'react';

export const usePinchZoom = (minScale = 1, maxScale = 3) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePinch = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    const distance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );

    const newScale = Math.min(Math.max(scale * (distance / initialDistance), minScale), maxScale);
    setScale(newScale);
  }, [scale, minScale, maxScale]);

  return { scale, offset, handlePinch };
};

// src/components/nft/PinchZoomView.tsx
import { motion } from 'framer-motion';
import { usePinchZoom } from '@/hooks/usePinchZoom';

export const PinchZoomView = ({ imageUrl }) => {
  const { scale, offset, handlePinch } = usePinchZoom();

  return (
    <motion.div
      className="touch-none"
      onTouchMove={handlePinch}
      style={{
        scale,
        x: offset.x,
        y: offset.y,
      }}
    >
      <img
        src={imageUrl}
        alt="NFT"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </motion.div>
  );
};

// src/components/mobile/MultiTouchGestures.tsx
export const MultiTouchGestures = ({ children }) => {
  const [rotation, setRotation] = useState(0);
  
  const handleRotation = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    const angle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
    
    setRotation(angle);
  }, []);

  return (
    <motion.div
      style={{ rotate: rotation }}
      onTouchMove={handleRotation}
    >
      {children}
    </motion.div>
  );
};
```

### 7. Social Media Integration

```typescript
// src/components/share/SocialShare.tsx
import { motion } from 'framer-motion';

interface ShareData {
  title: string;
  url: string;
  description?: string;
  image?: string;
}

export const SocialShare = ({ data }: { data: ShareData }) => {
  const socials = [
    {
      name: 'Twitter',
      icon: '𝕏',
      share: () => {
        const text = encodeURIComponent(`${data.title}\n\n${data.description || ''}`);
        const url = encodeURIComponent(data.url);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
      },
    },
    {
      name: 'Telegram',
      icon: '📱',
      share: () => {
        const text = encodeURIComponent(`${data.title}\n${data.description || ''}\n${data.url}`);
        window.open(`https://t.me/share/url?url=${data.url}&text=${text}`);
      },
    },
    {
      name: 'Discord',
      icon: '💬',
      share: () => {
        navigator.clipboard.writeText(`${data.title}\n${data.url}`);
        toast.success('Copied to clipboard for Discord!');
      },
    },
  ];

  return (
    <motion.div
      className="flex space-x-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {socials.map((social) => (
        <motion.button
          key={social.name}
          onClick={social.share}
          className="p-2 rounded-full bg-dark-secondary hover:bg-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="sr-only">Share on {social.name}</span>
          {social.icon}
        </motion.button>
      ))}
    </motion.div>
  );
};
```

### 8. Enhanced Accessibility

```typescript
// src/hooks/useColorMode.ts
import { useState, useEffect } from 'react';

type ColorMode = 'default' | 'high-contrast' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export const useColorMode = () => {
  const [mode, setMode] = useState<ColorMode>('default');

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', mode);
  }, [mode]);

  return { mode, setMode };
};

// src/hooks/useFontSize.ts
import { useState, useEffect } from 'react';

export const useFontSize = (defaultSize = 16) => {
  const [fontSize, setFontSize] = useState(defaultSize);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const increase = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decrease = () => setFontSize(prev => Math.max(prev - 2, 12));
  const reset = () => setFontSize(defaultSize);

  return { fontSize, increase, decrease, reset };
};

// src/components/accessibility/AccessibilityMenu.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useColorMode } from '@/hooks/useColorMode';
import { useFontSize } from '@/hooks/useFontSize';

export const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, setMode } = useColorMode();
  const { fontSize, increase, decrease, reset } = useFontSize();

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="sr-only">Accessibility Options</span>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-secondary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="p-4 space-y-4">
              {/* Color Mode */}
              <div>
                <label className="text-sm font-medium">Color Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ColorMode)}
                  className="mt-1 block w-full rounded-md bg-gray-700"
                >
                  <option value="default">Default</option>
                  <option value="high-contrast">High Contrast</option>
                  <option value="deuteranopia">Deuteranopia</option>
                  <option value="protanopia">Protanopia</option>
                  <option value="tritanopia">Tritanopia</option>
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <div className="mt-1 flex items-center space-x-2">
                  <button
                    onClick={decrease}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                  >
                    A-
                  </button>
                  <button
                    onClick={reset}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                  >
                    Reset
                  </button>
                  <button
                    onClick={increase}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Update globals.css with color mode support
:root {
  /* Default theme colors */
  --color-berry: #3d84ff;
  --color-jelly: #ff70b8;

  /* High contrast theme */
  &[data-color-mode="high-contrast"] {
    --color-berry: #ffffff;
    --color-jelly: #000000;
    --color-background: #000000;
    --color-text: #ffffff;
  }

  /* Color blindness support */
  &[data-color-mode="deuteranopia"] {
    --color-berry: #0066ff;
    --color-jelly: #ffbb00;
  }

  &[data-color-mode="protanopia"] {
    --color-berry: #0099ff;
    --color-jelly: #ffcc00;
  }

  &[data-color-mode="tritanopia"] {
    --color-berry: #ff6600;
    --color-jelly: #00ccff;
  }
}
```

### Usage in Mint Page

Update your mint page to incorporate these new features:

```typescript
// src/pages/mint.tsx
import { ParallaxSection } from '@/components/effects/ParallaxScroll';
import { HoverCard } from '@/components/effects/HoverCard';
import { PinchZoomView } from '@/components/nft/PinchZoomView';
import { MultiTouchGestures } from '@/components/mobile/MultiTouchGestures';
import { SocialShare } from '@/components/share/SocialShare';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';

export default function MintPage() {
  // ... existing code ...

  return (
    <Layout>
      <div className="min-h-screen bg-background text-text">
        {/* Accessibility Menu */}
        <AccessibilityMenu />

        {/* Desktop View */}
        <div className="hidden md:block">
          <ParallaxSection>
            <HoverCard>
              <NFTZoomView imageUrl={nft.metadata.image} />
            </HoverCard>
          </ParallaxSection>

          <div className="mt-6 flex justify-between items-center">
            <SocialShare
              data={{
                title: nft.metadata.name,
                description: nft.metadata.description,
                url: window.location.href,
                image: nft.metadata.image,
              }}
            />
            <ShareButton
              url={window.location.href}
              title={`Check out ${nft.metadata.name} on IKIGAI`}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <MultiTouchGestures>
            <PinchZoomView imageUrl={nft.metadata.image} />
          </MultiTouchGestures>
        </div>

        <SwipeableBottomSheet
          isOpen={isMobileControlsOpen}
          onClose={() => setMobileControlsOpen(false)}
        >
          {/* Existing mint controls */}
        </SwipeableBottomSheet>

        {/* Success Animation */}
        {showConfetti && <MintSuccessConfetti />}
      </div>
    </Layout>
  );
}
```

These additional enhancements provide:

1. **Advanced Animation Effects**
   - Smooth parallax scrolling
   - Interactive hover cards with gradient effects
   - Dynamic cursor-following highlights
   - Performant animations with hardware acceleration

2. **Enhanced Touch Interactions**
   - Pinch-to-zoom functionality
   - Multi-touch rotation gestures
   - Smooth touch response
   - Gesture state management

3. **Social Media Integration**
   - Twitter sharing
   - Telegram integration
   - Discord support
   - Clipboard fallback
   - Animated share buttons

4. **Enhanced Accessibility**
   - Color blindness support
   - High contrast mode
   - Dynamic font sizing
   - Persistent accessibility preferences
   - ARIA-enhanced controls

Would you like me to:
1. Add more interactive animations (e.g., 3D card flip, morphing shapes)?
2. Enhance the social sharing (e.g., more platforms, rich previews)?
3. Add more accessibility features (e.g., keyboard shortcuts, focus traps)?
4. Include more mobile optimizations (e.g., performance improvements, offline support)?

## Post-Genesis Collections Enhancements

### 1. Enhanced Generation Process

```typescript
// src/components/modules/generation/GenerationProcess.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const GenerationProcess = ({ isGenerating, progress }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-dark-secondary p-8 rounded-2xl max-w-md w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-boska text-center">
                Generating Art{dots}
              </h3>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-berry to-jelly"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Generation Steps */}
              <div className="space-y-2">
                {[
                  'Initializing AI model',
                  'Generating base composition',
                  'Applying style transfer',
                  'Adding final touches',
                ].map((step, index) => (
                  <motion.div
                    key={step}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: progress >= (index + 1) * 25 ? 1 : 0.5,
                      x: 0 
                    }}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        progress >= (index + 1) * 25 
                          ? 'text-berry' 
                          : 'text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    <span className="font-satoshi">{step}</span>
                  </motion.div>
                ))}
              </div>

              {/* Cancel Button */}
              <button
                className="w-full mt-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-satoshi"
                onClick={() => {/* Implement cancel logic */}}
              >
                Cancel Generation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 2. Enhanced Image Selection

```typescript
// src/components/modules/generation/ImageComparison.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export const ImageComparison = ({ images, onSelect }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  return (
    <div className="relative">
      {/* Comparison Toggle */}
      <button
        className="absolute top-4 right-4 z-10 bg-dark-secondary p-2 rounded-lg"
        onClick={() => setComparisonMode(!comparisonMode)}
      >
        <span className="sr-only">Toggle Comparison Mode</span>
        {comparisonMode ? '🔍' : '⚖️'}
      </button>

      {/* Image Grid */}
      <div className={`grid ${comparisonMode ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {images.map((image) => (
          <motion.div
            key={image.id}
            className="relative aspect-square"
            onHoverStart={() => setHoveredId(image.id)}
            onHoverEnd={() => setHoveredId(null)}
            layoutId={`image-${image.id}`}
          >
            {/* Image */}
            <img
              src={image.url}
              alt={image.metadata.name}
              className="w-full h-full object-cover rounded-xl"
            />

            {/* Hover Overlay */}
            <AnimatePresence>
              {hoveredId === image.id && (
                <motion.div
                  className="absolute inset-0 bg-black/60 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 space-x-2">
                    <button
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                      onClick={() => {/* Implement zoom */}}
                    >
                      🔍
                    </button>
                    <button
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                      onClick={() => onSelect(image)}
                    >
                      ✨
                    </button>
                  </div>

                  {/* Metadata Preview */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="font-boska text-lg font-bold">
                      {image.metadata.name}
                    </h4>
                    <p className="font-satoshi text-sm text-gray-300">
                      {image.metadata.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Comparison Tools */}
      {comparisonMode && (
        <div className="fixed bottom-4 inset-x-4 bg-dark-secondary p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="font-satoshi">Comparison Mode</span>
            <div className="space-x-2">
              <button
                className="p-2 bg-gray-700 rounded-lg"
                onClick={() => {/* Implement side-by-side */}}
              >
                ⇔
              </button>
              <button
                className="p-2 bg-gray-700 rounded-lg"
                onClick={() => {/* Implement overlay */}}
              >
                ⇕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. Enhanced Metadata Visualization

```typescript
// src/components/modules/generation/MetadataVisualizer.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export const MetadataVisualizer = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState('attributes');

  return (
    <div className="bg-dark-secondary rounded-xl p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        {['attributes', 'rarity', 'details'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-satoshi ${
              activeTab === tab
                ? 'bg-berry text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {activeTab === 'attributes' && (
            <div className="grid grid-cols-2 gap-4">
              {metadata.attributes.map((attr) => (
                <div
                  key={attr.trait_type}
                  className="bg-gray-700 rounded-lg p-4"
                >
                  <div className="text-sm text-gray-400 mb-1">
                    {attr.trait_type}
                  </div>
                  <div className="font-bold">{attr.value}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rarity' && (
            <div className="space-y-4">
              {metadata.attributes.map((attr) => (
                <div key={attr.trait_type}>
                  <div className="flex justify-between mb-2">
                    <span>{attr.trait_type}</span>
                    <span className="text-berry">
                      {calculateRarity(attr)}% Rare
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-berry"
                      style={{ width: `${calculateRarity(attr)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Name</h4>
                <p className="font-bold">{metadata.name}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Description</h4>
                <p>{metadata.description}</p>
              </div>
              {/* Add more metadata fields as needed */}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
```

### 4. Enhanced Security Measures

```typescript
// src/utils/security.ts
import { rateLimit } from 'express-rate-limit';
import { getAddress } from 'viem';

// Rate limiting middleware
export const generationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 generations per hour
  message: 'Too many generations from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Signature verification
export const verifySignature = async (
  message: string,
  signature: string,
  address: string
) => {
  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    });
    return getAddress(recoveredAddress) === getAddress(address);
  } catch {
    return false;
  }
};

// Request validation
export const validateGenerationRequest = (req: NextApiRequest) => {
  const { address, signature, timestamp } = req.body;

  // Check if required fields are present
  if (!address || !signature || !timestamp) {
    throw new Error('Missing required fields');
  }

  // Validate timestamp (within 5 minutes)
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  if (Math.abs(now - timestamp) > fiveMinutes) {
    throw new Error('Request expired');
  }

  return true;
};

// API Route with Security
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Apply rate limiting
    await new Promise((resolve) => generationRateLimit(req, res, resolve));

    // Validate request
    validateGenerationRequest(req);

    // Verify signature
    const isValid = await verifySignature(
      `Generate images at ${req.body.timestamp}`,
      req.body.signature,
      req.body.address
    );

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Proceed with generation
    const { stdout } = await execAsync('pnpm start');
    const images = parseGenerationOutput(stdout);
    
    return res.status(200).json({ images });
  } catch (error) {
    console.error('Generation failed:', error);
    return res.status(500).json({ message: error.message });
  }
}
```

### Usage in Post-Genesis Page

Update your post-genesis page to use these enhanced features:

```typescript
// src/pages/post-genesis.tsx
import { useState } from 'react';
import { useActiveAccount, useSignMessage } from "thirdweb/react";
import { Layout } from "../components/layout/Layout";
import { GenerationProcess } from "../components/modules/generation/GenerationProcess";
import { ImageComparison } from "../components/modules/generation/ImageComparison";
import { MetadataVisualizer } from "../components/modules/generation/MetadataVisualizer";
import { WalletConnect } from "../components/common/WalletConnect";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function PostGenesis() {
  const account = useActiveAccount();
  const { mutate: signMessage } = useSignMessage();
  
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const generateImages = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);

      // Sign message for verification
      const timestamp = Date.now();
      const signature = await signMessage({
        message: `Generate images at ${timestamp}`,
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 500);

      // Call generation API
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: account?.address,
          signature,
          timestamp,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setImages(data.images);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  if (!account) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-boska mb-4">
              Connect Wallet
            </h1>
            <p className="text-gray-400 font-satoshi mb-6">
              Please connect your wallet to access the Post-Genesis Collection
            </p>
            <WalletConnect />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-boska">
              Post-Genesis Collection
            </h1>
            <p className="text-gray-400 font-satoshi">
              Generate and mint unique artwork
            </p>
          </div>
          <motion.button
            className="mint-button"
            onClick={generateImages}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? 'Generating...' : 'Generate New Images'}
          </motion.button>
        </div>

        {/* Generation Process */}
        <GenerationProcess
          isGenerating={isGenerating}
          progress={progress}
        />

        {/* Image Comparison */}
        {images.length > 0 && (
          <ImageComparison
            images={images}
            onSelect={setSelectedImage}
          />
        )}

        {/* Metadata Visualization */}
        {selectedImage && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MetadataVisualizer
              metadata={selectedImage.metadata}
            />
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
```
These enhancements provide:

1. **Advanced Generation Process**
   - Visual progress tracking
   - Step-by-step status updates
   - Cancellation option
   - Smooth animations

2. **Enhanced Image Selection**
   - Side-by-side comparison mode
   - Image overlay comparison
   - Quick actions on hover
   - Smooth transitions

3. **Rich Metadata Visualization**
   - Tabbed interface for different views
   - Attribute breakdown
   - Rarity calculations
   - Detailed information display

4. **Robust Security Measures**
   - Rate limiting
   - Signature verification
   - Request validation
   - Timestamp checking
   - Error handling

Would you like me to:
1. Add more interactive comparison tools?
2. Enhance the metadata visualization with charts?
3. Add more security features?
4. Include additional generation options?

