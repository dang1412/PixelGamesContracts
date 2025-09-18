// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { PixelToken } from "../src/PixelToken.sol";
import { PixelGift } from "../src/PixelGift.sol";

address constant user = address(0x123);

error OwnableUnauthorizedAccount(address account);

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

    function test_FirstBox() public view {
        uint16 pos = gift.activeBoxPositions(0);
        console.log("Box position:", pos);
        assertEq(gift.boxes(pos), true);
    }

    function test_ClaimBox() public {
        uint256 amount = _claim(user);
        // Kiểm tra balance sau khi claim
        assertGt(amount, 0);
    }

    function test_Treasury() public {
        uint256 amount = _claim(user);
        // Treasury got 10%
        assert(amount / 10 == token.balanceOf(address(gift)));
    }

    function test_Withdraw() public {
        uint256 amount = _claim(user);
        uint256 treasuryAmount = amount / 10;
        // withdraw 50%
        gift.withdraw(treasuryAmount / 2);

        assert(token.balanceOf(address(gift)) == treasuryAmount / 2);
        assert(token.balanceOf(address(this)) == treasuryAmount / 2);
    }

    function test_WithdrawFail() public {
        uint256 amount = _claim(user);
        uint256 treasuryAmount = amount / 10;
        // user try to withdraw 50% treasury
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                OwnableUnauthorizedAccount.selector,
                user
            )
        );
        gift.withdraw(treasuryAmount / 2);
    }

    function _claim(address _user) private returns (uint256) {
        uint16 pos = gift.activeBoxPositions(0);
        vm.prank(_user);
        gift.claimBox(pos, 0, '0x');

        return token.balanceOf(_user);
    }
}
