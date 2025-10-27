// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

import { EventMessage } from "../src/EventMessage.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        EventMessage eventMessage = new EventMessage();
        console.log("EventMessage address:", address(eventMessage));

        vm.stopBroadcast();
    }
}
