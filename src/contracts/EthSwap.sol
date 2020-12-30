pragma solidity ^0.5.0;
import "./Token.sol";

contract EthSwap {
    //solidity will return a public function called name that is able to be read outside smart contract
    string public name = "EthSwap Instant Exchange";
    Token public token;
    //Redemtion rate = # of	tokens recieved	for 1 ether
    uint public rate = 100;

    //intialize event - this event provides useful to users about the token that was purchased. This information can be retrieved using the console log
    event TokensPurchased(
        //who is calling the function (who purchase the token)
        address account,
        //address of token purchased
        address token,
        //amount of tokens purchased
        uint amount,
        //redemtion rate
        uint rate
    );

    event TokensSold(
        //who is calling the function (who purchase the token)
        address account,
        //address of token purchased
        address token,
        //amount of tokens purchased
        uint amount,
        //redemtion rate
        uint rate
    );

    //the _token parameter represents the address of the Token on the blockchain and it is set equal to token. token is a variable that represents the smart contract for Token. It is used throughout the EthSwap.sol. Furthermore, the token address argument is passed within the deploy() function of 2_deploy_contracts.js
    constructor(Token _token) public {
        token = _token;
    }

    //functions keyword payable allow ether to be transfer from EthSwap contract to the person buy the tokens
    function buyTokens() public payable {
        //Amount of Etherium * Redemption rate
        //msg.value indicates how much ether is being swapped for tokens
        uint tokenAmount = msg.value * rate;

        //the balance of tokens must greater than the amount of tokens wished to be purchased
        require(token.balanceOf(address(this)) >= tokenAmount);

        // msg is a global variable in solidity and sender is the value of the address/person calling the function- transfers tokens to the user
        token.transfer(msg.sender, tokenAmount);

        // emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        //user can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // calculate amount of ether to redeem
        uint etherAmount = _amount / rate;

        //Requires that ethSwap has enough Ether
        require(address(this).balance >= etherAmount);

        //perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}
