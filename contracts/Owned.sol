pragma solidity ^0.4.8;

// Owned contract, some functionality is accessible exclusively by the contract
// owner. Provides basic access functionality.
//
contract Owned {
  address public owner;

  // Sets the owner of the contract to be the contract creator
  //
  function Owned() {
    owner = msg.sender;
  }

  // Allows only the contract owner to call the modified contract function
  //
  modifier onlyOwner {
    require (msg.sender == owner);
    _;
  }

  // Transfers contract ownership
  //
  function transferOwnership(address newOwner) onlyOwner {
    owner = newOwner;
  }
}
