// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { PixelNFT } from "../src/PixelNFT.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        PixelNFT pixelNFT = new PixelNFT();

        // update token minter
        // token.setMinter(address(gift));

        console.log("PixelNFT address:", address(pixelNFT));
        // console.log("Gift address:", address(gift));

        vm.stopBroadcast();
    }
}
