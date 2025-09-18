// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PixelToken is ERC20, Ownable {
  // minter, should be PixelGift contract
  address public minter;
  // Max cap: 1 billion tokens (1e9 * 10^decimals)
  uint256 public constant MAX_CAP = 1_000_000_000 * 10**18;

  constructor()
    ERC20("Pixel Game Token", "PXG")
    Ownable(msg.sender)
  {}

  function setMinter(address _minter) external onlyOwner {
    minter = _minter;
  }

  function mint(address to, uint256 amount) external {
    require(msg.sender == minter, "Only minter can mint");
    require(totalSupply() + amount <= MAX_CAP, "Max cap exceeded");
    _mint(to, amount);
  }
}