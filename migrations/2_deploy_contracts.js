var Token = artifacts.require("./Token.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

// Token configuration
//
var _tokenInitialAmount = 1000000;
var _tokenName = 'Lottery';
var _tokenSymbol = 'LTRY';
var _tokenDecimalUnits = 3;


// Crowdsale configuration
//
var _crowdsaleBeneficiary = 0x0;
var _crowdsaleFundingGoal = 1000;
var _crowdsaleAmount = _tokenInitialAmount / 2;
var _crowdsalePrice = _crowdsaleAmount / _crowdsaleFundingGoal;
var _crowdsaleStartTime = Date.now();
var _crowdsaleEndTime = new Date();
_crowdsaleEndTime.setDate(_crowdsaleEndTime.getDate() + 1);
_crowdsaleEndTime = _crowdsaleEndTime.getTime();


module.exports = function(deployer) {
  deployer.deploy(
    Token,
    _tokenInitialAmount,
    _tokenName,
    _tokenSymbol,
    _tokenDecimalUnits
  ).then(function() {
    return deployer.deploy(
      Crowdsale,
      _crowdsaleBeneficiary,
      _crowdsaleFundingGoal,
      _crowdsalePrice,
      _crowdsaleStartTime,
      _crowdsaleEndTime,
      Token.address
    ).then(() => {console.log(Crowdsale)});
  });
};
