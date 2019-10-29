// import Web3 from  '../../node_modules/web3/src/index.js';
// let TruffleContract = require('truffle-contract');
App = {
  web3Provider: null,
  web3: {},
  contracts: {},
  account: '0x0',
  tokenInstance: {},
  tcrInstance: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      App.web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      App.web3 = new Web3(App.web3Provider);
    }
    // App.web3 = web3;
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Tcr.json", function (tcr) {
      // Instantiate a new truffle contract from the artifact
      let abi = tcr.abi;
      console.log(App.web3);
      App.tcrInstance = new App.web3.eth.Contract(abi, "0x48d6F83561b0E2f65B10ace878DB7A43Ea116C91");
      // Connect provider to interact with contract
      App.tcrInstance.setProvider(App.web3Provider);
      App.listenForEvents();


    }).then(function () {
      $.getJSON("Token.json", function (token) {
        let abi = token.abi;
        App.tokenInstance = new App.web3.eth.Contract(abi, "0x662a9Afb03C4d7EC9BB3C38579bC9A9F22382259");
        // Connect provider to interact with contract
        App.tokenInstance.setProvider(App.web3Provider);
        return App.render();
      });
    });
  },

  render: function () {
    // var tcrInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    var ethereum = window.ethereum;
    ethereum.enable().then(function (accounts) {
      console.log(accounts);
      App.account = accounts[0];
      console.log("Assigned - ",App.account);
      App.tcrInstance.options.from = App.account;
      App.tokenInstance.options.from = App.account;
    });

    // App.contracts.Token.deployed().then(function(instance) {
    //   App.tokenInstance = instance;
    // });

    // Load contract data
    App.tcrInstance.methods.getAllListings().call().then(function (l) {
      let listings = [];
      for (let i = 0; i < l[0].length; i++) {
        listings.push([l[0][i], l[1][i], l[2][i]]);
      }
      console.log(listings);

    });
    console.log("1");
    console.log(App.account);
    App.tokenInstance.methods.balanceOf("0x31f8a4A938a7494aE27554588BF928096B9007F8").call().then(console.log);
    console.log("2");
  },

  propose: async function () {
    // var candidateId = $('#candidatesSelect').val();
    console.log("address", App.tcrInstance.options.address);
    console.log(App.account);
    let roll = $('#roll').val();
    let course_code = $('#course').val();
    let  review = $('#review').val();
    let amount = $('#amount').val();
    let rating = $('#rating').val();
    console.log(amount);

    App.tokenInstance.methods.approve(App.tcrInstance.options.address, 10000)
    .send(function(r){
    App.tcrInstance.methods.propose(amount, roll, course_code, review, rating).send(console.log)
    .on('error',function(error){alert("Failed")})
    });  
  },

  challenge: async function () {
    let hash = $('#hash').val();
    let amount = $('#challenge_amount').val();
    App.tokenInstance.methods.approve(App.tcrInstance.options.address, 10000)
    .send(function(r){
    App.tcrInstance.methods.challenge(hash, amount).send(console.log)
    .on('error',function(error){alert("Failed")})
    });
  },

  vote: async function () {
    let hash = $('#VoteHash').val();
    let amount = $('#VoteAmount').val();
    let choice = $('#Vote').val();
    App.tokenInstance.methods.approve(App.tcrInstance.options.address, 10000)
    .send(function(r){
    App.tcrInstance.methods.vote(hash, amount, 0).send(console.log)
    .on('error',function(error){alert("Failed")})
    });
  },

  listenForEvents: async function() {

    App.tcrInstance.events._Application({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).on('data',function(event) {
          console.log("New application", event)
          // alert("I am an application!");
          // Reload when a new vote is recorded
          App.render();
        });

        App.tcrInstance.events._Challenge({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).on('data',function( event) {
          console.log("New challenge", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        App.tcrInstance.events._Vote({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).on('data',function( event) {
          console.log("New vote", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        App.tcrInstance.events._ResolveChallenge({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).on('data',function(event) {
          console.log("Resolve challenge", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        App.tcrInstance.events._RewardClaimed({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).on('data',function( event) {
          console.log("New challenge", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        }); 

 
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});