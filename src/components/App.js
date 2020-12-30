import React, { Component } from 'react';
import Web3 from 'web3';
// front-end interacts with smart contract properties by importing the json version of the smart contract
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'
import Navbar from './Navbar'
import './App.css';
import Main from './Main'

class App extends Component {
  //a special function that runs prior to the rendering of html - include method calls to Web3 load and bloackbhain data
  async componentWillMount() {
    await this.loadWeb3()
    //console.log(window.web3)
    await this.loadBlockchainData()
  }
  //load data about acount on blockchain
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    //the following line stores the state of account[0] to account. Notation if from the below constructor
    this.setState({ account: accounts[0] })
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })


    //setting up javascript version of smart contract to load token
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')

    }

    //load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
    this.setState({ loading: false })
  }
  //loads web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  //helps store meta mask state info on account(s) logged in. Now the state data can be accessed throughout the application
  constructor(props) {
    super(props)
    //default values for each state being track
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }



  render() {
    let content
    // loading icon
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main 
      ethBalance = {this.state.ethBalance} 
      tokenBalance = {this.state.tokenBalance} 
      buyTokens = {this.buyTokens}
      sellTokens = {this.sellTokens} />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style ={{maxWidth :'600px'}}>
              <div className="content mr-auto ml-auto">
                
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
