// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts4.7/token/ERC20/ERC20.sol";

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

interface IForta {
    function setDetectionBot(address detectionBotAddress) external;

    function notify(address user, bytes calldata msgData) external;

    function raiseAlert(address user) external;
}

contract DoubleEntryPointBot is IDetectionBot {
    IForta public fortaContract;

    constructor(address forta) {
        fortaContract = IForta(forta);
    }

    function handleTransaction(address user, bytes memory msgData)
        public
        override
    {
        require(msg.sender == address(fortaContract), "Unauthorized");
        fortaContract.raiseAlert(user);
        msgData;
    }
}
