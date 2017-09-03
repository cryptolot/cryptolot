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
var accounts;
var create = {
  TokenStorage: (options) => {
    var instance;

    options = options || config.token;

    return TokenStorage.new(options.totalSupply)
      .then((_instance) => {
        instance = _instance;

        return instance.setModule(accounts[0], true, { from: accounts[0] });
      }).then((hasSetModule) => {
        assert.notEqual(hasSetModule, null);

        return instance;
      });
  }
}


contract('TokenStorage', function(_accounts) {
  accounts = _accounts;


  /**
   * Initialization
   */


  it.only('Should create a new token storage with ' + config.token.totalSupply + ' tokens for the creator.', () => {
    var instance;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.totalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply, config.token.totalSupply);

        return instance.get.call(accounts[0]);
      })
      .then((ownerBalance) => {
        assert.equal(ownerBalance, config.token.totalSupply);
      });
  });


  /**
   * Modules
   */


  it.only('Should set and verify that an address is a module.', () => {
    var instance;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.setModule(accounts[1], true, { from: accounts[0] });
      })
      .then((hasSetModule) => {
        assert.notEqual(hasSetModule, null);

        return instance.getModule.call(accounts[1]);
      })
      .then((isModule) => {
        assert.equal(isModule, true);
      });
  });


  it.only('Should verify that an address is not a module.', () => {
    var instance;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.getModule.call(accounts[1]);
      })
      .then((isModule) => {
        assert.equal(isModule, false);
      });
  });


  /**
   * Balance
   */


  it.only('Should get the balance of token holders.', () => {
    var instance;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.get.call(accounts[0]);
      })
      .then((account0Balance) => {
        assert.equal(account0Balance, config.token.totalSupply);

        return instance.get.call(accounts[1]);
      })
      .then((account1Balance) => {
        assert.equal(account1Balance, 0);
      });
  });


  it.only('Should increase the balance of a token holder.', () => {
    var instance;
    var initialBalance;
    var balanceIncrease = 100;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.get.call(accounts[1]);
      })
      .then((_initialBalance) => {
        initialBalance = _initialBalance.toNumber();
        assert.equal(initialBalance, 0);

        return instance.increase(accounts[1], balanceIncrease, { from: accounts[0] });
      })
      .then((hasIncreasedBalance) => {
        assert.notEqual(hasIncreasedBalance, null);

        return instance.get.call(accounts[1]);
      })
      .then((accountBalance) => {
        assert.equal(accountBalance.toNumber(), initialBalance + balanceIncrease);
      });
  });


  it.only('Should decrease the balance of a token holder.', () => {
    var instance;
    var initialBalance;
    var balanceDecrease = 100;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.get.call(accounts[0]);
      })
      .then((_initialBalance) => {
        initialBalance = _initialBalance.toNumber();
        assert.equal(initialBalance, config.token.totalSupply);

        return instance.decrease(accounts[0], balanceDecrease, { from: accounts[0] });
      })
      .then((hasDecreasedBalance) => {
        assert.notEqual(hasDecreasedBalance, null);

        return instance.get.call(accounts[0]);
      })
      .then((accountBalance) => {
        assert.equal(accountBalance.toNumber(), initialBalance - balanceDecrease);
      });
  });


  /**
   * Total Supply
   */


  it.only('Should get the total supply of tokens.', () => {
    var instance;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.getTotalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply, config.token.totalSupply);
      });
  });


  it.only('Should increase the total supply of tokens.', () => {
    var instance;
    var supplyIncrease = 1000;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.increaseTotalSupply(supplyIncrease, { from: accounts[0] });
      })
      .then((hasIncreasedTotalSupply) => {
        assert.notEqual(hasIncreasedTotalSupply, null);

        return instance.getTotalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), config.token.totalSupply + supplyIncrease);
      });
  });


  it.only('Should decrease the total supply of tokens.', () => {
    var instance;
    var supplyDecrease = 1000;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.decreaseTotalSupply(supplyDecrease, { from: accounts[0] });
      })
      .then((hasDecreasedTotalSupply) => {
        assert.notEqual(hasDecreasedTotalSupply, null);

        return instance.getTotalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), config.token.totalSupply - supplyDecrease);
      });
  });


  /**
   * Allowances
   */


  it.only('Should get the allowance of a token owner from another.', () => {
    var instance;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.getAllowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(allowance, 0);
      });
  });


  it.only('Should set the allowance of a token owner from another.', () => {
    var instance;
    var allowanceSet = 100;

    return create.TokenStorage()
      .then((_instance) => {
        instance = _instance;

        return instance.setAllowance(accounts[0], accounts[1], allowanceSet, { from: accounts[0] });
      })
      .then((hasSetAllowance) => {
        assert.notEqual(hasSetAllowance, null);

        return instance.getAllowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(allowance.toNumber(), allowanceSet);
      });
  });


  // it.only('Should set the allowance of a token owner and spend a part of the tokens.', () => {
  //   var instance;
  //   var allowance = 100;
  //   var spends = 50;
  //
  //   return create.TokenStorage()
  //     .then((_instance) => {
  //       instance = _instance;
  //
  //       return instance.setAllowance(accounts[0], accounts[1]);
  //     })
  //     .then((allowance) => {
  //       assert.equal(allowance, 0);
  //     });
  // });


});
