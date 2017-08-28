var Token = artifacts.require('./Token.sol')

contract('Crowdsale', function(accounts) {
  it('[Creation] Should create an initial balance of 10000 for the creator', function() {
    Token.new(10000, 'Token', 'TKN', 1, { from: accounts[0] }).then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(result) {
      assert.strictEqual(result.toNumber(), 10000);
    }).catch((err) => { throw new Error(err); });
  });

});
