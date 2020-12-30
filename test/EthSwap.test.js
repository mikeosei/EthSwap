const Token = artifacts.require('Token')
const EthSwap  = artifacts.require('EthSwap')

//configures assertion chai is the testing framework
require('chai')
    .use(require('chai-as-promised'))
    .should()
// converts conventional numerical value to 18 decimal place token amount 
function tokens(n) {
    return web3.utils.toWei(n,'ether');
}


contract('EthSwap',([deployer, investor])=> {
    let token,ethSwap
    before(async () => {
	token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address,tokens('1000000'))
    })
    //test to see if 'Dapp Token' is the actual name in the solidity Token contract
    describe('Token Deployment', async() => {
	it('Contract has a name', async() => {
	    const name = await token.name()
	    assert.equal(name,'DApp Token')
	})
    })
    describe('EthSwap Deployment', async() => {
        it('Contract has a name', async()	=> {
            const name = await ethSwap.name()
            assert.equal(name,'EthSwap Instant Exchange')
	})
	it('Contract has tokens', async () => {
	    let balance = await token.balanceOf(ethSwap.address)
	    assert.equal(balance.toString(),tokens('1000000'))
	})
    })
    describe('buyTokens()', async ()=> {
	let result
	//purchase tokens before each example
	before(async () => {
	    result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
	})
	it('allows user to instantly purchase tokens for a fixed price', async() =>{
	    //check if investor recieved tokens after purchase
	    let investorBalance = await token.balanceOf(investor)
	    assert.equal(investorBalance.toString(),tokens('100'))

	    //check ethswap balance after purchase
	    let ethSwapBalance
	    ethSwapBalance = await token.balanceOf(ethSwap.address)
	    //tokens balance goes down as expected - intially at 1000000
	    assert.equal(ethSwapBalance.toString(),tokens('999900'))
	    ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
	    //ether balance goes up as expected - intially at 0
	    assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1','Ether'))

	    //check logs to ensure event was emitted with the correct data
	    const event = result.logs[0].args
	    assert.equal(event.account, investor)
	    assert.equal(event.token, token.address)
	    assert.equal(event.amount.toString(), tokens('100').toString())
	    assert.equal(event.rate.toString(), '100')
	})
    })
    describe('sellTokens()', async () => {
	let result
	before(async () =>{
	    //investor must approve tokens before purchase - within the sellTokens function is the transferFrom function and this function cannot be executed without approval
	    await token.approve(ethSwap.address, tokens('100'), {from: investor })
	    //investor sells tokens
	    result = await ethSwap.sellTokens(tokens('100'), {from: investor })
	})
	it('Allows users to instantly sell tokens to ethSwap for a fixed price',async () => {
	    //check investor token balance after sold
	    let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(),tokens('0'))	    

	    //check ethswap balance after purchase                                                            
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
                                         
            assert.equal(ethSwapBalance.toString(),tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
                                                           
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0','Ether'))

	    //check logs to ensure event was emitted with the correct data                                    
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

	    // FAILURE: investor can't sell more tokens than they have
	    await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
	})
    })
    
})
