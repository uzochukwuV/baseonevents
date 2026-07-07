import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const TOKEN_NAME = "Confidential Token";
const TOKEN_SYMBOL = "CFT";
const CONTRACT_URI = "https://example.com/contract.json";
const INITIAL_SUPPLY = 1000000000n; // 1 billion tokens with 6 decimals

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedToken = await deploy("ERC7984Example", {
    from: deployer,
    log: true,
    args: [
      deployer,              // initialOwner
      INITIAL_SUPPLY,        // amount (uint64)
      TOKEN_NAME,            // name
      TOKEN_SYMBOL,          // symbol
      CONTRACT_URI,          // contractURI
    ],
  });

  console.log(`ERC7984Example contract deployed at: ${deployedToken.address}`);
  console.log(`Initial supply minted to: ${deployer}`);
  console.log(`Token name: ${TOKEN_NAME}`);
  console.log(`Token symbol: ${TOKEN_SYMBOL}`);
};

export default func;
func.id = "deploy_erc7984_example";
func.tags = ["ERC7984Example"];
