pragma solidity ^0.4.11;


// Crowdsale contract
//
contract Crowdsale {
  address public beneficiary;
  uint public amountRaised;
  uint public fundingGoal;
  uint public price;
  uint public startTime;
  uint public endTime;
  Token public tokenReward;

  mapping(address => uint256) public balanceOf;

  event GoalReached(address _beneficiary, uint _amountRaised);
  event FundTransfer(address _backer, uint _amount, bool _isContribution);

  bool fundingGoalReached = false;
  bool crowdsaleOpen = false;

  // Crowdsale contract constructor
  //
  // @param _beneficiary Address of crowdsale beneficiary
  // @param _fundingGoal Target goal of the crowdfunding in Ethereum
  // @param _price Price of each token in Ethereun
  // @param _startTime Crowdsale starting time
  // @param _endTime Crowdsale ending time
  // @param _tokenReward Address of the token used as reward
  //
  function Crowdsale(address _beneficiary, uint _fundingGoal, uint _price, uint _startTime, uint _endTime, Token _tokenReward) {
    beneficiary = _beneficiary;
    fundingGoal = _fundingGoal * 1 ether;
    price = _price * 1 ether;
    startTime = _startTime;
    endTime = _endTime;
    tokenReward = Token(_tokenReward);
  }

  // The function without name is the default function that is called whenever
  // anyone sends funds to a contract
  //
  function () payable duringCrowdsale {
    uint amount = msg.value;
    balanceOf[msg.sender] += amount;
    amountRaised += amount;
    tokenReward.transfer(msg.sender, amount / price);
    FundTransfer(msg.sender, amount, true);
  }


  // Check if the goal or time limit has been reached



  // Check whether the action is being called during the crowdsale
  //
  modifier duringCrowdsale() {
    if (now >= startTime && now <= endTime) _;
  }


  // Check whether the crowdsale has ended
  //
  modifier afterCrowdsale() {
    if (now > endTime) _;
  }
}
