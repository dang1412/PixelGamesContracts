// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import { console } from "forge-std/console.sol";
import "forge-std/console2.sol";

import { PixelToken } from "../src/PixelToken.sol";
import { PixelGift } from "../src/PixelGift.sol";

address constant user = address(0x123);
address constant user2 = address(0x123);

// Test EIP712
bytes32 constant _PERMIT_TYPEHASH = keccak256("Permit(address user,uint256 deadline)");
address constant signer = address(0x56B637DD6eccc852501D9450a9da395044A826A8);
uint256 constant signerPK = 0xa5ef7fc4cf98c043f7f3339f9a9c6bcfca010761815f7208e8a66a6e2a6bc1e9;

error OwnableUnauthorizedAccount(address account);

contract GiftTest is Test {
    PixelToken public token;
    PixelGift public gift;

    function setUp() public {
        vm.createSelectFork(vm.envString("BASE_RPC_URL"));
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

    function test_ClaimWithSignature() public {
        gift.setSigner(signer);
        uint16 pos = gift.activeBoxPositions(0);
        uint256 deadline = block.timestamp + 1 hours;
        console.log("Deadline:", deadline);

        vm.startPrank(user2);
        bytes memory signature = _getSignature(user2, deadline);
        gift.claimBox(pos, deadline, signature);
        assertGt(token.balanceOf(user2), 0);
    }

    function _getSignature(address _user, uint256 deadline) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, _user, deadline));
        bytes32 digest = gift.hashTypedDataV4(structHash);

        console.log("Test Digest:");
        console2.logBytes32(digest);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPK, digest);
        return abi.encodePacked(r, s, v);
    }
}
