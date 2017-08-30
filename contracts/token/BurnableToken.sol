pragma solidity ^0.4.6;


import "../lib/SafeMathLib.sol";
import "./StandardToken.sol";


// A token that can increase its supply by another contract.
//
// This allows uncapped crowdsale by dynamically increasing the supply when money pours in.
// Only mint agents, contracts whitelisted by owner, can mint new tokens.
//
contract BurnableToken is StandardToken {


  using SafeMathLib for uint;


  // Remove _value tokens from the system, irreversibly
  //
  // @param _value the amount of money to burn
  //
  function burn(uint256 _value) returns (bool success) {
    require (balances[msg.sender] > _value);                      // Check if the sender has enough
    balances[msg.sender] = balances[msg.sender].minus(_value);   // Subtract from the sender
    totalSupply = totalSupply.minus(_value);                     // Updates totalSupply
    Burn(msg.sender, _value);
    return true;
  }


  // Remove _value tokens from the _from address, irreversibly
  //
  // @param _from The address of the account owning tokens
  // @param _value the amount of money to burn
  //
  function burnFrom(address _from, uint256 _value) returns (bool success) {
    require(balances[_from] >= _value);                                       // Check if the targeted balance is enough
    require(_value <= allowed[_from][msg.sender]);                            // Check allowance
    balances[_from] = balances[_from].minus(_value);                         // Subtract from the targeted balance
    allowed[_from][msg.sender] = allowed[_from][msg.sender].minus(_value);   // Subtract from the sender's allowance
    totalSupply = totalSupply.minus(_value);                                 // Update totalSupply
    Burn(_from, _value);
    return true;
  }


  // Burn events
  //
  event Burn(address indexed _burner, uint indexed _value);
}
