import "dotenv/config";
import * as ethers from "ethers";

// Configuration
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

// Underlying token addresses on Sepolia (public mint)
const UNDERLYING_TOKENS = {
  USDC: {
    address: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF",
    name: "Underlying USDC",
    decimals: 6
  },
  USDT: {
    address: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0",
    name: "Underlying USDT",
    decimals: 6
  },
  WETH: {
    address: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F",
    name: "Underlying WETH",
    decimals: 18
  }
};

// Amount to mint (in smallest unit)
const MINT_AMOUNTS = {
  USDC: ethers.parseUnits("1000", 6),     // 1000 USDC
  USDT: ethers.parseUnits("1000", 6),     // 1000 USDT
  WETH: ethers.parseUnits("0.1", 18)      // 0.1 WETH
};

// ERC20 ABI for mint
const erc20MintAbi = [
  "function mint(address to, uint256 amount) external"
];

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Error: DEPLOYER_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  if (!RPC_URL) {
    console.error("Error: SEPOLIA_RPC_URL not set in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`Connected wallet: ${wallet.address}`);
  console.log(`Network: ${(await provider.getNetwork()).chainId}\n`);

  for (const [key, token] of Object.entries(UNDERLYING_TOKENS)) {
    try {
      const amount = MINT_AMOUNTS[key as keyof typeof MINT_AMOUNTS];
      console.log(`Minting ${amount.toString()} ${token.name}...`);
      console.log(`Contract: ${token.address}`);
      
      const contract = new ethers.Contract(token.address, erc20MintAbi, wallet);
      const tx = await contract.mint(wallet.address, amount);
      console.log(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Confirmed in block: ${receipt?.blockNumber}`);
      console.log(`Gas used: ${receipt?.gasUsed.toString()}`);
      console.log("✅ Success!\n");
    } catch (error: any) {
      console.error(`❌ Failed to mint ${token.name}: ${error.message}\n`);
    }
  }

  console.log("Done! Underlying tokens minted. Now wrapping to confidential tokens...");
}

main().catch(console.error);
