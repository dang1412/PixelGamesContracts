// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { EIP712Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

// import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PixelERC20 is Initializable, ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable, EIP712Upgradeable {

  uint256 maxTokenPerBox = 100 * 10 ** 18;
  uint256 minTokenPerBox = 10 * 10 ** 18;
  uint32 maxBoxPerDay = 1000;
  uint32 maxBoxAppear = 20;
  // positions that currently have boxes, position is from 0 to 9999
  mapping (uint => bool) boxes;
  uint[] public activeBoxPositions;
  // address's last box taken timestamp
  mapping (address => uint) public lastBoxTaken;
  // min time between two box taken
  uint public boxCooldown = 5 minutes;

  // EIP-712 typehash for the signed Ticket
  bytes32 public constant TYPEHASH = keccak256("Ticket(address user,uint256 deadline)");
  address public signer;

  function initialize(string memory name, string memory symbol, uint256 initialSupply) public initializer {
    __ERC20_init(name, symbol);
    __EIP712_init(name, "1"); // Gọi EIP712 với version "1" hoặc version bạn muốn
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();

    _mint(msg.sender, initialSupply);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  event BoxAdded(uint256 position);
  event BoxTaken(uint256 position, uint256 token);

  function _fillBox() internal {
    uint32 toGenerateBox = maxBoxAppear - uint32(activeBoxPositions.length);
    if (toGenerateBox > 0) {
      for (uint32 i = 0; i < toGenerateBox; i++) {
        uint position = _randomWithin(0, 10000, i);
        if (!boxes[position]) {
          boxes[position] = true;
          activeBoxPositions.push(position);
          emit BoxAdded(position);
        }
      }
    }
  }

  function claimBox(uint position, uint256 deadline, bytes calldata signature) public returns (uint256) {
    require(boxes[position], "No box at this position");
    require(block.timestamp >= lastBoxTaken[msg.sender] + boxCooldown, "Box cooldown not passed");
    lastBoxTaken[msg.sender] = block.timestamp;
    boxes[position] = false;
    // remove from activeBoxPositions
    for (uint i = 0; i < activeBoxPositions.length; i++) {
      if (activeBoxPositions[i] == position) {
        activeBoxPositions[i] = activeBoxPositions[activeBoxPositions.length - 1];
        activeBoxPositions.pop();
        break;
      }
    }
    uint256 token = _randomWithin(minTokenPerBox, maxTokenPerBox, position);
    _mint(msg.sender, token);
    emit BoxTaken(position, token);
    _fillBox();

    return token;
  }

  function _randomWithin(uint256 min, uint256 max, uint256 seed) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seed))) % (max - min) + min;
  }

  /**
  * @notice Helper to check whether a signature is valid for a Ticket
  */
  function _validateClaim(address user, uint256 deadline, bytes calldata signature) internal view returns (bool) {
    if (block.timestamp > deadline) return false;
    bytes32 structHash = keccak256(abi.encode(TYPEHASH, user, deadline));
    bytes32 digest = _hashTypedDataV4(structHash);
    address recovered = ECDSA.recover(digest, signature);
    return recovered == signer;
  }
}
