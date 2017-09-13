contract('burnableToken', function(accounts) {
  /**
   * Dependencies
   */
  const path = require('path');
  const config = require(path.join(__dirname, '..', 'helpers', 'config'));
  const create = require(path.join(__dirname, '..', 'helpers', 'create'))(accounts);
  const errors = require(path.join(__dirname, '..', 'helpers', 'errors'));


  /**
   * Initialization
   */


  it('Should create a new burnable token and be able to burn.', () => {
    var instance;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.burnable.call();
      })
      .then((burnable) => {
        assert.equal(burnable, true);
      })
  });


  it('Should disable token burning.', () => {
    var instance;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.setBurnable(false);
      })
      .then((setBurnableTransaction) => {
        assert.notEqual(setBurnableTransaction, null);

        return instance.burnable.call();
      })
      .then((burnable) => {
        assert.equal(burnable, false);
      })
  });


  /**
   * Burning
   */


  it('Should burn tokens and update total token supply.', () => {
    var instance;
    var initialBalance;
    var initialTotalSupply;
    var burnedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.totalSupply.call();
      })
      .then((_initialTotalSupply) => {
        initialTotalSupply = _initialTotalSupply.toNumber();

        return instance.balanceOf.call(accounts[0]);
      })
      .then((_initialBalance) => {
        initialBalance = _initialBalance.toNumber();

        return instance.burn(burnedAmount, { from: accounts[0] })
      })
      .then((burnTransaction) => {
        assert.notEqual(burnTransaction, null);

        return instance.balanceOf.call(accounts[0]);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), initialBalance - burnedAmount);

        return instance.totalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), initialTotalSupply - burnedAmount);
      });
  });


  it('Should burn tokens from spender allowance and update total token supply.', () => {
    var instance;
    var initialBalance;
    var initialTotalSupply;
    var burnedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.totalSupply.call();
      })
      .then((_initialTotalSupply) => {
        initialTotalSupply = _initialTotalSupply.toNumber();

        return instance.balanceOf.call(accounts[0]);
      })
      .then((_initialBalance) => {
        initialBalance = _initialBalance.toNumber();

        return instance.approve(accounts[1], burnedAmount, { from: accounts[0] })
      })
      .then((approveTransaction) => {
        assert.notEqual(approveTransaction, null);

        return instance.burnFrom(accounts[0], burnedAmount, { from: accounts[1] })
      })
      .then((burnTransaction) => {
        assert.notEqual(burnTransaction, null);

        return instance.balanceOf.call(accounts[0]);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), initialBalance - burnedAmount);

        return instance.totalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), initialTotalSupply - burnedAmount);
      });
  });


  it('Should be unable to burn tokens if burning is disabled.', () => {
    var instance;
    var burnedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.setBurnable(false, { from: accounts[0] });
      })
      .then((setBurnableTransaction) => {
        assert.notEqual(setBurnableTransaction, null);

        return instance.burnable.call();
      })
      .then((burnable) => {
        assert.equal(burnable, false);

        return instance.burn(burnedAmount, { from: accounts[0] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(errors.eventMachine);
  });


  /**
   * Events
   */


  it('Should fire BurningStatusChanged event properly.', () => {
    var instance;
    var burnedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.setBurnable(false);
      })
      .then((setBurnableTransaction) => {
        assert.notEqual(setBurnableTransaction, null);

        return instance.burnable.call();
      })
      .then((burnable) => {
        assert.equal(burnable, false);

        return instance.setBurnable(false, { from: accounts[0] });
      })
      .then((burnTransaction) => {
        var burnLog = burnTransaction.logs.find((element) => element.event.match('BurningStatusChanged'));

        assert.notEqual(burnLog, undefined);
      });
  });


  it('Should fire Burn event properly.', () => {
    var instance;
    var burnedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.burn(burnedAmount, { from: accounts[0] });
      })
      .then((burnTransaction) => {
        var burnLog = burnTransaction.logs.find((element) => element.event.match('Burn'));

        assert.strictEqual(burnLog.args._from, accounts[0]);
        assert.strictEqual(burnLog.args._amount.toNumber(), burnedAmount);
      });
  });
});
