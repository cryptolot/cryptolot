// Implements ERC 20 Token standard
// https://github.com/ethereum/EIPs/issues/20
//
pragma solidity ^0.4.8;

import "./Token.sol";


// Cryptolot lottery decentralized application
//
contract Cryptolot is Token {
  // Public variables of the token
  //
  string public name;                   // Cryptolot
  string public symbol;                 // LTRY
  string public version = 'H0.1';       // Human 0.1 standard. Just an arbitrary versioning scheme.
  uint8 public decimals;                // How many decimals to show. ie. There could 1000 base units with 3 decimals.
                                        // Meaning 0.980 LTRY = 980 base units. It's like comparing 1 wei to 1 ether.


  // Lottery data structure containing the 3 weekly winners and the total
  // prize pool token supply
  //
  // @param startTime Lottery start date
  // @param endTime Lottery end date
  // @param prizePoolSupply Total prize pool when the lottery ended
  //
  struct Lottery {
    uint256 prizePoolSupply;
    uint startTime;
    uint endTime;
  }

  // Account balances for coin holders
  //
  mapping (address => uint256) balances;


  // Past contests and their winners. The last lottery added is the ongoing one.
  // Unfortunately solidity doesn't support mappings inside of structs properly.
  //
  mapping (uint => Lottery) public lotteries;
  mapping (uint => address[]) public winners;
  mapping (uint => address[]) participants;
  mapping (uint => uint256[]) participantTokens;
  uint currentLottery;


  // Prize pool address, public, for everyone to see and send coins to.
  //
  address public prizePool;


  // Lottery settings
  //
  uint public lotteryDuration = 7 * 1 days;
  uint public winnerCount = 3;


  // Give the creator all initial tokens, update total supply, set the name for display purposes,
  // set amount of decimals for display purposes and set the symbol for display purposes
  //
  function Cryptolot(uint256 _initialAmount, string _tokenName, uint8 _decimalUnits, string _tokenSymbol, address _prizePool) {
    balances[msg.sender] = _initialAmount;
    totalSupply = _initialAmount;
    name = _tokenName;
    symbol = _tokenSymbol;
    decimals = _decimalUnits;
    prizePool = _prizePool;
  }


  // Transfer tokens from message sender to given input address
  // Default assumes totalSupply can't be over max (2^256 - 1)
  //
  function transfer(address _to, uint256 _value) returns (bool success) {
    require(balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]);

    balances[msg.sender] -= _value;
    balances[_to] += _value;

    Transfer(msg.sender, _to, _value);
    return true;
  }


  // Transfer tokens from one address to another
  //
  function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
    require(balances[_from] >= _value && balances[_to] + _value > balances[_to]);

    balances[_to] += _value;
    balances[_from] -= _value;

    Transfer(_from, _to, _value);
    return true;
  }


  // Get balance for given owner address
  //
  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }


  // Get balance for given owner address
  //
  function participate(address _participant, uint256 _value) constant returns (bool success) {
    require(verifyActiveLottery());

    if(transferFrom(_participant, prizePool, _value)) {
      participants[currentLottery].push(_participant);
      participantTokens[currentLottery].push(_value);
    }

    return true;
  }


  // Get balance for given owner address
  //
  function startLottery() constant returns (bool success) {
    uint currentDateTime = now;

    // Initially start a new lottery with no winners, starting now and ending in
    // 7 days from today
    //
    lotteries[currentLottery] = Lottery({
      startTime: currentDateTime,
      endTime: currentDateTime + lotteryDuration,
      prizePoolSupply: 0
    });

    return true;
  }


  // Generate multiple entries using an interval simulator. The random number will be
  // inside the [0, entryTotal) interval. The entryUpperBound variable simulates
  // the closed upper bound of the interval.
  //
  function endLottery() constant returns (bool success) {
    uint256 entryTotal;
    uint256 entryUpperBound;

    // Calculate total number of entries based on how many participant tokens
    // there are in the current game
    //
    for(uint participantIndex = 0; participantIndex < participants[currentLottery].length; participantIndex++) {
      entryTotal += participantTokens[currentLottery][participantIndex];
    }

    // Create multiple entries for each participant to simulate multiple
    // distributed chances
    //
    for(uint winnerIndex = 0; winnerIndex < winnerCount; winnerIndex++) {
      uint winningEntry = getRandomWinner(1, entryTotal);

      for(participantIndex = 0; participantIndex < participants[currentLottery].length; participantIndex++) {
        entryUpperBound += participantTokens[currentLottery][participantIndex];

        // If the winning entry is inside the [tokensLowerBound, tokensUpperBound)
        // interval, choose the current participant as a winner
        //
        if (winningEntry < entryUpperBound) {
          winners[currentLottery].push(participants[currentLottery][participantIndex]);
          break;
        }
      }
    }

    currentLottery += 1;
    return true;
  }

  // Generates a random number from 0 to participant shares count based on the
  // last block hash
  //
  function getRandomWinner(uint _seed, uint _max) constant returns (uint randomNumber) {
      return(uint(sha3(block.blockhash(block.number - 1), _seed )) % _max);
  }


  // Get balance for given owner address
  //
  function verifyActiveLottery() constant returns (bool success) {
    require(lotteries[currentLottery].endTime >= now);
    return true;
  }
}
