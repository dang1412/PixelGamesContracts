// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PixelToken is ERC20, Ownable {
  // EIP712 typehash for permit (optional, for demonstration)
  bytes32 private constant _PERMIT_TYPEHASH =
    keccak256("Permit(address user,uint256 deadline)");
  // minter, should be PixelGift contract
  address public minter;

  constructor()
    ERC20("PixelGames Token", "PXG")
    Ownable(msg.sender)
  {}

  function setMinter(address _minter) external onlyOwner {
    minter = _minter;
  }

  function mint(address to, uint256 amount) external {
    require(msg.sender == minter, "Only minter can mint");
    _mint(to, amount);
  }
}