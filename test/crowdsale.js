var Token = artifacts.require('./Token.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')


var _tokenInitialAmount = 10000000;
var _tokenName = 'Token';
var _tokenSymbol = 'TKN';
var _tokenDecimalUnits = 1;


var _crowdsaleBeneficiary = 0x0;
var _crowdsaleFundingGoal = 1000;
var _crowdsaleTokenLimit = _tokenInitialAmount / 2; // 5.000.000
var _crowdsalePrice = _crowdsaleFundingGoal / _crowdsaleTokenLimit; // 5.000
var _crowdsaleStartTime = Date.now();
var _crowdsaleEndTime = new Date();

contract('Crowdsale', function(accounts) {
  it.only('[Creation] Should create crowdsale with the given Token', function() {
    var instance;

    return Token.new(_tokenInitialAmount, _tokenName, _tokenSymbol, _tokenDecimalUnits, { from: accounts[0] }).then(function(_tokenReward) {
      return Crowdsale.new(_crowdsaleBeneficiary, _crowdsaleFundingGoal, _crowdsalePrice, _crowdsaleStartTime, _crowdsaleEndTime, _tokenReward.address).then(function(result) {
        instance = result;

        instance.beneficiary.call().then(function(result) {
          assert.equal(result, _crowdsaleBeneficiary);
          return instance.fundingGoal.call();
        }).then(function(result) {
          assert.equal(result, _crowdsaleFundingGoal);
          return instance.price.call().then(console.log)
        });
      });
    });

  });

});
