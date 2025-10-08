// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import { console } from "forge-std/console.sol";
import "forge-std/console2.sol";

import { PixelNFT } from "../src/PixelNFT.sol";

address constant user = address(0x123);
address constant user2 = address(0x456);

error OwnableUnauthorizedAccount(address account);

contract PixelNFTTest is Test {
    PixelNFT public pixelNFT;

    function setUp() public {
        // vm.createSelectFork(vm.envString("BASE_RPC_URL"));
        pixelNFT = new PixelNFT();
    }

    function test_Mint() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        pixelNFT.mint{value: 0.05 ether}(0, 0, 1, 1);
        assertEq(pixelNFT.ownerOf(0), user);

        // check user balance
        assertEq(user.balance, 1 ether - 0.05 ether);   
    }

    function test_AfterMint() public {
        vm.deal(user, 1 ether);
        vm.deal(user2, 0.5 ether);

        vm.prank(user);
        pixelNFT.mint{value: 0.45 ether}(49, 49, 3, 3);
        vm.prank(user2);
        pixelNFT.mint{value: 0.2 ether}(30, 30, 2, 2);

        assertEq(pixelNFT.ownerOf(4949), user);

        // check user balance
        assertEq(user.balance, 1 ether - 0.05 ether * 9);
        assertEq(user2.balance, 0.5 ether - 0.05 ether * 4);

        // check pixels user
        (uint16[] memory tokens, PixelNFT.TokenSizes[] memory sizes) = pixelNFT.getUserPixels(user);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], 4949);
        assertEq(sizes[0].w, 3);
        assertEq(sizes[0].h, 3);

        // check pixels user2
        (tokens, sizes) = pixelNFT.getUserPixels(user2);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], 3030);
        assertEq(sizes[0].w, 2);
        assertEq(sizes[0].h, 2);
    }

    function test_RevertWhenMintOwnedPixel() public {
        vm.deal(user, 1 ether);
        vm.deal(user2, 0.5 ether);

        vm.prank(user);
        pixelNFT.mint{value: 0.45 ether}(49, 49, 3, 3);
        vm.prank(user2);
        vm.expectRevert(bytes("Pixel already owned"));
        pixelNFT.mint{value: 0.2 ether}(50, 50, 2, 2);
    }

    function test_PixelBelongsToToken() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        pixelNFT.mint{value: 0.2 ether}(50, 50, 2, 2);

        // check pixel belongs to token
        assertEq(pixelNFT.pixelBelongsToToken(1), 0);
        assertEq(pixelNFT.pixelBelongsToToken(2), 0);
        assertEq(pixelNFT.pixelBelongsToToken(5050), 5050);
        assertEq(pixelNFT.pixelBelongsToToken(5051), 5050);
        assertEq(pixelNFT.pixelBelongsToToken(5150), 5050);
        assertEq(pixelNFT.pixelBelongsToToken(5151), 5050);
    }

    function test_IsAreaOwned() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        pixelNFT.mint{value: 0.2 ether}(50, 50, 2, 2);

        assertEq(pixelNFT.isAreaOwned(user, 50, 50, 2, 2), true);
        assertEq(pixelNFT.isAreaOwned(user, 50, 50, 2, 1), true);
        assertEq(pixelNFT.isAreaOwned(user, 50, 50, 1, 3), false);
        assertEq(pixelNFT.isAreaOwned(user, 50, 50, 1, 2), true);
        assertEq(pixelNFT.isAreaOwned(user, 51, 51, 1, 1), true);
        assertEq(pixelNFT.isAreaOwned(user, 52, 52, 1, 1), false);
    }
}