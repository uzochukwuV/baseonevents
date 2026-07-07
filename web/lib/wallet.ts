// Wallet connection utilities for Zama SDK integration

import { mainnet, sepolia } from "viem/chains";
import type { Address } from "viem";

// Supported chains
export const SUPPORTED_CHAINS = {
  mainnet,
  sepolia,
} as const;

// Wallet state interface
export interface WalletState {
  address: Address | null;
  isConnected: boolean;
  chainId: number | null;
}

// Get current connected address from browser wallet
export async function getConnectedAddress(): Promise<Address | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as Address[];

    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

// Check if wallet is connected
export async function isWalletConnected(): Promise<boolean> {
  const address = await getConnectedAddress();
  return address !== null;
}

// Request wallet connection
export async function connectWallet(
  chain: typeof mainnet | typeof sepolia = sepolia
): Promise<Address> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum wallet detected");
  }

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as Address[];

    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    // Switch to correct chain if needed
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    const expectedChainId = `0x${chain.id.toString(16)}`;
    if (currentChainId !== expectedChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: expectedChainId }],
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: expectedChainId,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.default.http[0]],
                blockExplorerUrls: chain.blockExplorers?.default.url
                  ? [chain.blockExplorers.default.url]
                  : undefined,
              },
            ],
          });
        }
      }
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("Connection rejected by user");
    }
    throw error;
  }
}

// Get wallet state
export async function getWalletState(): Promise<WalletState> {
  const address = await getConnectedAddress();
  
  let chainId: number | null = null;
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const chainIdHex = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;
      chainId = parseInt(chainIdHex, 16);
    } catch {
      chainId = null;
    }
  }

  return {
    address,
    isConnected: address !== null,
    chainId,
  };
}

// Sign message with connected wallet
export async function signMessage(message: string): Promise<`0x${string}`> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet connected");
  }

  const accounts = (await window.ethereum.request({
    method: "eth_accounts",
  })) as Address[];

  if (accounts.length === 0) {
    throw new Error("No wallet connected");
  }

  const signature = (await window.ethereum.request({
    method: "personal_sign",
    params: [message, accounts[0]],
  })) as `0x${string}`;

  return signature;
}

// Listen for account changes
export function onAccountsChanged(callback: (accounts: Address[]) => void): () => void {
  if (typeof window === "undefined" || !window.ethereum) {
    return () => {};
  }

  const ethereum = window.ethereum;
  const handler = (...args: unknown[]) => {
    callback(args[0] as Address[]);
  };

  ethereum.on("accountsChanged", handler);

  return () => {
    ethereum.removeListener("accountsChanged", handler);
  };
}

// Listen for chain changes
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (typeof window === "undefined" || !window.ethereum) {
    return () => {};
  }

  const ethereum = window.ethereum;
  const handler = (...args: unknown[]) => {
    callback(args[0] as string);
  };

  ethereum.on("chainChanged", handler);

  return () => {
    ethereum.removeListener("chainChanged", handler);
  };
}

// Watch wallet connection state
export function watchWalletState(
  callback: (state: WalletState) => void
): () => void {
  let cleanupAccounts: (() => void) | null = null;
  let cleanupChain: (() => void) | null = null;

  const updateState = async () => {
    const state = await getWalletState();
    callback(state);
  };

  cleanupAccounts = onAccountsChanged(updateState);
  cleanupChain = onChainChanged(updateState);

  // Initial state
  updateState();

  return () => {
    cleanupAccounts?.();
    cleanupChain?.();
  };
}

// Ethereum window type augmentation
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
