import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ERC7984Example, ERC7984Example__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

const TOKEN_NAME = "Confidential Token";
const TOKEN_SYMBOL = "CFT";
const CONTRACT_URI = "https://example.com/contract.json";
const INITIAL_SUPPLY = 1000n;

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ERC7984Example")) as ERC7984Example__factory;
  const contract = (await factory.deploy(
    ethers.ZeroAddress, // owner placeholder
    0, // amount placeholder
    TOKEN_NAME,
    TOKEN_SYMBOL,
    CONTRACT_URI,
  )) as ERC7984Example;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("ERC7984Example", function () {
  let signers: Signers;
  let contract: ERC7984Example;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    // Deploy with actual owner
    const factory = (await ethers.getContractFactory("ERC7984Example")) as ERC7984Example__factory;
    contract = (await factory.deploy(
      signers.deployer.address,
      INITIAL_SUPPLY,
      TOKEN_NAME,
      TOKEN_SYMBOL,
      CONTRACT_URI,
    )) as ERC7984Example;
    contractAddress = await contract.getAddress();
  });

  describe("Deployment", function () {
    it("should set the correct token name", async function () {
      const name = await contract.name();
      expect(name).to.eq(TOKEN_NAME);
    });

    it("should set the correct token symbol", async function () {
      const symbol = await contract.symbol();
      expect(symbol).to.eq(TOKEN_SYMBOL);
    });

    it("should set the correct contract URI", async function () {
      const contractURI = await contract.contractURI();
      expect(contractURI).to.eq(CONTRACT_URI);
    });

    it("should set the deployer as owner", async function () {
      expect(await contract.owner()).to.eq(signers.deployer.address);
    });

    it("should mint initial supply to owner", async function () {
      const encryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        contractAddress,
        signers.deployer,
      );
      expect(clearBalance).to.eq(INITIAL_SUPPLY);
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint new tokens", async function () {
      const mintAmount = 500n;
      const tx = await contract.connect(signers.deployer).mint(signers.alice.address, mintAmount);
      await tx.wait();

      const encryptedBalance = await contract.confidentialBalanceOf(signers.alice.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        contractAddress,
        signers.alice,
      );
      expect(clearBalance).to.eq(mintAmount);
    });

    it("should increase total supply after minting", async function () {
      const mintAmount = 500n;
      const initialEncryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const initialBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        initialEncryptedBalance,
        contractAddress,
        signers.deployer,
      );

      const tx = await contract.connect(signers.deployer).mint(signers.deployer.address, mintAmount);
      await tx.wait();

      const finalEncryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const finalBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        finalEncryptedBalance,
        contractAddress,
        signers.deployer,
      );

      expect(finalBalance).to.eq(initialBalance + mintAmount);
    });

    it("should not allow non-owner to mint", async function () {
      await expect(
        contract.connect(signers.alice).mint(signers.alice.address, 100),
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("should allow owner to burn tokens", async function () {
      const burnAmount = 100n;
      const initialEncryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const initialBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        initialEncryptedBalance,
        contractAddress,
        signers.deployer,
      );

      const tx = await contract.connect(signers.deployer).burn(signers.deployer.address, burnAmount);
      await tx.wait();

      const finalEncryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const finalBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        finalEncryptedBalance,
        contractAddress,
        signers.deployer,
      );

      expect(finalBalance).to.eq(initialBalance - burnAmount);
    });

    it("should not allow non-owner to burn", async function () {
      await expect(
        contract.connect(signers.alice).burn(signers.deployer.address, 100),
      ).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    it("should allow encrypted token transfer", async function () {
      const transferAmount = 250n;

      // Alice needs to allow the contract to decrypt her balance for re-encrypting
      const encryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const clearBalanceBefore = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        contractAddress,
        signers.deployer,
      );
      expect(clearBalanceBefore).to.eq(INITIAL_SUPPLY);

      // Create encrypted input for transfer
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.deployer.address)
        .add64(transferAmount)
        .encrypt();

      // Perform transfer
      const tx = await contract
        .connect(signers.deployer)
        .transfer(signers.alice.address, encryptedInput.handles[0], encryptedInput.inputProof);
      await tx.wait();

      // Check sender balance decreased
      const senderEncryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const senderClearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        senderEncryptedBalance,
        contractAddress,
        signers.deployer,
      );
      expect(senderClearBalance).to.eq(INITIAL_SUPPLY - transferAmount);

      // Check receiver balance increased
      const receiverEncryptedBalance = await contract.confidentialBalanceOf(signers.alice.address);
      const receiverClearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        receiverEncryptedBalance,
        contractAddress,
        signers.alice,
      );
      expect(receiverClearBalance).to.eq(transferAmount);
    });
  });

  describe("Confidentiality", function () {
    it("should store balances as encrypted bytes32 handles", async function () {
      // The encrypted balance should be bytes32 (a handle), not the actual number
      const encryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      
      // The encrypted value is a bytes32 handle - it should NOT equal the clear value
      // and it should be a valid bytes32 value
      expect(encryptedBalance).to.be.a("string");
      expect(encryptedBalance).to.match(/^0x[0-9a-f]{64}$/i);
      // The clear value should be different from the encrypted handle
      expect(encryptedBalance).to.not.eq(`0x${INITIAL_SUPPLY.toString(16).padStart(64, "0")}`);
    });

    it("should allow owner to decrypt their own balance", async function () {
      // Owner should be able to decrypt their own balance
      const ownerEncryptedBalance = await contract.confidentialBalanceOf(signers.deployer.address);
      const ownerDecryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        ownerEncryptedBalance,
        contractAddress,
        signers.deployer,
      );
      expect(ownerDecryptedBalance).to.eq(INITIAL_SUPPLY);
    });

    it("should allow minting to alice and then decrypting", async function () {
      // First mint some tokens to Alice
      const mintAmount = 100n;
      const tx = await contract.connect(signers.deployer).mint(signers.alice.address, mintAmount);
      await tx.wait();

      // Now Alice should be able to decrypt her balance
      const aliceEncryptedBalance = await contract.confidentialBalanceOf(signers.alice.address);
      const aliceDecryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        aliceEncryptedBalance,
        contractAddress,
        signers.alice,
      );
      expect(aliceDecryptedBalance).to.eq(mintAmount);
    });
  });
});
