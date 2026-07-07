import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedGame = await deploy("MinorityWins", {
    from: deployer,
    log: true,
    args: [],
  });

  console.log(`MinorityWins contract deployed at: ${deployedGame.address}`);
  console.log(`Deployer: ${deployer}`);
  console.log("\nContract functions:");
  console.log("- createGame(question, stake, durationSeconds)");
  console.log("- submitPick(gameId, encryptedChoice, inputProof) [payable]");
  console.log("- requestTallyReveal(gameId)");
  console.log("- resolveGame(gameId, clearCounts, decryptionProof)");
  console.log("- requestClaimCheck(gameId)");
  console.log("- finalizeClaim(gameId, won, decryptionProof)");
  console.log("- getGameInfo(gameId)");
};

export default func;
func.id = "deploy_minority_wins";
func.tags = ["MinorityWins"];
