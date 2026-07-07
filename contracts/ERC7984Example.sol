// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {FHE, externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/// @title ERC7984Example - A confidential fungible token using FHE
/// @notice This contract implements a confidential token where balances and transfers
///         remain encrypted on-chain using Fully Homomorphic Encryption (FHE).
contract ERC7984Example is ZamaEthereumConfig, ERC7984, Ownable2Step {
    /// @notice Creates a new confidential token contract
    /// @param initialOwner The address that will own the contract and receive initial supply
    /// @param amount The initial supply to mint to the owner
    /// @param name_ The name of the token
    /// @param symbol_ The symbol of the token
    /// @param contractURI_ The URI for contract-level metadata
    constructor(
        address initialOwner,
        uint64 amount,
        string memory name_,
        string memory symbol_,
        string memory contractURI_
    ) ERC7984(name_, symbol_, contractURI_) Ownable(initialOwner) {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _mint(initialOwner, encryptedAmount);
    }

    /// @notice Mint new tokens to a recipient (only owner can call)
    /// @param to The address to receive the new tokens
    /// @param amount The amount of tokens to mint (will be encrypted)
    function mint(address to, uint64 amount) external onlyOwner {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _mint(to, encryptedAmount);
    }

    /// @notice Burn tokens from a holder (only owner can call)
    /// @param from The address to burn tokens from
    /// @param amount The amount of tokens to burn (will be encrypted)
    function burn(address from, uint64 amount) external onlyOwner {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _burn(from, encryptedAmount);
    }

    /// @notice Transfer tokens from sender to recipient
    /// @param to The recipient address
    /// @param amount The encrypted amount to transfer
    /// @param inputProof The proof for the encrypted input
    function transfer(address to, externalEuint64 amount, bytes calldata inputProof) external {
        _transfer(msg.sender, to, FHE.fromExternal(amount, inputProof));
    }
}
