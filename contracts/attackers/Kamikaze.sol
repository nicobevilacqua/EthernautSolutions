// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Kamikaze {
    address payable private target;

    constructor(address payable _target) public payable {
        target = _target;
    }

    function seppuku() external {
        selfdestruct(target);
    }
}
