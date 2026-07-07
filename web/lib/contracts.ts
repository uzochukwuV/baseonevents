// Smart contract interaction utilities for MinorityWins with FHE support

import type { Address, Hash, PublicClient, WalletClient, Chain } from "viem";
import type { GameInfo, GameStatus, GameCreateParams } from "./types";

// Note: Zama SDK should be initialized via @zama-fhe/react-sdk hooks
// This file provides the ABIs and helper functions for contract interactions

// ERC20 ABI fragment for common operations
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;

// MinorityWins ABI
export const MINORITY_WINS_ABI = [
  {
    name: "createGame",
    type: "function",
    inputs: [
      { name: "question", type: "string" },
      { name: "stakeToken", type: "address" },
      { name: "stake", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
    ],
    outputs: [{ name: "gameId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "submitPick",
    type: "function",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "encryptedChoice", type: "bytes" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "requestTallyReveal",
    type: "function",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "resolveGame",
    type: "function",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "clearCounts", type: "uint32[3]" },
      { name: "decryptionProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "requestClaimCheck",
    type: "function",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "finalizeClaim",
    type: "function",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "won", type: "bool" },
      { name: "decryptionProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getGameInfo",
    type: "function",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      { name: "question", type: "string" },
      { name: "stakeToken", type: "address" },
      { name: "stake", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "pot", type: "uint256" },
      { name: "playerCount", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    name: "hasJoined",
    type: "function",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "getClearCounts",
    type: "function",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ name: "", type: "uint32[3]" }],
    stateMutability: "view",
  },
  {
    name: "nextGameId",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// FHE Types for Zama SDK encryption
export type FheType = "ebool" | "euint8" | "euint16" | "euint32" | "euint64";

// Encrypted input from Zama SDK
// This is the result format from useEncrypt or sdk.encryption.encryptValues
export interface EncryptedInput {
  encryptedValue: Hash;
  inputProof: `0x${string}`;
}

// Contract interaction class for non-FHE operations
// FHE encryption should use @zama-fhe/react-sdk hooks
export class ContractClient {
  private publicClient: PublicClient;
  private walletClient: WalletClient | null;
  private chain: Chain | null;

  constructor(
    publicClient: PublicClient, 
    walletClient?: WalletClient,
    chain?: Chain
  ) {
    this.publicClient = publicClient;
    this.walletClient = walletClient ?? null;
    this.chain = chain ?? null;
  }

  setWalletClient(walletClient: WalletClient, chain: Chain): void {
    this.walletClient = walletClient;
    this.chain = chain;
  }

  private getWriteOptions() {
    if (!this.walletClient || !this.chain) {
      throw new Error("Wallet not connected");
    }
    return {
      chain: this.chain,
    };
  }

  // ============ ERC20 Read Operations ============
  async getBalance(tokenAddress: Address, account: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account],
    }) as Promise<bigint>;
  }

  async getAllowance(
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<bigint> {
    return this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    }) as Promise<bigint>;
  }

  async getTokenDecimals(tokenAddress: Address): Promise<number> {
    return this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "decimals",
      args: [],
    }) as Promise<number>;
  }

  async getTokenSymbol(tokenAddress: Address): Promise<string> {
    return this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "symbol",
      args: [],
    }) as Promise<string>;
  }

  // ============ ERC20 Write Operations ============
  async approve(
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("Wallet not connected");
    }

    const [account] = await this.walletClient.getAddresses();

    const hash = await this.walletClient.writeContract({
      ...this.getWriteOptions(),
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
      account,
    });

    return hash;
  }

  async approveIfNeeded(
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ): Promise<Hash | null> {
    const currentAllowance = await this.getAllowance(tokenAddress, this.walletClient!.account!.address, spender);
    if (currentAllowance < amount) {
      return this.approve(tokenAddress, spender, amount);
    }
    return null;
  }

  // ============ MinorityWins Read Operations ============
  async getGameInfo(contractAddress: Address, gameId: bigint): Promise<GameInfo> {
    const result = (await this.publicClient.readContract({
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "getGameInfo",
      args: [gameId],
    })) as readonly [string, Address, bigint, bigint, number, bigint, bigint];

    return {
      question: result[0],
      stakeToken: result[1],
      stake: result[2],
      deadline: result[3],
      status: result[4] as GameStatus,
      pot: result[5],
      playerCount: result[6],
    };
  }

  async hasJoined(
    contractAddress: Address,
    gameId: bigint,
    player: Address
  ): Promise<boolean> {
    return this.publicClient.readContract({
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "hasJoined",
      args: [gameId, player],
    }) as Promise<boolean>;
  }

  async getNextGameId(contractAddress: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "nextGameId",
      args: [],
    }) as Promise<bigint>;
  }

  async getClearCounts(
    contractAddress: Address,
    gameId: bigint
  ): Promise<readonly [number, number, number]> {
    return this.publicClient.readContract({
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "getClearCounts",
      args: [gameId],
    }) as Promise<readonly [number, number, number]>;
  }

  // ============ MinorityWins Write Operations (Non-FHE) ============
  async createGame(
    contractAddress: Address,
    params: GameCreateParams
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("Wallet not connected");
    }

    const [account] = await this.walletClient.getAddresses();

    const hash = await this.walletClient.writeContract({
      ...this.getWriteOptions(),
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "createGame",
      args: [params.question, params.stakeToken, params.stake, BigInt(params.durationSeconds)],
      account,
    });

    return hash;
  }

  async requestTallyReveal(
    contractAddress: Address,
    gameId: bigint
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("Wallet not connected");
    }

    const [account] = await this.walletClient.getAddresses();

    const hash = await this.walletClient.writeContract({
      ...this.getWriteOptions(),
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "requestTallyReveal",
      args: [gameId],
      account,
    });

    return hash;
  }

  // ============ FHE Encrypted Operations ============
  // Note: For FHE encryption, use the @zama-fhe/react-sdk hooks instead:
  // - useEncrypt() hook for encrypting values
  // - useSubmitPick() hook from hooks.ts which handles encryption + submission
  // 
  // These methods are kept for reference only. Use hooks for proper SDK integration.

  /**
   * Submit an encrypted pick to the MinorityWins game
   * For proper Zama SDK integration, use useSubmitPick() from hooks.ts
   * 
   * @deprecated Use useSubmitPick() hook from hooks.ts
   */
  async submitEncryptedPick(
    contractAddress: Address,
    gameId: bigint,
    encryptedChoice: Hash,
    inputProof: `0x${string}`
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("Wallet not connected");
    }

    const [account] = await this.walletClient.getAddresses();

    const hash = await this.walletClient.writeContract({
      ...this.getWriteOptions(),
      address: contractAddress,
      abi: MINORITY_WINS_ABI,
      functionName: "submitPick",
      args: [gameId, encryptedChoice, inputProof],
      account,
    });

    return hash;
  }

  // ============ Transaction Utilities ============
  
  async waitForTransaction(hash: Hash, confirmations: number = 1) {
    return this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations,
    });
  }
}

// ============ FHE Encryption Helper Functions (for React hooks) ============

/**
 * Create encryption params for use with useEncrypt hook
 * Returns the params needed to call the Zama SDK encrypt mutation
 */
export function createEncryptParams(
  value: bigint,
  fheType: FheType,
  contractAddress: Address,
  userAddress: Address
) {
  return {
    values: [{ value, type: fheType }],
    contractAddress,
    userAddress,
  };
}

/**
 * Extract encrypted value and proof from useEncrypt result
 */
export function extractEncryptedInput(result: {
  encryptedValues: Hash[];
  inputProof: `0x${string}`;
}): EncryptedInput {
  return {
    encryptedValue: result.encryptedValues[0],
    inputProof: result.inputProof,
  };
}

// ============ Helper Functions ============

/**
 * Format a token amount for display
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  displayDecimals: number = 4
): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const displayFractional = fractionalStr.slice(0, displayDecimals);
  
  if (displayFractional === "0".repeat(displayDecimals)) {
    return integerPart.toString();
  }
  
  return `${integerPart}.${displayFractional}`.replace(/\.?0+$/, "");
}

/**
 * Parse a string amount into a bigint with token decimals
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [integer, fractional = ""] = amount.split(".");
  const paddedFractional = fractional.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(integer + paddedFractional);
}

/**
 * Get block explorer URL for transaction/address
 */
export function getExplorerUrl(
  chainId: number,
  type: "tx" | "address" | "block",
  value: string
): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  };

  const baseUrl = explorers[chainId] || explorers[1];
  
  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${value}`;
    case "address":
      return `${baseUrl}/address/${value}`;
    case "block":
      return `${baseUrl}/block/${value}`;
  }
}
