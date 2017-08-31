pragma solidity ^0.4.11;


import "./lib/SafeMathLib.sol";
import "./token/StandardToken.sol";
/*import "./token/BurnableToken.sol";
import "./token/MintableToken.sol";
import "./token/UpgradeableToken.sol";*/


/*contract LotteryToken is UpgradeableToken, MintableToken, BurnableToken {*/
contract LotteryToken is StandardToken {
  using SafeMathLib for uint;

  function LotteryToken(string _name, string _symbol, uint8 _decimals, address _tokenStorage) StandardToken(_name, _symbol, _decimals, _tokenStorage) {}
}
