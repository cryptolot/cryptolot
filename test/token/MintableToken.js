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


  it.only('Should create a new mintable token and be able to mint.', () => {
    var instance;

    return create.MintableToken()
      .then((_instance) => {
        instance = _instance;

        return instance.mintable.call();
      })
      .then((mintable) => {
        assert.equal(mintable, true);
      })
  });


  it.only('Should create disable token minting.', () => {
    var instance;

    return create.MintableToken()
      .then((_instance) => {
        instance = _instance;

        return instance.setMintable(false);
      })
      .then((mintableChangeTransaction) => {
        assert.isNotEqual(mintableChangeTransaction, null);

        return instance.mintable.call();
      })
      .then((mintable) => {
        assert.equal(mintable, true);
      })
  });


  // it('Should mint over 2^256 - 1 (max) tokens', () => {
  //   return create.StandardToken({ totalSupply: '115792089237316195423570985008687907853269984665640564039457584007913129639935' })
  //     .then(function(instance) {
  //       return instance.totalSupply.call();
  //     })
  //     .then(function(totalSupply) {
  //       var match = totalSupply.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
  //
  //       assert.isTrue(match);
  //     });
  // });


  /**
   * Events
   */


  it('Should fire Transfer event properly.', () => {
    var instance;
    var transferredAmount = 100;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.transfer(accounts[1], transferredAmount, { from: accounts[0] });
      })
      .then((transferTransaction) => {
        var transferLog = transferTransaction.logs.find((element) => element.event.match('Transfer'));

        assert.strictEqual(transferLog.args._from, accounts[0]);
        assert.strictEqual(transferLog.args._to, accounts[1]);
        assert.strictEqual(transferLog.args._value.toNumber(), transferredAmount);
      });
  });


  it('Should fire Approval event properly.', () => {
    var instance;
    var approvedAmount = 100;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.approve(accounts[1], approvedAmount, { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        var approvalLog = approvalTransaction.logs.find((element) => element.event.match('Approval'));

        assert.strictEqual(approvalLog.args._owner, accounts[0]);
        assert.strictEqual(approvalLog.args._spender, accounts[1]);
        assert.strictEqual(approvalLog.args._value.toNumber(), approvedAmount);
      });
  });
});
