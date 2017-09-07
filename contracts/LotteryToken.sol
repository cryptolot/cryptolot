pragma solidity ^0.4.11;


import "./lib/SafeMathLib.sol";
import "./token/StandardToken.sol";
import "./token/MintableToken.sol";
/*import "./token/BurnableToken.sol";
import "./token/UpgradeableToken.sol";*/


/*contract LotteryToken is UpgradeableToken, MintableToken, BurnableToken {*/
contract LotteryToken is StandardToken, MintableToken {}
