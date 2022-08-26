// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Recovery {
    event TokenDeployed(
        address indexed tokenAddress,
        string indexed name,
        uint256 timestamp
    );

    //generate tokens
    function generateToken(string memory _name, uint256 _initialSupply) public {
        SimpleToken token = new SimpleToken(_name, msg.sender, _initialSupply);
        emit TokenDeployed(address(token), _name, block.timestamp);
    }
}

contract SimpleToken {
    using SafeMath for uint256;
    // public variables
    string public name;
    mapping(address => uint256) public balances;

    // constructor
    constructor(
        string memory _name,
        address _creator,
        uint256 _initialSupply
    ) public {
        name = _name;
        balances[_creator] = _initialSupply;
    }

    // collect ether in return for tokens
    receive() external payable {
        balances[msg.sender] = msg.value.mul(10);
    }

    // allow transfers of tokens
    function transfer(address _to, uint256 _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        balances[_to] = _amount;
    }

    // clean up after ourselves
    function destroy(address payable _to) public {
        selfdestruct(_to);
    }
}
