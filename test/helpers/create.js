/**
 * Dependencies
 */
const path = require('path');
const config = require(path.join(__dirname, 'config'));


/**
 * Contracts and libraries
 */
var SafeMathLib = artifacts.require("./lib/SafeMathLib.sol");
var TokenStorage = artifacts.require("./storage/TokenStorage.sol");
var StandardToken = artifacts.require("./token/StandardToken.sol");


/**
 * Helper functions for creating elements
 */
module.exports = function(accounts) {
  var create = {};


  create.TokenStorage = (options) => {
    var instance;

    options = Object.assign({}, config.token, options);

    return TokenStorage.new(options.totalSupply)
      .then((_instance) => {
        instance = _instance;

        return instance.setModule(accounts[0], true, { from: accounts[0] });
      }).then((hasSetModule) => {
        assert.notEqual(hasSetModule, null);

        return instance;
      });
  };


  create.StandardToken = (options) => {
    var instance;
    var tokenStorage;

    options = Object.assign({}, config.token, options);

    return create.TokenStorage(options)
      .then((_tokenStorage) => {
        tokenStorage = _tokenStorage;

        return StandardToken.new(options.name, options.symbol, options.decimals, tokenStorage.address);
      })
      .then((_instance) => {
        instance = _instance;

        return tokenStorage.setModule(instance.address, true, { from: accounts[0] });
      })
      .then((hasSetModule) => {
        assert.notEqual(hasSetModule, null);

        return instance;
      });
  };


  return create;
}
