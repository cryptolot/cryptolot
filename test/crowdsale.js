var Crowdsale = artifacts.require('./Crowdsale.sol')

contract('Crowdsale', function(accounts) {
  it('[Creation] Should create an initial balance of 10000 for the creator', function() {
    Crowdsale.deployed().then(function(instance) {
      // console.log(instance)
    })
  });

});
