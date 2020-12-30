const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
    // Deploy Token to blockchain
    await deployer.deploy(Token);
    //create an object of the Token class
    const token = await Token.deployed();
    //Deploy EthSwap to blockchain
    //When deploying EthSwap contract, the token address must be included since it will be used in EthSwap
    await deployer.deploy(EthSwap,token.address);
    // create object of the EthSwap class
    const ethswap = await EthSwap.deployed();

    //Transfer 1 million tokens to EthSwap - Originally the tokens belonged to the first Ganache account(Reason: Token.sol constructor will transfer the 1 million tokens to the account that deploys to the blockchain). We want tokens to all belong to EthSwap 
    await token.transfer(ethswap.address,'1000000000000000000000000');
};
