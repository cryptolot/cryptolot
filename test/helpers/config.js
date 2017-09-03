/**
 * Dependencies
 */
const path = require('path');


/**
 * Configuration
 */
module.exports = {
  // crowdsale: require(path.join(__dirname, '..', '..', 'config', 'Crowdsale')),
  token: require(path.join(__dirname, '..', '..', 'config', 'LotteryToken'))
}
