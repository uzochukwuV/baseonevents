import "dotenv/config";
import * as ethers from "ethers";

async function main() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.blast.io";
  const ADDRESS = "0x68B583d6cBA1BD4346f3F2e944c1D421e43A014E";
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const balance = await provider.getBalance(ADDRESS);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);
