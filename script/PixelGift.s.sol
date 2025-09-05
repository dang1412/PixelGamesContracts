// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { PixelERC20 } from "../src/PixelERC20.sol";

contract Deploy is Script {
    function run() external {
        // vm.createSelectFork("base-sepolia");
        vm.startBroadcast();
        new PixelERC20();
        vm.stopBroadcast();
    }
}
