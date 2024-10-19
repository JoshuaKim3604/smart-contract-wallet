// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor() ERC20("Test Token", "TST") {}

    function mint(address receiver, uint256 amount) external {
        _mint(receiver, amount);
    }
}
