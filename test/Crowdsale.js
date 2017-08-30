var Token = artifacts.require('./LotteryToken.sol')
var Crowdsale = artifacts.require('./Crowdsale.sol')


var _tokenInitialAmount = 10000000;
var _tokenName = 'Token';
var _tokenSymbol = 'TKN';
var _tokenDecimalUnits = 1;


var _crowdsaleBeneficiary = 0x0;
var _crowdsaleFundingGoal = 1000;
var _crowdsaleTokensLimit = _tokenInitialAmount / 2; // 5.000.000
var _crowdsalePrice = _crowdsaleFundingGoal / _crowdsaleTokensLimit; // 5.000
var _crowdsaleStartTime = Date.now();
var _crowdsaleEndTime = new Date();
var _crowdsaleState = 'Preparing';

contract('Crowdsale', function(accounts) {
  it.only('[Creation] Should create crowdsale with the given Token', function() {
    console.log(Token)
    return Token.new(_tokenInitialAmount, _tokenName, _tokenSymbol, _tokenDecimalUnits, { from: accounts[0] }).then(function(_tokenReward) {
      console.log(_tokenReward)

      return Crowdsale.new(_crowdsaleBeneficiary, _crowdsaleFundingGoal, _crowdsalePrice, _crowdsaleStartTime, _crowdsaleEndTime, _tokenReward.address).then(function(instance) {

        console.log(instance)

        instance.beneficiary.call().then(function(result) {
          assert.equal(result, _crowdsaleBeneficiary);
          return instance.fundingGoal.call();
        }).then(function(result) {
          assert.equal(result, _crowdsaleFundingGoal);
          return instance.price.call()
        }).then(function(result) {
          assert.equal(result, _crowdsalePrice);
          return instance.startTime.call()
        }).then(function(result) {
          assert.equal(result, _crowdsaleStartTime);
          return instance.endTime.call()
        }).then(function(result) {
          assert.equal(result, _crowdsaleEndTime);
          return instance.tokensLimit.call()
        }).then(function(result) {
          assert.equal(result, _crowdsaleTokensLimit);
          return instance.state.call()
        }).then(function(result) {
          assert.equal(result, _crowdsaleState);
          return instance.tokenReward.call()
        }).then(function(result) {
          assert.equal(result, _tokenReward.address);
        });
      });
    });

  });

});
