// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { PixelToken } from "./PixelToken.sol";

contract PixelGift is Ownable, EIP712 {
  // EIP712 typehash for permit (optional, for demonstration)
  bytes32 private constant _PERMIT_TYPEHASH =
    keccak256("Permit(address user,uint256 deadline)");
  // ERC20 token contract
  PixelToken public pixelToken;
  // signer, to verify human
  address public signer;

  uint16 public maxTokenPerBox = 100;
  uint16 public minTokenPerBox = 20;
  uint16 public maxBoxPerDay = 1000;
  uint16 public maxBoxAppear = 20;
  uint16 public minBoxAppear = 10;
  uint16 public totalBoxesClaimedToday;
  // current date
  uint32 public currentBoxDay;
  // positions that currently have boxes, position is from 0 to 9999
  mapping (uint16 => bool) public boxes;
  uint16[] public activeBoxPositions;
  // address's last box taken timestamp

  struct UserBoxInfo {
    uint32 lastBoxTaken;
    uint32 lastBoxDay;
    uint8 boxesTakenToday;
  }

  mapping (address => UserBoxInfo) public userInfos;
  // min time between two box taken
  uint32 public baseBoxCooldown = 5 minutes;

  event BoxAdded(uint16 position);
  event BoxClaimed(address user, uint16 position, uint16 token);

  constructor()
    EIP712("PixelGames Token Gift Box", "1")
    Ownable(msg.sender)
  {
    currentBoxDay = uint32(block.timestamp / 1 days);
    _fillBoxes();
  }

  function setPixelToken(address tokenAddress) external onlyOwner {
    pixelToken = PixelToken(tokenAddress);
  }

  function setSigner(address _signer) external onlyOwner {
    signer = _signer;
  }

  function updateBaseBoxCooldown(uint32 _boxCooldown) external onlyOwner {
    baseBoxCooldown = _boxCooldown;
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

  function calculateCooldownFinshed(address user) public view returns (uint256) {
    UserBoxInfo memory info = userInfos[user];
    uint32 today = uint32(block.timestamp / 1 days);

    if (today > info.lastBoxDay) {
      // first pick of the day
      return 0;
    }

    uint32 cooldown = 0;
    if (info.lastBoxDay == today && info.boxesTakenToday > 0) {
      // taken box today
      cooldown = uint32(baseBoxCooldown * 2 ** (info.boxesTakenToday - 1));
    }

    // compare with time till next day
    uint32 timeTillNextDay = uint32((1 days) - (block.timestamp % 1 days));

    if (cooldown > timeTillNextDay) {
      cooldown = timeTillNextDay;
    }

    return uint256(info.lastBoxTaken + cooldown);
  }

  /**
   * 
   * @param position claim box at this position
   * @param deadline timestamp that this claim is valid until
   * @param signature signature from the signer to verify this is a valid claim
   */
  function claimBox(uint16 position, uint256 deadline, bytes calldata signature) public {
    require(boxes[position], "No box at this position");

    // check cooldown
    uint256 coolDownTime = calculateCooldownFinshed(msg.sender);
    require(block.timestamp >= coolDownTime, "Box cooldown not passed");

    uint32 today = uint32(block.timestamp / 1 days);
    require(today >= currentBoxDay, "All boxes for today claimed");
    if (today > currentBoxDay) {
      // first pick of the day
      // shift to today day, all boxes claimed today reset to 0
      // (not all boxes claimed on currentGiftDay)
      currentBoxDay = today;
      totalBoxesClaimedToday = 0;
    }

    if (signer != address(0)) {
      _validateClaim(msg.sender, deadline, signature);
    }

    // update user info
    UserBoxInfo storage info = userInfos[msg.sender];
    if (info.lastBoxDay < today) {
      // first pick of the day
      info.boxesTakenToday = 1;
      info.lastBoxDay = today;
    } else {
      info.boxesTakenToday += 1;
    }
    info.lastBoxTaken = uint32(block.timestamp);

    // check totalBoxesClaimedToday
    totalBoxesClaimedToday += 1;
    if (totalBoxesClaimedToday == maxBoxPerDay) {
      // all boxes for today claimed, move to next day
      currentBoxDay += 1;
      totalBoxesClaimedToday = 0;
    }

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
    uint256 amount = uint256(token) * 1e18;
    pixelToken.mint(msg.sender, amount); // assuming 18 decimals
    emit BoxClaimed(msg.sender, position, token);

    if (activeBoxPositions.length < minBoxAppear) {
      // ensure at least minBoxAppear boxes on the field
      _fillBoxes();
    } else {
      // 50% chance to fill boxes
      // if (_randomWithin(0, 100, position) < 50) {
      //   _fillBoxes();
      // }
    }
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