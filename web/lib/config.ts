// Zama SDK configuration utilities for FHE-enabled dApps

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem";
import { sepolia, mainnet } from "viem/chains";
import type { PublicClient, WalletClient } from "viem";

// Import Zama SDK types (installed separately)
import type { FheChain } from "@zama-fhe/sdk/chains";
import { sepolia as sepoliaFhe, mainnet as mainnetFhe } from "@zama-fhe/sdk/chains";

// Network configurations
export interface NetworkConfig {
  chain: typeof sepolia | typeof mainnet;
  fheChain: FheChain;
  rpcUrl: string;
  relayerUrl: string;
}

// Default network configs
export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    chain: sepolia,
    fheChain: sepoliaFhe,
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 
            "https://blockchain.googleapis.com/v1/projects/rational-iris-463811-b2/locations/us-central1/endpoints/ethereum-sepolia/rpc?key=AIzaSyCipaYPhJw_qcniL_QAjemWuszkfEB1Lfw",
    relayerUrl: process.env.NEXT_PUBLIC_SEPOLIA_RELAYER_URL || "https://relayer.sepolia.zama.dev",
  },
  mainnet: {
    chain: mainnet,
    fheChain: mainnetFhe,
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com",
    relayerUrl: process.env.NEXT_PUBLIC_MAINNET_RELAYER_URL || "https://relayer.zama.dev",
  },
} as const;

// Create public client for network
export function createPublicClientForNetwork(
  network: keyof typeof NETWORKS = "sepolia"
): PublicClient {
  const config = NETWORKS[network];
  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}

// Create wallet client from browser
export function createWalletClientFromBrowser(
  network: keyof typeof NETWORKS = "sepolia"
): WalletClient {
  const config = NETWORKS[network];
  
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Browser wallet not available");
  }

  return createWalletClient({
    chain: config.chain,
    transport: custom(window.ethereum),
  });
}

/**
 * Get chain config for Zama SDK
 */
export function getZamaChain(
  network: keyof typeof NETWORKS = "sepolia"
): FheChain {
  const config = NETWORKS[network];
  return {
    ...config.fheChain,
    relayerUrl: config.relayerUrl,
  } as FheChain;
}

// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
} as const;

// Supported token decimals
export const TOKEN_DECIMALS = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
  WETH: 18,
} as const;
