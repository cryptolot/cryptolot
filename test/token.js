var Token = artifacts.require('./Token.sol')

contract('Token', function(accounts) {
  const evmThrewError = (err) => {
    if (err.toString().includes('VM Exception while executing eth_call: invalid opcode')) {
      return true;
    }
    return false;
  }


  it('[Creation] Should create an initial balance of 10000 for the creator', function() {
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(instance) {
      return instance.balances.call(accounts[0]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 10000);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Creation] test correct setting of vanity information', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.name.call();
    }).then(function(name) {
      assert.strictEqual(name, 'Token');
      return instance.symbol.call();
    }).then(function(symbol) {
      assert.strictEqual(symbol, 'TKN');
      return instance.decimals.call();
    }).then(function(decimals) {
      assert.strictEqual(decimals.toNumber(), 1);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Creation] Should succeed in creating over 2^256 - 1 (max) tokens', function() {
    // 2^256 - 1
    return Token.new('115792089237316195423570985008687907853269984665640564039457584007913129639935', 'Token', 'TKN', 1, { from: accounts[0] }).then(function(instance) {
      return instance.totalSupply();
    }).then(function(supply) {
      var match = supply.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
      assert.isTrue(match);
    }).catch((err) => { throw new Error(err); });
  });


  // Normal transfers without approvals.
  // This is not *good* enough as the contract could still throw an error otherwise.
  // Ideally one should check balances before and after, but estimateGas currently always throws an error.
  // It's not giving estimate on gas used in the event of an error.
  //
  it('[Transfer] ether transfer should be reversed.', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return web3.eth.sendTransaction({from: accounts[0], to: instance.address, value: web3.toWei('10', 'Ether')});
    }).catch(function(result) {
      assert(true);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Transfer] should transfer 10000 to accounts[1] with accounts[0] having 10000', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.transfer(accounts[1], 10000, { from: accounts[0] });
    }).then(function(result) {
      return instance.balances.call(accounts[1]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 10000);
      return instance.balances.call(accounts[0]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 0);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Transfer] should fail when trying to transfer 10001 to accounts[1] with accounts[0] having 10000', function() {
    var instance
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.transfer.call(accounts[1], 10001, { from: accounts[0] });
    }).then(function(result) {
      assert(false, 'The preceding call should have thrown an error.');
    }).catch((err) => {
      assert(evmThrewError(err), 'the EVM did not throw an error or did not ' +
                                 'throw the expected error');
    });
  });


  it('[Transfer] should handle zero-transfers normally', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.transfer.call(accounts[1], 0, { from: accounts[0] });
    }).then(function(result) {
      assert.isTrue(result);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Approval] msg.sender should approve 100 to accounts[1]', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 100);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Approval] msg.sender approves accounts[1] of 100 & withdraws 20 once.', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.balances.call(accounts[0]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 10000);
      return instance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function(result) {
      return instance.balances.call(accounts[2]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 0);
      return instance.allowance.call(accounts[0], accounts[1]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 100);
      return instance.transferFrom.call(accounts[0], accounts[2], 20, {from: accounts[1]});
    }).then(function(result) {
      return instance.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]});
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 80);
      return instance.balances.call(accounts[2]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 20);
      return instance.balances.call(accounts[0]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 9980)
    }).catch((err) => { throw new Error(err); });
  });


  it('[Approval] msg.sender approves accounts[1] of 100 & withdraws 20 twice.', function() {
    var instance;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 100)
      return instance.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]});
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 80);
      return instance.balances.call(accounts[2]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 20);
      return instance.balances.call(accounts[0]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 9980);
      return instance.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]});
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 60)
      return instance.balances.call(accounts[2])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 40)
      return instance.balances.call(accounts[0])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 9960)
    }).catch((err) => { throw new Error(err); });
  });


  it('[Approval] msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)', function() {
    var instance = null
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result
      return instance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 100)
      return instance.transferFrom(accounts[0], accounts[2], 50, {from: accounts[1]});
    }).then(function(result) {
      return instance.allowance.call(accounts[0], accounts[1])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 50)
      return instance.balances.call(accounts[2])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 50)
      return instance.balances.call(accounts[0])
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 9950)
      return instance.transferFrom.call(accounts[0], accounts[2], 60, { from: accounts[1] });
    }).then(function(result) {
      assert(false, 'The preceding call should have thrown an error.')
    }).catch((err) => {
      assert(evmThrewError(err), 'the EVM did not throw an error or did not ' +
                                 'throw the expected error')
    });
  });


  it('[Approval] attempt withdrawal from acconut with no allowance (should fail)', function() {
    var instance = null
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result
      return instance.transferFrom.call(accounts[0], accounts[2], 60, { from: accounts[1] });
    }).then(function(result) {
      assert(false, 'The preceding call should have thrown an error.')
    }).catch((err) => {
      assert(evmThrewError(err), 'the EVM did not throw an error or did not ' +
                                 'throw the expected error')
    });
  });


  it('[Approval] allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.', function() {
    var instance = null
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result
      return instance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(function(result) {
      return instance.transferFrom(accounts[0], accounts[2], 60, {from: accounts[1]});
    }).then(function(result) {
      return instance.approve(accounts[1], 0, { from: accounts[0] });
    }).then(function(result) {
      return instance.transferFrom.call(accounts[0], accounts[2], 10, {from: accounts[1]});
    }).then(function(result) {
      assert(false, 'The preceding call should have thrown an error.')
    }).catch((err) => {
      assert(evmThrewError(err), 'the EVM did not throw an error or did not ' +
                                 'throw the expected error')
    });
  });


  it('[Approval] approve max (2^256 - 1)', function() {
    var instance = null;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.approve(accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0] });
    }).then(function(result) {
      return instance.allowance(accounts[0], accounts[1]);
    }).then(function(result) {
      var match = result.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
      assert.isTrue(match);
    }).catch((err) => { throw new Error(err); });
  });


  it('[Events] should fire Transfer event properly', function() {
    var instance = null;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.transfer(accounts[1], '2666', { from: accounts[0] });
    }).then(function(result) {
      var transferLog = result.logs.find((element) => {
        if (element.event.match('Transfer')) {
          return true;
        } else {
          return false;
        }
      });
      assert.strictEqual(transferLog.args._from, accounts[0]);
      assert.strictEqual(transferLog.args._to, accounts[1]);
      assert.strictEqual(transferLog.args._value.toString(), '2666');
    }).catch((err) => { throw new Error(err); });
  });


  it('[Events] should fire Transfer event normally on a zero transfer', function() {
    var instance = null;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.transfer(accounts[1], '0', { from: accounts[0] });
    }).then(function(result) {
      var transferLog = result.logs.find((element) => {
        if (element.event.match('Transfer')) {
          return true;
        } else {
          return false;
        }
      });
      assert.strictEqual(transferLog.args._from, accounts[0]);
      assert.strictEqual(transferLog.args._to, accounts[1]);
      assert.strictEqual(transferLog.args._value.toString(), '0');
    }).catch((err) => { throw new Error(err); });
  });


  it('[Events] should fire Approval event properly', function() {
    var instance = null;
    return Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(result) {
      instance = result;
      return instance.approve(accounts[1], '2666', { from: accounts[0] });
    }).then(function(result) {
      var approvalLog = result.logs.find((element) => {
        if (element.event.match('Approval')) {
          return true;
        } else {
          return false;
        }
      });
      assert.strictEqual(approvalLog.args._owner, accounts[0]);
      assert.strictEqual(approvalLog.args._spender, accounts[1]);
      assert.strictEqual(approvalLog.args._value.toString(), '2666');
    }).catch((err) => { throw new Error(err); });
  });
});
