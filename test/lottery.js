var Lottery = artifacts.require("./Lottery.sol");


contract('Lottery', function(accounts) {
  it("Should initialize properly", () => {
    Lottery.deployed().then((lottery) => {
      assert.isOk(lottery);

      lottery.prizePool.call().then((prize)=>{console.log(prize)})
    });
  });

  // it("Should let you buy a ticket", function(done) {
  //   Conference.new({
  //     from: accounts[0]
  //   }).then(function(conference) {
  //     var ticketPrice = web3.toWei(.05, 'ether');
  //     var initialBalance = web3.eth.getBalance(conference.address).toNumber();
  //
  //     conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(function() {
  //       var newBalance = web3.eth.getBalance(conference.address).toNumber();
  //       var difference = newBalance - initialBalance;
  //
  //       assert.equal(difference, ticketPrice, "Difference should be what was sent.");
  //
  //       return conference.numRegistrants.call();
  //     }).then(function(num) {
  //       assert.equal(num, 1, "There should be 1 registrant.");
  //       return conference.registrantsPaid.call(accounts[1]);
  //     }).then(function(amount) {
  //       assert.equal(amount.toNumber(), ticketPrice, "Sender has paid but is not listed.");
  //       done();
  //     }).catch(done);
  //   }).catch(done);
  // });
});


// Utility function to display the balances of each account.
//
function printBalances(accounts) {
  accounts.forEach(function(ac, i) {
    console.log(i, web3.fromWei(web3.eth.getBalance(ac), 'ether').toNumber())
  })
}
