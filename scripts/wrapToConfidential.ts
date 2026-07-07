import "dotenv/config";
import * as ethers from "ethers";

// Configuration
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

// Confidential token contracts (Mock) on Sepolia
const CONFIDENTIAL_TOKENS = {
  cUSDCMock: {
    address: "0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639",
    underlying: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF",
    name: "Confidential USDC (Mock)"
  },
  cUSDTMock: {
    address: "0x4E7B06D78965594eB5EF5414c357ca21E1554491",
    underlying: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0",
    name: "Confidential USDT (Mock)"
  },
  cWETHMock: {
    address: "0x46208622DA27d91db4f0393733C8BA082ed83158",
    underlying: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F",
    name: "Confidential WETH (Mock)"
  }
};

// Amount to wrap (in smallest unit)
const WRAP_AMOUNTS = {
  cUSDCMock: ethers.parseUnits("1000", 6),     // 1000 USDC
  cUSDTMock: ethers.parseUnits("1000", 6),     // 1000 USDT
  cWETHMock: ethers.parseUnits("0.1", 18)      // 0.1 WETH
};

// ERC20 ABI
const erc20Abi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

// Swap ABI for ERC20 to ERC7984 wrapper
const swapAbi = [
  "function swap(uint256 amount) external",
  "function swap(address to, uint256 amount) external"
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

  for (const [key, token] of Object.entries(CONFIDENTIAL_TOKENS)) {
    try {
      const amount = WRAP_AMOUNTS[key as keyof typeof WRAP_AMOUNTS];
      
      // Check underlying balance
      const underlyingContract = new ethers.Contract(token.underlying, erc20Abi, wallet);
      const balance = await underlyingContract.balanceOf(wallet.address);
      console.log(`${token.name}:`);
      console.log(`  Underlying balance: ${ethers.formatUnits(balance, key.includes('WETH') ? 18 : 6)}`);
      
      if (balance < amount) {
        console.log(`  ⚠️ Insufficient balance. Have ${balance}, need ${amount}\n`);
        continue;
      }

      // Approve confidential token to spend underlying
      console.log(`  Approving ${token.address} to spend underlying...`);
      const approveTx = await underlyingContract.approve(token.address, amount);
      await approveTx.wait();
      console.log(`  Approved!`);

      // Swap (wrap) to confidential token
      console.log(`  Swapping ${amount.toString()} to confidential token...`);
      const swapContract = new ethers.Contract(token.address, swapAbi, wallet);
      
      // Try swap with recipient
      try {
        const swapTx = await swapContract.swap(wallet.address, amount);
        await swapTx.wait();
        console.log(`  ✅ Swapped successfully!\n`);
      } catch {
        // Try swap without recipient
        try {
          const swapTx = await swapContract.swap(amount);
          await swapTx.wait();
          console.log(`  ✅ Swapped successfully!\n`);
        } catch (e: any) {
          console.error(`  ❌ Failed to swap ${token.name}: ${e.message}\n`);
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to wrap ${token.name}: ${error.message}\n`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
