pragma solidity ^0.4.6;


import "../lib/SafeMathLib.sol";
import "./StandardToken.sol";


// A token that can increase its supply by another contract.
//
// This allows uncapped crowdsale by dynamically increasing the supply when money pours in.
// Only mint agents, contracts whitelisted by owner, can mint new tokens.
//
contract MintableToken is StandardToken {


  using SafeMathLib for uint;


  // Determine whether the token can be minted or not
  //
  bool public mintingFinished = false;


  // List of agents that are allowed to create new tokens
  //
  mapping (address => bool) public mintAgents;


  // Returns the amount which _spender is still allowed to withdraw from _owner
  //
  // @param _to The address of the account to reveive the tokens
  // @param _amount The amount of tokens to be minted
  // @return Amount of remaining tokens allowed to spent
  //
  function mint(address _to, uint256 _amount) onlyMintAgent canMint public returns (bool _minted) {
    totalSupply = totalSupply.plus(_amount);
    balances[_to] = balances[_to].plus(_amount);

    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);

    return true;
  }


  // Owner can allow a crowdsale contract to mint new tokens.
  //
  function setMintAgent(address addr, bool state) onlyOwner canMint public {
    mintAgents[addr] = state;
    MintingAgentChanged(addr, state);
  }


  // Only crowdsale contracts are allowed to mint new tokens
  //
  modifier onlyMintAgent() {
    require(mintAgents[msg.sender]);
    _;
  }


  // Stop minting new tokens.
  // @return True if the operation was successful.
  //
  function finishMinting() onlyOwner returns (bool _finished) {
    mintingFinished = true;

    MintFinished();

    return true;
  }


  // Determine whether new tokens can be minted
  //
  modifier canMint() {
    require(!mintingFinished);
    _;
  }


  event Mint(address indexed _to, uint256 _amount);
  event MintFinished();
  event MintingAgentChanged(address _addr, bool _state);
}
