// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract myContract{
    struct Kid {
        uint amount;
        uint maturity;
        bool paid;
    }
    mapping(address => Kid) public kids;
    address public admin;

    constructor(){
        admin = msg.sender;

    }

    function addKid(address kid, uint timeToMaturity) external payable{
        require(msg.sender == admin, 'only admin');
        require(amounts[msg.sender] == 0, 'kid already exists');
        kids[kid] = Kid(msg.value, block.timestamp + timeToMaturity, false);
    }

    function withdraw() external{
        Kid storage kid = kids[msg.sender];
        require(kid.maturity <= block.timestamp, 'too early');
        require(kid.amount > 0, 'only kid can withdraw');
        require(kid.paid = false, 'paid already');
        kid.paid = true;
        payable(msg.sender).transfer(kid.amount);
    }

}