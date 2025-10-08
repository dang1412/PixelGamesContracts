// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";

library LibMapUtils {
  function getPixelFromXY(uint8 x, uint8 y) internal pure returns (uint16)  {
    return uint16(y) * 100 + uint16(x);
  }
}
