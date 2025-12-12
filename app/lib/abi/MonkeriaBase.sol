// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MonkeriaBase is ERC721URIStorage, Ownable, Pausable {
    uint256 public constant PRICE_ORIGIN_MANTLE = 0.001 ether;
    uint256 public constant PRICE_PUBLIC = 0.002 ether;

    address public constant BASE_ORIGIN_HOLDER = 0x45737f6950F5c9E9475e9E045C7a89b565Fa3648;
    address public constant MANTLE_HOLDER = (0x38BeD286A1EbaB9BA4508A6aF3937A5458f03198);

    uint256 public tokenIdCounter;
    uint256 public mintStart;
    uint256 public mintEnd;

    mapping(address => uint256) public mints;

constructor() 
    ERC721("MonkeriaBase", "MONK") 
    Ownable(msg.sender) 
{
    // Nov 11, 2025 → Nov 14, 2025 mint window
    mintStart = 1762828800;
    mintEnd = 1763164740;
}

    function mint(string memory _tokenURI, uint256 quantity) external payable whenNotPaused {
        require(block.timestamp >= mintStart && block.timestamp <= mintEnd, "Mint closed");
        require(quantity > 0 && quantity <= 20, "Invalid mint quantity");

        uint256 cost = getMintPrice(msg.sender);
        uint256 totalCost = cost * quantity;
        require(msg.value >= totalCost, "Insufficient ETH");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 newId = ++tokenIdCounter;
            _mint(msg.sender, newId);
            _setTokenURI(newId, _tokenURI);
            mints[msg.sender]++;
        }

        // Refund excess ETH
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }

    function getMintPrice(address user) public view returns (uint256) {
        if (_isHolder(user, BASE_ORIGIN_HOLDER) || _isHolder(user, MANTLE_HOLDER)) {
            return PRICE_ORIGIN_MANTLE;
        }
        return PRICE_PUBLIC;
    }

    function _isHolder(address user, address contractAddress) internal view returns (bool) {
        return IERC721(contractAddress).balanceOf(user) > 0;
    }

    // Admin
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw(address payable to) external onlyOwner {
        to.transfer(address(this).balance);
    }

    function updateMintWindow(uint256 _start, uint256 _end) external onlyOwner {
        require(_start < _end, "Invalid mint window");
        mintStart = _start;
        mintEnd = _end;
    }

    receive() external payable {}
}
