/**
 * Crowdsale configuration
 *
 * Contains deploy configuration details such as initial token amount, token
 * name, token symbol and decimal units.
 */
var _crowdsaleBeneficiary = 0x0;
var _crowdsaleFundingGoal = 1000;
var _crowdsaleTokenLimit = _tokenInitialAmount / 2;
var _crowdsalePrice = _crowdsaleFundingGoal / _crowdsaleTokenLimit;
var _crowdsaleStartTime = Date.now();
var _crowdsaleEndTime = new Date();
_crowdsaleEndTime.setDate(_crowdsaleEndTime.getDate() + 1);
_crowdsaleEndTime = _crowdsaleEndTime.getTime();

module.exports = {
  totalSupply: totalSupply,
  name: name,
  symbol: symbol,
  decimals: decimals
};
