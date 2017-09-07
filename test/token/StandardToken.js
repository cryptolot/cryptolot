contract('StandardToken', function(accounts) {
  /**
   * Dependencies
   */
  const path = require('path');
  const config = require(path.join(__dirname, '..', 'helpers', 'config'));
  const create = require(path.join(__dirname, '..', 'helpers', 'create'))(accounts);


  /**
   * Initialization
   */
  const eventMachineError = (err) => {
    assert.isTrue(err.toString().includes('VM Exception'));
  }


  /**
   * Initialization
   */


  it('Should create a new standard token.', () => {
    var instance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.totalSupply.call();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), config.token.totalSupply);

        return instance.name.call();
      })
      .then((name) => {
        assert.equal(name, config.token.name);

        return instance.symbol.call();
      })
      .then((symbol) => {
        assert.equal(symbol, config.token.symbol);

        return instance.decimals.call();
      })
      .then((decimals) => {
        assert.equal(decimals.toNumber(), config.token.decimals);
      });
  });


  it('Should create over 2^256 - 1 (max) tokens', () => {
    return create.StandardToken({ totalSupply: '115792089237316195423570985008687907853269984665640564039457584007913129639935' })
      .then(function(instance) {
        return instance.totalSupply.call();
      })
      .then(function(totalSupply) {
        var match = totalSupply.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');

        assert.isTrue(match);
      });
  });


  /**
   * Transfer
   */


  it('Should get token owner balance.', () => {
    var instance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.balanceOf.call(accounts[1]);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 0);
      });
  });


  it('Should reverse ether transfer to token contract.', () => {
    var instance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        // Ethereum transfer directly to the token contract address. The token
        // contract is not payable, therefore the transfer should be reversed
        return web3.eth.sendTransaction({
          from: accounts[0],
          to: instance.address,
          value: web3.toWei('10', 'Ether')
        });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(eventMachineError);
  });


  it('Should be able to transfer less than your owned tokens.', () => {
    var instance;
    var totalTokens = 10000;
    var transferredTokens = 5000;

    return create.StandardToken({ totalSupply: totalTokens })
      .then((_instance) => {
        instance = _instance;

        return instance.transfer(accounts[1], transferredTokens, { from: accounts[0] });
      }).then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.balanceOf.call(accounts[1]);
      }).then((balanceOfAccount1) => {
        assert.strictEqual(balanceOfAccount1.toNumber(), transferredTokens);

        return instance.balanceOf.call(accounts[0]);
      }).then((balanceOfAccount0) => {
        assert.strictEqual(balanceOfAccount0.toNumber(), totalTokens - transferredTokens);
      });
  });


  it('Should be able to transfer all of your owned tokens.', () => {
    var instance;
    var totalTokens = 10000;
    var transferredTokens = 10000;

    return create.StandardToken({ totalSupply: totalTokens })
      .then((_instance) => {
        instance = _instance;

        return instance.transfer(accounts[1], transferredTokens, { from: accounts[0] });
      }).then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.balanceOf.call(accounts[1]);
      }).then((balanceOfAccount1) => {
        assert.strictEqual(balanceOfAccount1.toNumber(), transferredTokens);

        return instance.balanceOf.call(accounts[0]);
      }).then((balanceOfAccount0) => {
        assert.strictEqual(balanceOfAccount0.toNumber(), totalTokens - transferredTokens);
      });
  });


  it('Should be unable to transfer more than your owned tokens.', () => {
    var instance;
    var totalTokens = 10000;
    var transferredTokens = 10001;

    return create.StandardToken({ totalSupply: totalTokens })
      .then((_instance) => {
        instance = _instance;

        return instance.transfer(accounts[1], transferredTokens, { from: accounts[0] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(eventMachineError);
  });


  it('Should be unable to transfer 0 tokens.', () => {
    var instance;
    var transferredTokens = 0;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.transfer.call(accounts[1], transferredTokens, { from: accounts[0] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(eventMachineError);
  });


  /**
   * Approval
   */


  it('Should approve 100 tokens from owner to spender.', () => {
    var instance;
    var approvedTokens = 100;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.approve(accounts[1], approvedTokens, { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens);
      });
  });


  it.only('Should approve 100 from owner to spender, who spends 20 once.', () => {
    var instance;
    var approvedTokens = 100;
    var spentTokens = 20;
    var initialOwnerBalance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.balanceOf.call(accounts[0]);
      })
      .then((_initialOwnerBalance) => {
        initialOwnerBalance = _initialOwnerBalance.toNumber();
        assert.strictEqual(initialOwnerBalance, config.token.totalSupply);

        return instance.approve(accounts[1], approvedTokens, { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.balanceOf.call(accounts[2]);
      })
      .then((initialSpenderBalance) => {
        assert.strictEqual(initialSpenderBalance.toNumber(), 0);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens, { from: accounts[1] });
      })
      .then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens - spentTokens);

        return instance.balanceOf.call(accounts[2]);
      })
      .then((receiverBalance) => {
        assert.strictEqual(receiverBalance.toNumber(), spentTokens);

        return instance.balanceOf.call(accounts[0]);
      })
      .then((finalOwnerBalance) => {
        assert.strictEqual(finalOwnerBalance.toNumber(), initialOwnerBalance - spentTokens)
      });
  });


  it.only('Should approve 100 from owner to spender, who spends 50 twice.', () => {
    var instance;
    var approvedTokens = 100;
    var spentTokens = [50, 50];
    var initialOwnerBalance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.balanceOf.call(accounts[0]);
      })
      .then((_initialOwnerBalance) => {
        initialOwnerBalance = _initialOwnerBalance.toNumber();
        assert.strictEqual(initialOwnerBalance, config.token.totalSupply);

        return instance.approve(accounts[1], approvedTokens, { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.balanceOf.call(accounts[2]);
      })
      .then((initialSpenderBalance) => {
        assert.strictEqual(initialSpenderBalance.toNumber(), 0);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens[0], { from: accounts[1] });
      })
      .then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens - spentTokens[0]);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens[1], { from: accounts[1] });
      })
      .then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens - (spentTokens[0] + spentTokens[1]));

        return instance.balanceOf.call(accounts[2]);
      })
      .then((receiverBalance) => {
        assert.strictEqual(receiverBalance.toNumber(), spentTokens[0] + spentTokens[1]);

        return instance.balanceOf.call(accounts[0]);
      })
      .then((finalOwnerBalance) => {
        assert.strictEqual(finalOwnerBalance.toNumber(), initialOwnerBalance - (spentTokens[0] + spentTokens[1]))
      });
  });


  it.only('Should approve 100 from owner to spender, who spends 50 and 60 (should fail).', () => {
    var instance;
    var approvedTokens = 100;
    var spentTokens = [50, 60];
    var initialOwnerBalance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.balanceOf.call(accounts[0]);
      })
      .then((_initialOwnerBalance) => {
        initialOwnerBalance = _initialOwnerBalance.toNumber();
        assert.strictEqual(initialOwnerBalance, config.token.totalSupply);

        return instance.approve(accounts[1], approvedTokens, { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.balanceOf.call(accounts[2]);
      })
      .then((initialSpenderBalance) => {
        assert.strictEqual(initialSpenderBalance.toNumber(), 0);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens[0], { from: accounts[1] });
      })
      .then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens - spentTokens[0]);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens[1], { from: accounts[1] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(eventMachineError);
  });


  it.only('Should attempt withdrawal with no allowance (should fail).', () => {
    var instance;
    var approvedTokens = 0;
    var spentTokens = 100;
    var initialOwnerBalance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens, { from: accounts[1] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(eventMachineError);
  });


  it.only('Should approve 100 from owner to spender, who spends 50. Owner modifies approval to 0 to spender, who attempts to spend 50. (should fail).', () => {
    var instance;
    var approvedTokens = [100, 0];
    var spentTokens = [50, 50];
    var initialOwnerBalance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.balanceOf.call(accounts[0]);
      })
      .then((_initialOwnerBalance) => {
        initialOwnerBalance = _initialOwnerBalance.toNumber();
        assert.strictEqual(initialOwnerBalance, config.token.totalSupply);

        return instance.approve(accounts[1], approvedTokens[0], { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.balanceOf.call(accounts[2]);
      })
      .then((initialSpenderBalance) => {
        assert.strictEqual(initialSpenderBalance.toNumber(), 0);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens[0]);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens[0], { from: accounts[1] });
      })
      .then((transferTransaction) => {
        assert.notEqual(transferTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens[0] - spentTokens[0]);

        return instance.approve(accounts[1], approvedTokens[1], { from: accounts[0] })
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.allowance.call(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(allowance.toNumber(), approvedTokens[1]);

        return instance.transferFrom(accounts[0], accounts[2], spentTokens[1], { from: accounts[1] });
      })
      .then(() => {
        assert(false, 'The preceding call should have thrown an error.');
      })
      .catch(eventMachineError);
  });


  it.only('Should approve max (2^256 - 1).', () => {
    var instance;

    return create.StandardToken()
      .then((_instance) => {
        instance = _instance;

        return instance.approve(accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0] });
      })
      .then((approvalTransaction) => {
        assert.notEqual(approvalTransaction, null);

        return instance.allowance(accounts[0], accounts[1]);
      })
      .then((result) => {
        var match = result.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
        assert.isTrue(match);
      });
  });


  /**
   * Events
   */


  it.only('Should fire transfer event properly.', () => {
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




});
