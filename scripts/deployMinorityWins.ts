import "dotenv/config";
import { ethers, ContractFactory } from "ethers";
import { MinorityWins__factory } from "../types";

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

async function main() {
  if (!PRIVATE_KEY || !RPC_URL) {
    console.error("Missing DEPLOYER_PRIVATE_KEY or SEPOLIA_RPC_URL");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`Wallet: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get gas price
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
  console.log(`Gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);

  // Deploy MinorityWins using the type-safe factory
  const factory = new MinorityWins__factory(wallet);
  
  console.log("\nDeploying MinorityWins...");
  const contract = await factory.deploy({
    gasPrice: gasPrice,
    gasLimit: 5000000  // 5M gas limit for FHE contracts
  });
  
  console.log(`Transaction sent: ${contract.deploymentTransaction()?.hash}`);
  
  const receipt = await contract.deploymentTransaction()?.wait();
  const address = await contract.getAddress();
  console.log(`\n✅ Deployed at: ${address}`);
  console.log(`Block: ${receipt?.blockNumber}`);
  console.log(`Gas used: ${receipt?.gasUsed.toString()}`);
  
  console.log("\n📋 Contract functions:");
  console.log("- createGame(question, stake, durationSeconds)");
  console.log("- submitPick(gameId, encryptedChoice, inputProof) [payable]");
  console.log("- requestTallyReveal(gameId)");
  console.log("- resolveGame(gameId, clearCounts, decryptionProof)");
  console.log("- requestClaimCheck(gameId)");
  console.log("- finalizeClaim(gameId, won, decryptionProof)");
  console.log("- getGameInfo(gameId)");
}

main().catch(console.error);
