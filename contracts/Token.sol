// This Token Contract implements the full ERC 20 Token standard
// https://github.com/ethereum/EIPs/issues/20
//
// 1) Initial Finite Supply (upon creation one specifies how much is minted).
// 2) In the absence of a token registry: Optional Decimal, Symbol & Name.
// 3) Optional approveAndCall() functionality to notify a contract if an approval() has occurred.
//
pragma solidity ^0.4.11;


import "./Owned.sol";


contract Token is Owned {
  // Token version
  //
  string public version = '1.0.0';


  // Balances and spending allowances
  //
  mapping (address => uint256) public balances;
  mapping (address => mapping (address => uint256)) allowed;


  // Token configuration parameters
  //
  // Decimals describe how the token base units will work. There could be
  // 1000 base units with 3 decimals. Meaning 0.980 LTRY = 980 base units.
  // It's like comparing 1 wei to 1 ether.
  //
  uint256 public totalSupply;           // Total token supply
  string public name;                   // Cryptolot
  string public symbol;                 // LTRY
  uint8 public decimals;                // How many decimals to show


  // Determine whether the token can be minted or not
  //
  bool public mintingFinished = false;


  // Token constructor
  //
  function Token(uint256 _initialAmount, string _tokenName, string _tokenSymbol, uint8 _decimalUnits) {
    balances[msg.sender] = _initialAmount;  // Give the creator all initial tokens
    totalSupply = _initialAmount;           // Update total supply
    name = _tokenName;                      // Set the name for display purposes
    symbol = _tokenSymbol;                  // Set the symbol for display purposes
    decimals = _decimalUnits;               // Amount of decimals for display purposes
  }


  // Get the account balance of another account with address _owner
  //
  // @param _owner The address from which the balance will be retrieved
  // @return The balance
  //
  function balances(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }


  // Transfer tokens from message sender to given input address.
  // Default assumes totalSupply can't be over max (2^256 - 1).
  //
  // @notice send `_value` token to `_to` from `msg.sender`
  // @param _to The address of the recipient
  // @param _value The amount of token to be transferred
  // @return Whether the transfer was successful or not
  //
  function transfer(address _to, uint256 _value) returns (bool success) {
    require(balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]);

    balances[msg.sender] -= _value;
    balances[_to] += _value;

    Transfer(msg.sender, _to, _value);
    return true;
  }


  // The transferFrom method is used for a withdraw workflow, allowing
  // contracts to send tokens on your behalf, for example to "deposit" to a
  // contract address and/or to charge fees in sub-currencies. The command
  // should fail unless the _from account has deliberately authorized the
  // sender of the message via some approval mechanism.
  //
  // @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
  // @param _from The address of the sender
  // @param _to The address of the recipient
  // @param _value The amount of token to be transferred
  // @return Whether the transfer was successful or not
  //
  function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
    require(balances[_from] >= _value
      && allowed[_from][msg.sender] >= _value
      && balances[_to] + _value > balances[_to]);

    balances[_to] += _value;
    balances[_from] -= _value;
    allowed[_from][msg.sender] -= _value;

    Transfer(_from, _to, _value);
    return true;
  }


  // Explicitly approve _spender to withdraw from your account, multiple
  // times, up to the _value amount. If this function is called again it
  // overwrites the current allowance with _value.
  //
  // @notice `msg.sender` approves `_spender` to spend `_value` tokens
  // @param _spender The address of the account able to transfer the tokens
  // @param _value The amount of tokens to be approved for transfer
  // @return Whether the approval was successful or not
  //
  function approve(address _spender, uint256 _value) returns (bool success) {
    allowed[msg.sender][_spender] = _value;

    Approval(msg.sender, _spender, _value);
    return true;
  }


  // Approves and then calls the receiving contract
  // Call the receiveApproval function on the contract you want to be notified.
  // This crafts the function signature manually so one doesn't have to include
  // a contract in here just for this.
  //
  // receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
  //
  // @param _spender The address of the account able to transfer the tokens
  // @param _value The amount of tokens to be approved for transfer
  // @param _extraData Any extra data that might be sent
  // @return Whether the approval was successful or not
  //
  function approveAndCall(address _spender, uint256 _value, bytes _extraData) returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);

    // It is assumed that when does this that the call *should* succeed,
    // otherwise one would use vanilla approve instead.
    require(_spender.call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address,bytes)"))), msg.sender, _value, this, _extraData));
    return true;
  }


  // Returns the amount which _spender is still allowed to withdraw from _owner
  //
  // @param _owner The address of the account owning tokens
  // @param _spender The address of the account able to transfer the tokens
  // @return Amount of remaining tokens allowed to spent
  //
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }


  // Returns the amount which _spender is still allowed to withdraw from _owner
  //
  // @param _to The address of the account to reveive the tokens
  // @param _amount The amount of tokens to be minted
  // @return Amount of remaining tokens allowed to spent
  //
  function mint(address _to, uint256 _amount) onlyOwner canMint returns (bool _minted) {
    totalSupply += _amount;
    balances[_to] += _amount;
    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);
    return true;
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


  // Remove _value tokens from the system, irreversibly
  //
  // @param _value the amount of money to burn
  //
  function burn(uint256 _value) returns (bool success) {
    require (balances[msg.sender] > _value);   // Check if the sender has enough
    balances[msg.sender] -= _value;            // Subtract from the sender
    totalSupply -= _value;                      // Updates totalSupply
    Burn(msg.sender, _value);
    return true;
  }


  // Remove _value tokens from the _from address, irreversibly
  //
  // @param _from The address of the account owning tokens
  // @param _value the amount of money to burn
  //
  function burnFrom(address _from, uint256 _value) returns (bool success) {
    require(balances[_from] >= _value);                 // Check if the targeted balance is enough
    require(_value <= allowed[_from][msg.sender]);      // Check allowance
    balances[_from] -= _value;                          // Subtract from the targeted balance
    allowed[_from][msg.sender] -= _value;               // Subtract from the sender's allowance
    totalSupply -= _value;                              // Update totalSupply
    Burn(_from, _value);
    return true;
  }


  // Transfer and approval events
  //
  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);
  event ReceivedApproval(uint256 _value);
  event Burn(address indexed _burner, uint indexed _value);
  event Mint(address indexed _to, uint256 _amount);
  event MintFinished();
}
