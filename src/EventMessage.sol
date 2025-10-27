// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract EventMessage {
    event SendMessage(address indexed from, address indexed to, string content);

    function sendMessage(address to, string calldata content) public {
        emit SendMessage(msg.sender, to, content);
    }
}
