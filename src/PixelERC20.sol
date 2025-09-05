// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

contract PixelERC20 is ERC20, Ownable, EIP712 {
  // EIP712 typehash for permit (optional, for demonstration)
  bytes32 private constant _PERMIT_TYPEHASH =
    keccak256("Permit(address user,uint256 deadline)");
  // signer, to verify human
  address public signer;

  uint16 public maxTokenPerBox = 100;
  uint16 public minTokenPerBox = 10;
  uint16 public maxBoxPerDay = 1000;
  uint16 public maxBoxAppear = 20;
  uint16 public boxesClaimedToday;
  // current date
  uint32 public currentGiftDay;
  // positions that currently have boxes, position is from 0 to 9999
  mapping (uint16 => bool) public boxes;
  uint16[] public activeBoxPositions;
  // address's last box taken timestamp
  mapping (address => uint) public lastBoxTaken;
  // min time between two box taken
  uint256 public boxCooldown = 5 minutes;

  event BoxAdded(uint16 position);
  event BoxClaimed(address user, uint16 position, uint16 token);

  constructor()
    ERC20("Pixel Gift Box Token", "PixelGift")
    EIP712("Pixel Gift Token", "1")
    Ownable(msg.sender)
  {
    currentGiftDay = uint32(block.timestamp / 1 days);
    _fillBoxes();
  }

  function setSigner(address _signer) external onlyOwner {
    signer = _signer;
  }

  function updateBoxCooldown(uint256 _boxCooldown) external onlyOwner {
    boxCooldown = _boxCooldown;
  }

  function setMaxBoxPerDay(uint16 _maxBoxPerDay) external onlyOwner {
    maxBoxPerDay = _maxBoxPerDay;
  }

  function setMaxBoxAppear(uint16 _maxBoxAppear) external onlyOwner {
    maxBoxAppear = _maxBoxAppear;
  }

  function setBoxTokenRange(uint16 _minTokenPerBox, uint16 _maxTokenPerBox) external onlyOwner {
    require(_minTokenPerBox < _maxTokenPerBox, "min must be less than max");
    minTokenPerBox = _minTokenPerBox;
    maxTokenPerBox = _maxTokenPerBox;
  }

  function getActiveBoxPositions() external view returns (uint16[] memory) {
    return activeBoxPositions;
  }

  /**
   * 
   * @param position claim box at this position
   * @param deadline timestamp that this claim is valid until
   * @param signature signature from the signer to verify this is a valid claim
   */
  function claimBox(uint16 position, uint256 deadline, bytes calldata signature) public returns (uint256) {
    require(boxes[position], "No box at this position");
    require(block.timestamp >= lastBoxTaken[msg.sender] + boxCooldown, "Box cooldown not passed");

    uint32 today = uint32(block.timestamp / 1 days);
    require(today >= currentGiftDay, "All boxes for today claimed");
    if (today > currentGiftDay) {
      // shift to next day, all boxes claimed today reset to 0
      // (not all boxes claimed on currentGiftDay)
      currentGiftDay = today;
      boxesClaimedToday = 0;
    }

    if (signer != address(0)) {
      _validateClaim(msg.sender, deadline, signature);
    }

    boxesClaimedToday += 1;
    if (boxesClaimedToday == maxBoxPerDay) {
      // all boxes for today claimed, move to next day
      currentGiftDay += 1;
      boxesClaimedToday = 0;
    }

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
    uint16 token = uint16(_randomWithin(minTokenPerBox, maxTokenPerBox, position));
    _mint(msg.sender, token * 10 ** decimals());
    emit BoxClaimed(msg.sender, position, token);
    _fillBoxes();

    return token;
  }

  function _fillBoxes() internal {
    uint32 toGenerateBox = maxBoxAppear - uint32(activeBoxPositions.length);
    if (toGenerateBox > 0) {
      for (uint32 i = 0; i < toGenerateBox; i++) {
        uint16 position = uint16(_randomWithin(0, 10000, i));
        if (!boxes[position]) {
          boxes[position] = true;
          activeBoxPositions.push(position);
          emit BoxAdded(position);
        }
      }
    }
  }

  function _randomWithin(uint256 min, uint256 max, uint256 seed) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seed))) % (max - min) + min;
  }

  /**
  * @notice Helper to check whether a signature is valid for a Ticket
  */
  error InvalidClaimSignature();
  error ClaimExpired();

  function _validateClaim(address user, uint256 deadline, bytes calldata signature) internal view {
    if (block.timestamp > deadline) revert ClaimExpired();
    bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, user, deadline));
    bytes32 digest = _hashTypedDataV4(structHash);
    address recovered = ECDSA.recover(digest, signature);
    if (recovered != signer) revert InvalidClaimSignature();
  }
}