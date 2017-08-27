var Lottery = artifacts.require("./Lottery.sol");

var initialAmount = 1000000;
var tokenName = 'Cryptolot';
var tokenSymbol = 'LTRY';
var decimalUnits = 3;

module.exports = function(deployer) {
  deployer.deploy(Lottery, initialAmount, tokenName, tokenSymbol, decimalUnits);
};
