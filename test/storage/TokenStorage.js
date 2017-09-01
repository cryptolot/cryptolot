/**
 * Dependencies
 */
const path = require('path');
const config = {
  token: require(path.join(__dirname, '..', '..', 'config', 'LotteryToken'))
}


/**
 * Contracts and libraries
 */
var SafeMathLib = artifacts.require("./lib/SafeMathLib.sol");
var TokenStorage = artifacts.require("./storage/TokenStorage.sol");


/**
 * Helper functions for creating elements
 */
var create = {
  TokenStorage: (options) => {
    options = options || config.token;

    return TokenStorage.new(options.totalSupply);
  }
}


contract('TokenStorage', function(accounts) {
  it.only('Should create a new token storage with ' + config.token.totalSupply + ' tokens for the creator.', () => {
    var instance;

    return create.TokenStorage().then((_instance) => {
      instance = _instance;

      return instance.totalSupply.call();
    }).then((totalSupply) => {
      assert.equal(totalSupply, config.token.totalSupply);

      return instance.get.call(accounts[0]);
    }).then((ownerBalance) => {
      assert.equal(ownerBalance, config.token.totalSupply);
    });
  });


  it.only('Should get the balance of token holders.', () => {
    var instance;

    return create.TokenStorage().then((_instance) => {
      instance = _instance;

      return instance.get.call(accounts[0]);
    }).then((account0Balance) => {
      assert.equal(account0Balance, config.token.totalSupply);

      return instance.get.call(accounts[1]);
    }).then((account1Balance) => {
      assert.equal(account1Balance, 0);
    });
  });



});
