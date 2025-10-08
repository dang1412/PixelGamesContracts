// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { LibMapUtils } from "./lib/LibMapUtils.sol";

contract PixelNFT is ERC721Enumerable, Ownable {
    // uint256 private _nextTokenId;

    constructor()
        ERC721("PixelNFT", "PXN")
        Ownable(msg.sender)
    {}

    // function mint(address to) public onlyOwner {
    //     _safeMint(to, _nextTokenId);
    //     _nextTokenId++;
    // }

    // price
    uint256 public nativePrice = 0.05 ether;
    address public erc20TokenAddress;
    uint256 public erc20TokenPrice;

    // mapping pixelBelongsToToken;
    mapping (uint16 => uint16) public pixelBelongsToToken;

    struct TokenSizes {
        uint8 w;
        uint8 h;
    }

    mapping (uint16 => TokenSizes) public tokenIdToSizes;

    function mint(uint8 x, uint8 y, uint8 w, uint8 h) external payable {
        uint16 amount = w * h;
        require(amount > 0, "Mint number must be positive");
        require(msg.value >= nativePrice * amount, "Not pay enough money");

        uint16 token = LibMapUtils.getPixelFromXY(x, y);

        for (uint8 i = 0; i < w; i++) {
            for (uint8 j = 0; j < h; j++) {
                uint16 pixel = LibMapUtils.getPixelFromXY(x + i, y + j);
                require(pixelBelongsToToken[pixel] == 0, "Pixel already owned");
                pixelBelongsToToken[pixel] = token;
            }
        }

        tokenIdToSizes[token] = TokenSizes(w, h);

        _safeMint(msg.sender, token);
    }

    function getPixels() external view returns (uint16[] memory, TokenSizes[] memory) {
        uint256 balance = totalSupply();
        uint16[] memory tokens = new uint16[](balance);
        TokenSizes[] memory sizes = new TokenSizes[](balance);

        for (uint256 i = 0; i < balance; i++) {
            uint16 tokenId = uint16(tokenByIndex(i));
            tokens[i] = tokenId;
            sizes[i] = tokenIdToSizes[tokenId];
        }

        return (tokens, sizes);
    }

    function getUserPixels(address user) external view returns (uint16[] memory, TokenSizes[] memory) {
        uint256 balance = balanceOf(user);
        uint16[] memory tokens = new uint16[](balance);
        TokenSizes[] memory sizes = new TokenSizes[](balance);

        for (uint256 i = 0; i < balance; i++) {
            uint16 tokenId = uint16(tokenOfOwnerByIndex(user, i));
            tokens[i] = tokenId;
            sizes[i] = tokenIdToSizes[tokenId];
        }

        return (tokens, sizes);
    }

    function isAreaOwned(address user, uint8 x, uint8 y, uint8 w, uint8 h) external view returns (bool) {
        for (uint8 i = 0; i < w; i++) {
            for (uint8 j = 0; j < h; j++) {
                uint16 pixel = LibMapUtils.getPixelFromXY(x + i, y + j);
                uint16 token = pixelBelongsToToken[pixel];
                // check if token exists in try catch
                try this.ownerOf(token) returns (address owner) {
                    if (owner != user) {
                        return false;
                    }
                } catch {
                    return false;
                }
            }
        }

        return true;
    }
}