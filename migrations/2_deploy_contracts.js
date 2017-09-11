/**
 * Dependencies
 */
const path = require('path');


/**
 * Contracts and libraries
 */
var SafeMathLib = artifacts.require("./lib/SafeMathLib.sol");
var TokenStorage = artifacts.require("./storage/TokenStorage.sol");
var Token = artifacts.require("./LotteryToken.sol");
// var Crowdsale = artifacts.require("./Crowdsale.sol");


/**
 * Contracts configuration
 */
var config = {
  token: require(path.join(__dirname, '..', 'config', 'LotteryToken'))
}


module.exports = function(deployer) {
  // Deploy and link safe math library
  deployer.deploy(SafeMathLib);
  deployer.link(SafeMathLib, [ TokenStorage, Token ]);


  // Deploy token storage and initialize total supply of tokens.
  deployer.deploy(TokenStorage, config.token.totalSupply).then(() => {
    return TokenStorage.deployed();
  }).then((_tokenStorage) => {
    // Deploy token and link to deployed token storage.
    deployer.deploy(Token, config.token.name, config.token.symbol, config.token.decimals, _tokenStorage.address).then(() => {


      return Token.deployed();
    });
  });

  // deployer.then(() => {
  //   return TokenStorage.deployed(config.token.totalSupply);
  // }).then((_tokenStorage) => {
  //   return LotteryToken.deployed(config.token.name, config.token.symbol, config.token.decimals, _tokenStorage.address)
  // }).then((_lotteryToken) => {
  //   console.log("IT WORKED!!----",_lotteryToken.address)
  // });
};
