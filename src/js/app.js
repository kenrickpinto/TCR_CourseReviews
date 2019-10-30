// import Web3 from  '../../node_modules/web3/src/index.js';
// let TruffleContract = require('truffle-contract');


let oneReviewDiv = function({roll, review, rating, lHash, wl}){
  let icon;
  if (wl){
    icon = "<i class=\"material-icons\ green-text\">verified_user</i>"
  } else if(App.challenges[lHash]){ // challenge going on
    icon = "<i class=\"material-icons\ red-text\">thumbs_up_down</i>"
  } else{
    icon = "<i class=\"material-icons\ yellow-text\">watch_later</i>"
  }

  return(
    `<div class="row hoverable">
        <div class="col s2">${roll}</div>
        <div class="col s4">${review}</div>
        <div class="col s1">${rating}<i class=\"material-icons yellow-text\">star</i>"</div>
        <div class="col s1">${icon}</div>
        <div class="col s3 tooltipped data-position=\"bottom\" data-tooltip=\"Click to Copy\" truncate copy_content">${lHash}</div>
    </div>`
  );
}

let getCHeader = function(a,b,c){
  return (
    `<div class="collapsible-header row">
                        <div class="col s4">${a}</div>
                        <div class="col s4">${b}</div>
                        <div class="col s4">${c}</div>
                      </div>`
  );
}

App = {
  web3Provider: null,
  web3: {},
  contracts: {},
  courses: {},
  challenges: {},
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
      App.tcrInstance = new App.web3.eth.Contract(abi, "0xa570D419ce5d72464fEb4058cdc6D045E5768588");
      // Connect provider to interact with contract
      App.tcrInstance.setProvider(App.web3Provider);
      //App.listenForEvents();
    }).then(function () {
      $.getJSON("Token.json", function (token) {
        let abi = token.abi;
        App.tokenInstance = new App.web3.eth.Contract(abi, "0xa881f356F852B5907456c61B81F4F325A7f602Df");
        // Connect provider to interact with contract
        App.tokenInstance.setProvider(App.web3Provider);
        
        return App.initMetamask();
      });
    });
  },

  initMetamask: function(){
    var ethereum = window.ethereum;
    ethereum.enable().then(function (accounts) {
      console.log(accounts);
      App.account = accounts[0];
      console.log("Assigned - ",App.account);
      App.tcrInstance.options.from = App.account;
      App.tokenInstance.options.from = App.account;
      return App.readHistory();
    });
  },

  readHistory: function(){

    App.tcrInstance.getPastEvents('_Challenge',{fromBlock: 0,
      toBlock: 'latest'}, function(er,ev){
        ev.forEach(function(event){
          let lHash = event.returnValues[0];
          let cId = event.returnValues[1];
          App.challenges[lHash] = cId;
        }); 
      // use App.challenged to Display that the listing is under a poll 
    });
    
    App.tcrInstance.getPastEvents('_ResolveChallenge',{fromBlock: 0,
      toBlock: 'latest'}, function(er,ev){
        ev.forEach(function(event){
          let lHash = event.returnValues[0];
          delete App.challenges[lHash];
        });
      // if c_id does not exist in App.challenges then it is either resolved 
      // or never created.
    });
    //Hack below
    console.log("Reading History");
    setTimeout(App.render(),5000);// wait for 5s
  },
  
  render: function () {
    // var tcrInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load contract data
    let courses = {};
    // let listings = []];
    
    App.tcrInstance.methods.getAllListings().call().then(function (l) {
      if(l==null){
        loader.hide();
        content.show();
        return;
      }
      for (let i = 0; i < l[0].length; i++) {
        let item = {};
        let rev = l[0][i].split(' ');
        item = {
          'roll': rev[0],
          'review': rev[2],
          'rating': rev[3],
          'lHash': l[1][i],
          'wl' : l[2][i],             
        } ;
        if(courses[rev[1]]){
          let avg = courses[rev[1]].avgRating;
          let nR = courses[rev[1]].numRatings;
          courses[rev[1]].avgRating = (avg*nR + parseFloat(rev[3]))/(nR +1);
          courses[rev[1]].numRatings = nR +1;
          courses[rev[1]].data.push(item);
        }else{
          courses[rev[1]] = {
            'avgRating' : parseFloat(rev[3]),
            'numRatings' : 1,
            'data': [item],
          };
        }
      }
      console.log(courses);
      App.courses = courses;
      var reviewList = $(".collapsible");
      reviewList.empty();
      // console.log(minDeposit[0]);
      Object.keys(courses).forEach(function(key) {
        let cHeader = getCHeader(key, courses[key].avgRating, courses[key].numRatings);
        let reviewDivs = [];
        courses[key].data.forEach(function(item){
            reviewDivs.push(oneReviewDiv(item))
        });
        
        let cBody = "<div class=\"collapsible-body\">" + reviewDivs.join(' ')+"</div>"
        reviewList.append(`<li>${cHeader}${cBody}</li>`);
      });
      loader.hide();
      content.show();
      
      $(document).ready(function(){
        $('.collapsible').collapsible();
        $('.tooltipped').tooltip();
        $('.copy_content').click(function(){
          var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(this.text()).select();
          document.execCommand("copy");
          $temp.remove();
        });
      });

    });

  //   const filter = web3.eth.filter({
  //     address: App.tcrInstance.options.address,
  //   });
  //   filter.watch((error, result) => {
  //     console.log("Result", result);
  //  })
    
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
      App.tcrInstance.methods.propose(amount, roll, course_code, review, rating).send(console.log);
    });  
    

  },

  challenge: function () {
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });

    let hash = $('#hash').val();
    let amount = $('#challenge_amount').val();

    console.log(amount);
    App.tcrInstance.methods.challenge(hash, amount);

  },

  vote: function () {
    App.tokenInstance.approve(App.tcrInstance.address, 10000, { from: App.account });

    let hash = $('#VoteHash').val();
    let amount = $('#VoteAmount').val();
    let choice = $('#Vote').val();

    console.log(amount);
    App.tcrInstance.methods.vote(hash, amount, choice);

  },

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

$(function () {
  $(window).load(function () {
    App.init();
  });
});