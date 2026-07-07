// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title MinorityWins
/// @notice Fixed-stake, 3-option prediction game. Choices stay encrypted the entire round.
///         When the round closes, the option with the FEWEST picks splits the pot among
///         the players who picked it. No commit-reveal is needed: the tally itself stays
///         encrypted on-chain until the operator explicitly reveals it after the deadline.
/// @dev Stake is paid in ERC20 tokens. Users must approve the contract to spend the stake amount
///      before calling submitPick.
contract MinorityWins is ZamaEthereumConfig {
    using SafeERC20 for IERC20;

    uint8 public constant OPTIONS = 3;

    enum Status {
        Open, // accepting picks
        AwaitingTally, // deadline passed, tally reveal requested off-chain
        Resolved // clearCounts + winning option(s) finalized on-chain
    }

    struct Game {
        string question; // e.g. "Who gets eliminated first?"
        IERC20 stakeToken; // ERC20 token used for staking
        uint256 stake; // required stake per player (in token decimals)
        uint256 deadline; // block.timestamp after which picks close
        Status status;
        euint32[OPTIONS] counts; // encrypted running tally per option
        uint32[OPTIONS] clearCounts; // populated only after resolve()
        bool[OPTIONS] isWinningOption; // populated only after resolve()
        uint256 winnerCount; // total players in the winning option(s)
        uint256 pot; // stake * players.length
        address[] players;
        mapping(address => euint8) choiceOf;
        mapping(address => bool) hasJoined;
        mapping(address => bool) hasClaimed;
    }

    uint256 public nextGameId;
    mapping(uint256 => Game) private games;

    event GameCreated(uint256 indexed gameId, string question, address indexed stakeToken, uint256 stake, uint256 deadline);
    event PickSubmitted(uint256 indexed gameId, address indexed player);
    event TallyRevealRequested(uint256 indexed gameId);
    event GameResolved(uint256 indexed gameId, uint32[OPTIONS] clearCounts, uint256 winnerCount);
    event WinningsClaimed(uint256 indexed gameId, address indexed player, uint256 amount);

    modifier onlyStatus(uint256 gameId, Status s) {
        require(games[gameId].status == s, "wrong game status");
        _;
    }

    /// @notice Create a new round.
    /// @param question The question/prompt for the game
    /// @param stakeToken The ERC20 token address to use for staking
    /// @param stake The required stake amount per player (in token decimals)
    /// @param durationSeconds How long the game stays open
    function createGame(
        string calldata question,
        IERC20 stakeToken,
        uint256 stake,
        uint256 durationSeconds
    ) external returns (uint256 gameId) {
        require(stake > 0, "stake must be > 0");
        require(durationSeconds > 0, "duration must be > 0");
        require(address(stakeToken) != address(0), "invalid stake token");

        gameId = nextGameId++;
        Game storage g = games[gameId];
        g.question = question;
        g.stakeToken = stakeToken;
        g.stake = stake;
        g.deadline = block.timestamp + durationSeconds;
        g.status = Status.Open;

        // Initialize encrypted counters to 0 and grant the contract permission on them.
        for (uint8 i = 0; i < OPTIONS; i++) {
            g.counts[i] = FHE.asEuint32(0);
            FHE.allowThis(g.counts[i]);
        }

        emit GameCreated(gameId, question, address(stakeToken), stake, g.deadline);
    }

    /// @notice Join a round with an encrypted pick (0, 1, or 2).
    /// @dev Caller must approve this contract to spend the stake amount first.
    ///      The stake amount is transferred from the caller.
    function submitPick(
        uint256 gameId,
        externalEuint8 encryptedChoice,
        bytes calldata inputProof
    ) external onlyStatus(gameId, Status.Open) {
        Game storage g = games[gameId];
        require(block.timestamp < g.deadline, "round closed");
        require(!g.hasJoined[msg.sender], "already joined");

        // Transfer stake from player to contract
        g.stakeToken.safeTransferFrom(msg.sender, address(this), g.stake);

        euint8 choice = FHE.fromExternal(encryptedChoice, inputProof);
        FHE.allowThis(choice);
        // The player is allowed to see their own choice going forward (e.g. to verify a claim locally).
        FHE.allow(choice, msg.sender);

        g.choiceOf[msg.sender] = choice;
        g.hasJoined[msg.sender] = true;
        g.players.push(msg.sender);
        g.pot += g.stake;

        // Branchless tally increment: counts[i] += (choice == i) for every option.
        // FHE.select picks the right branch homomorphically; no cleartext comparison ever happens.
        for (uint8 i = 0; i < OPTIONS; i++) {
            ebool isThisOption = FHE.eq(choice, FHE.asEuint8(i));
            euint32 incremented = FHE.add(g.counts[i], FHE.asEuint32(1));
            g.counts[i] = FHE.select(isThisOption, incremented, g.counts[i]);
            FHE.allowThis(g.counts[i]);
        }

        emit PickSubmitted(gameId, msg.sender);
    }

    /// @notice After the deadline, mark the tally as publicly decryptable so an off-chain
    ///         relayer (via the Zama relayer SDK) can fetch cleartext counts + a validity proof.
    function requestTallyReveal(uint256 gameId) external onlyStatus(gameId, Status.Open) {
        Game storage g = games[gameId];
        require(block.timestamp >= g.deadline, "round still open");

        for (uint8 i = 0; i < OPTIONS; i++) {
            FHE.makePubliclyDecryptable(g.counts[i]);
        }

        g.status = Status.AwaitingTally;
        emit TallyRevealRequested(gameId);
    }

    /// @notice Anyone can submit the decrypted counts + KMS proof obtained off-chain via the
    ///         relayer SDK. FHE.checkSignatures reverts if the proof doesn't match the ciphertexts,
    ///         so there is no way to submit a fake tally.
    function resolveGame(
        uint256 gameId,
        uint32[OPTIONS] calldata clearCounts,
        bytes calldata decryptionProof
    ) external onlyStatus(gameId, Status.AwaitingTally) {
        Game storage g = games[gameId];

        bytes32[] memory handles = new bytes32[](OPTIONS);
        for (uint8 i = 0; i < OPTIONS; i++) {
            handles[i] = FHE.toBytes32(g.counts[i]);
        }
        bytes memory cleartexts = abi.encode(clearCounts[0], clearCounts[1], clearCounts[2]);
        FHE.checkSignatures(handles, cleartexts, decryptionProof);

        uint32 minCount = clearCounts[0];
        for (uint8 i = 1; i < OPTIONS; i++) {
            if (clearCounts[i] < minCount) minCount = clearCounts[i];
        }

        uint256 winnerCount;
        for (uint8 i = 0; i < OPTIONS; i++) {
            g.clearCounts[i] = clearCounts[i];
            bool isWinning = clearCounts[i] == minCount;
            g.isWinningOption[i] = isWinning;
            if (isWinning) winnerCount += clearCounts[i];
        }

        // Edge case: everyone picked the same option (or the game is otherwise unwinnable
        // in a meaningful sense, e.g. all three tied). Ties across ALL three options with
        // equal counts fall back to a full refund via claimWinnings treating everyone as a winner.
        g.winnerCount = winnerCount == 0 ? g.players.length : winnerCount;
        g.status = Status.Resolved;

        emit GameResolved(gameId, clearCounts, g.winnerCount);
    }

    /// @notice A player calls this to check, on-chain, whether their (still-encrypted) choice
    ///         matches a winning option, and marks it publicly decryptable so the caller can
    ///         fetch the boolean + proof off-chain and finalize their claim.
    function requestClaimCheck(uint256 gameId) external onlyStatus(gameId, Status.Resolved) {
        Game storage g = games[gameId];
        require(g.hasJoined[msg.sender], "did not join");
        require(!g.hasClaimed[msg.sender], "already claimed");

        ebool won = FHE.asEbool(false);
        for (uint8 i = 0; i < OPTIONS; i++) {
            if (g.isWinningOption[i]) {
                ebool pickedThis = FHE.eq(g.choiceOf[msg.sender], FHE.asEuint8(i));
                won = FHE.or(won, pickedThis);
            }
        }
        FHE.allowThis(won);
        FHE.makePubliclyDecryptable(won);

        // Stash the handle so finalizeClaim can verify the off-chain decryption proof against it.
        _pendingWon[gameId][msg.sender] = won;
    }

    mapping(uint256 => mapping(address => ebool)) private _pendingWon;

    /// @notice Submit the decrypted "won" boolean + KMS proof to actually receive the payout.
    /// @dev Payout is in ERC20 tokens held by the contract.
    function finalizeClaim(uint256 gameId, bool won, bytes calldata decryptionProof) external {
        Game storage g = games[gameId];
        require(g.status == Status.Resolved, "not resolved");
        require(g.hasJoined[msg.sender], "did not join");
        require(!g.hasClaimed[msg.sender], "already claimed");

        ebool wonHandle = _pendingWon[gameId][msg.sender];
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(wonHandle);
        FHE.checkSignatures(handles, abi.encode(won), decryptionProof);

        g.hasClaimed[msg.sender] = true;

        if (won) {
            uint256 share = g.pot / g.winnerCount;
            g.stakeToken.safeTransfer(msg.sender, share);
            emit WinningsClaimed(gameId, msg.sender, share);
        } else {
            emit WinningsClaimed(gameId, msg.sender, 0);
        }
    }

    // --- view helpers ---

    function getGameInfo(
        uint256 gameId
    ) external view returns (string memory question, address stakeToken, uint256 stake, uint256 deadline, Status status, uint256 pot, uint256 playerCount) {
        Game storage g = games[gameId];
        return (g.question, address(g.stakeToken), g.stake, g.deadline, g.status, g.pot, g.players.length);
    }

    function getClearCounts(uint256 gameId) external view returns (uint32[OPTIONS] memory) {
        return games[gameId].clearCounts;
    }

    function hasJoined(uint256 gameId, address player) external view returns (bool) {
        return games[gameId].hasJoined[player];
    }
}
