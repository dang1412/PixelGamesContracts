// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { PixelToken } from "../src/PixelToken.sol";
import { PixelGift } from "../src/PixelGift.sol";

address constant user = address(0x123);

contract GiftTest is Test {
    PixelToken public token;
    PixelGift public gift;

    function setUp() public {
        token = new PixelToken();
        gift = new PixelGift();
        token.setMinter(address(gift));
        gift.setPixelToken(address(token));
    }

    function test_Address() public view {
        console.log("Token address:", address(token));
        console.log("Gift address:", address(gift));
        assertEq(address(token), address(gift.pixelToken()));
        assertEq(address(gift), address(token.minter()));
    }

    function test_ClaimBox() public {
        uint16 pos = gift.activeBoxPositions(0);
        console.log("Box position:", pos);
        assertEq(gift.boxes(pos), true);

        vm.prank(user);
        gift.claimBox(pos, 0, '0x');

        // Kiểm tra balance sau khi mint
        assertGt(token.balanceOf(user), 0);
    }
}
