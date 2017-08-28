var Lottery = artifacts.require("./Lottery.sol");

var initialAmount = 1000000;
var tokenName = 'Lottery';
var tokenSymbol = 'LTRY';
var decimalUnits = 3;

module.exports = function(deployer) {
  deployer.deploy(Lottery, initialAmount, tokenName, tokenSymbol, decimalUnits);
};
