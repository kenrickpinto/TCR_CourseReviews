App = {
  web3Provider: null,
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
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Tcr.json", function(tcr) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Tcr = TruffleContract(tcr);
      // Connect provider to interact with contract
      App.contracts.Tcr.setProvider(App.web3Provider);
      App.listenForEvents();

    }).then(function(){
      $.getJSON("Token.json", function(token) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Token = TruffleContract(token);
        // Connect provider to interact with contract
        App.contracts.Token.setProvider(App.web3Provider);
      
  
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
    })
    // Load account data
    // web3.eth.getCoinbase(function(err, account) {
    //   console.log("Err", err);
    //   if (err === null) {
    //     App.account = account;
    //     console.log("Accnr", account);
    //     $("#accountAddress").html("Your Account: " + account);
    //   }
    // });
    App.contracts.Token.deployed().then(function(instance) {
      App.tokenInstance = instance;
    });

    // Load contract data
    App.contracts.Tcr.deployed().then(function(instance) {
      console.log("Hello");
      App.tcrInstance = instance;
      console.log(App.tcrInstance.address);
      //return App.tcrInstance.getListingDetails("0x3136443037303035354545343735000000000000000000000000000000000000");
      // return 10;
      return App.tcrInstance.getAllCourses();
      
    }).then(function(minDeposit) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      console.log(minDeposit);
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });


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
    App.tcrInstance.propose(amount, roll, course_code, review, rating)
    
  },

  challenge: function() {
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });

    let hash = $('#hash').val();
    let amount = $('#challenge_amount').val();
    
    console.log(amount);
    App.tcrInstance.challenge(hash,amount);
    
  },

  vote: function() {
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });

    let hash = $('#VoteHash').val();
    let amount = $('#VoteAmount').val();
    let choice = $('#Vote').val();
    
    console.log(amount);
    App.tcrInstance.vote(hash,amount,choice);
    
  },
  listenForEvents: function() {
    App.contracts.Tcr.deployed().then(function(instance) {

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

    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});