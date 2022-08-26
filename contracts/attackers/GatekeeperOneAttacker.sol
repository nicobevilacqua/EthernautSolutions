// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IGatekeeperOne {
    function enter(bytes8) external returns (bool);
}

contract GatekeeperOneAttacker {
    address private target;

    uint256 private constant MOD_VALUE = 8191;

    constructor(address _target) {
        target = _target;
    }

    function attack() external {
        bytes8 key;
        // uint256 gasToSend = (gasleft() % 8191) * 8191 + 461771;

        // IGatekeeperOne(target).enter(key);
        uint256 gasToSend = gasleft();
        console.log(gasToSend);
        gasToSend = gasToSend - (gasToSend / 100);
        console.log(gasToSend);
        gasToSend = gasToSend % MOD_VALUE;
        console.log(gasToSend);
        // gasToSend = gasToSend / 2;
        // console.log(gasToSend);
        gasToSend = gasToSend * MOD_VALUE;
        console.log(gasToSend);
        gasToSend += 248;
        console.log(gasToSend);
        (bool success, ) = target.call{gas: gasToSend}(
            abi.encodeWithSignature("enter(bytes8)", key)
        );
        require(success, "failed");
    }
}

// 29102871-28535448 = 567423
// 29670046-28535448 =
// 29102623-28535448 = 567175
// 5176812-5176564 = 248
// 5176960-5176712 = 248
