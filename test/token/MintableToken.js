contract('MintableToken', function(accounts) {
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


  it('Should create a new mintable token and be able to mint.', () => {
    var instance;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.mintable.call();
      })
      .then((mintable) => {
        assert.equal(mintable, true);
      })
  });


  it('Should disable token minting.', () => {
    var instance;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.setMintable(false);
      })
      .then((setMintableTransaction) => {
        assert.notEqual(setMintableTransaction, null);

        return instance.mintable.call();
      })
      .then((mintable) => {
        assert.equal(mintable, false);
      })
  });


  /**
   * Minting
   */


  it('Should mint tokens and update total token supply.', () => {
    var instance;
    var initialBalance;
    var initialTotalSupply;
    var mintedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.totalSupply.call();
      })
      .then((_initialTotalSupply) => {
        initialTotalSupply = _initialTotalSupply.toNumber();

        return instance.balanceOf.call(accounts[1]);
      })
      .then((_initialBalance) => {
        initialBalance = _initialBalance.toNumber();

        return instance.mint(accounts[1], mintedAmount, { from: accounts[0] })
      })
      .then((mintTransaction) => {
        assert.notEqual(mintTransaction, null);

        return instance.balanceOf.call(accounts[1]);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), initialBalance + mintedAmount);

        return instance.totalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), initialTotalSupply + mintedAmount);
      });
  });


  it('Should be unable to mint tokens if minting is disabled.', () => {
    var instance;
    var mintedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.setMintable(false, { from: accounts[0] });
      })
      .then((setMintableTransaction) => {
        assert.notEqual(setMintableTransaction, null);

        return instance.mintable.call();
      })
      .then((mintable) => {
        assert.equal(mintable, false);

        return instance.mint(accounts[0], mintedAmount, { from: accounts[0] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(errors.eventMachine);
  });


  it('Should be unable to mint tokens if not contract owner.', () => {
    var instance;
    var mintedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.mint(accounts[0], mintedAmount, { from: accounts[1] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(errors.eventMachine);
  });


  /**
   * Events
   */


  it('Should fire MintingStatusChanged event properly.', () => {
    var instance;
    var mintedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.setMintable(false);
      })
      .then((setMintableTransaction) => {
        assert.notEqual(setMintableTransaction, null);

        return instance.mintable.call();
      })
      .then((mintable) => {
        assert.equal(mintable, false);

        return instance.setMintable(false, { from: accounts[0] });
      })
      .then((mintTransaction) => {
        var mintLog = mintTransaction.logs.find((element) => element.event.match('MintingStatusChanged'));

        assert.notEqual(mintLog, undefined);
      });
  });


  it('Should fire Mint event properly.', () => {
    var instance;
    var mintedAmount = 100;

    return create.Token()
      .then((_instance) => {
        instance = _instance;

        return instance.mint(accounts[0], mintedAmount, { from: accounts[0] });
      })
      .then((mintTransaction) => {
        var mintLog = mintTransaction.logs.find((element) => element.event.match('Mint'));

        assert.strictEqual(mintLog.args._to, accounts[0]);
        assert.strictEqual(mintLog.args._amount.toNumber(), mintedAmount);
      });
  });
});
