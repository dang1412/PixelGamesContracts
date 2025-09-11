// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { PixelToken } from "../src/PixelToken.sol";
import { PixelGift } from "../src/PixelGift.sol";

contract Deploy is Script {
    function run() external {
        // vm.createSelectFork("base-sepolia");
        vm.startBroadcast();
        PixelToken token = new PixelToken();
        PixelGift gift = new PixelGift();
        token.setMinter(address(gift));
        gift.setPixelToken(address(token));

        console.log("Token address:", address(token));
        console.log("Gift address:", address(gift));

        vm.stopBroadcast();
    }
}
