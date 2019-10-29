// import Web3 from  '../../node_modules/web3/src/index.js';
// let TruffleContract = require('truffle-contract');
App = {
  web3Provider: null,
  web3: {},
  contracts: {},
  account: '0x0',
  tokenInstance: {},
  tcrInstance: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
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

  initContract: function() {
    $.getJSON("Tcr.json", function(tcr) {
      // Instantiate a new truffle contract from the artifact
      let abi = tcr.abi;
      console.log(App.web3);
      App.tcrInstance = new App.web3.eth.Contract(abi, "0x2FA656796b72f200baEC1FBF64c5D7e31F4c51D3") ;
      //  TruffleContract(tcr);
      // Connect provider to interact with contract
      App.tcrInstance.setProvider(App.web3Provider);
      //App.listenForEvents();
    

    }).then(function(){
      $.getJSON("Token.json", function(token) {
        // Instantiate a new truffle contract from the artifact
        // App.contracts.Token = TruffleContract(token);
        // Connect provider to interact with contract
        // App.contracts.Token.setProvider(App.web3Provider);
      
  
        return App.render();
      });
    });    
  },

  render: function() {
    // var tcrInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    var ethereum = window.ethereum;
    ethereum.enable().then(function(accounts){
      console.log(accounts);
      App.account = accounts[0];
      App.tcrInstance.from = App.account;
    })
    
    // App.contracts.Token.deployed().then(function(instance) {
    //   App.tokenInstance = instance;
    // });

    // Load contract 
    console.log("1");
    let listings =  App.tcrInstance.methods.getAllListings().call().then(console.log);
    console.log("2");
    // console.log(listings);
    // App.contracts.Tcr.options.data = {}
    // App.contracts.Tcr.deploy().then(function(instance) {
    //   console.log("Hello");
    //   App.tcrInstance = instance;
    //   console.log(App.tcrInstance.address);
    //   // return App.tcrInstance.getListingDetails("0x3136443037303035354545343735000000000000000000000000000000000000");
    //   // return App.tcrInstance.getDetails();
    //   let listings = App.tcrInstance.getAllListings.call();
    //   return listings;
    //   // return 10;
    // }).then(function(minDeposit) {
    //   var candidatesResults = $("#candidatesResults");
    //   candidatesResults.empty();
    //   console.log(minDeposit[0]);
    //   // for (var i = 1; i <= candidatesCount; i++) {
    //   //   electionInstance.candidates(i).then(function(candidate) {
    //   //     var id = candidate[0];
    //   //     var name = candidate[1];
    //   //     var voteCount = candidate[2];

    //   //     // Render candidate Result
    //   //     var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
    //   //     candidatesResults.append(candidateTemplate);
    //   //   });
    //   // }

    //   loader.hide();
    //   content.show();
    // }).catch(function(error) {
    //   console.warn(error);
    // });
  },

  propose: function() {
    // var candidateId = $('#candidatesSelect').val();
    console.log(typeof(App.tcrInstance.address));
    console.log(App.account);
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });
    //App.tcrInstance.propose(200, "16D070055", "EE475", "naice", 4);

    let roll = $('#roll').val();
    let course_code = $('#course').val();
    let  review = $('#review').val();
    let amount = $('#amount').val();
    let rating = $('#rating').val();
    console.log(amount);
    App.tcrInstance.methods.propose(amount, roll, course_code, review, rating)
    
  },

  challenge: function() {
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });

    let hash = $('#hash').val();
    let amount = $('#challenge_amount').val();
    
    console.log(amount);
    App.tcrInstance.methods.challenge(hash,amount);
    
  },

  vote: function() {
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });

    let hash = $('#VoteHash').val();
    let amount = $('#VoteAmount').val();
    let choice = $('#Vote').val();
    
    console.log(amount);
    App.tcrInstance.methods.vote(hash,amount,choice);
    
  }
  
  /*,
  listenForEvents: function() {

        instance._Application({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("New application", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        instance._Challenge({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("New challenge", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        instance._Vote({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("New vote", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        instance._ResolveChallenge({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("New challenge", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

        instance._RewardClaimed({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("New challenge", event)
          //alert("I am an alert box!");
          // Reload when a new vote is recorded
          App.render();
        });

  }*/
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});