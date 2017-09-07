/**
 * Common error handlers
 */
module.exports = {
  eventMachine: (err) => {
    assert.isTrue(err.toString().includes('VM Exception'));
  }
}
