import Web3 from "web3";
import NFTwarrantyArtifact from "../build/contracts/NFTwarranty.json";
import 'bootstrap';
import { Modal, Popover } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
var axios = require('axios'); 
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('API_KEY', 'API_SECRET');
const fs = require('fs');


const ipfsURI = "https://gateway.pinata.cloud/ipfs/";

var ser_obj = {};
var creation_obj = {};
var warranties_live = 0;
var cnt_claim = 0;

const App = {
  //web3 declarations
  web3: null,
  account: null,
  meta: null,
  NFTwarrantyContract:null,              //actual contract object
  NFTwarrantyContractAddress:null,        //address of the contract
  popoverTriggerList:null,
  popoverList: null,
  freelancerContractStatus: null,
  currentToken: null,
  contractOwnerAddress: null,

  //ui declarations
  uiSpnLoad:null,
  uiSpnMint: null,
  uiSpnTransfer: null,
  uiSpnAuthorize: null,
  uiConContract:null,
  uiSpnContractAction: null,
  uiLblContractAddress:null,
  uiLblOwnerAddress:null,
  uiTxtContractAddress:null,
  uiLblName: null,
  uiLblSymbol:null,
  uiBtnDeploy: null,
  uiBtnDeployPopover: null,
  uiConToken: null,
  uiLblTokenModel: null,
  uiLblTokenManufacturedDate: null,
  uiLblTokenSerialNumber: null,
  uiImgTokenPicture: null,
  uiLblTokenOwner: null,
  uiTxtTokenId: null,
  uiBtnTransferToken: null,
  uiTxtTransferToken: null,
  uiBtnAuthorizeEscrow: null,
  uiTxtAuthorizeEscrow: null,
  
  


  start: async function() {
    const { web3 } = this;
    //get accounts
    const accounts = await web3.eth.getAccounts();
    this.account = accounts[0];
    this.uiBtnDeploy = document.getElementById("btn-Deploy");
    //this.uiBtnDeploy.classList.add("disabled");
    
    this.uiBtnDeployPopover = new Popover(this.uiBtnDeploy);
  },

  btnGo: function(){
    this.uiBtnDeployPopover.hide();
    this.uiTxtContractAddress = document.getElementById("txt-contract-address").value;
    if (this.uiTxtContractAddress === ""){
      this.deployNFTwarranty();
    }
    else {
        this.retrieveNFTwarranty(this.uiTxtContractAddress);  
    }
  },

  btnGoClient: function(){
    const { web3 } = this;
    this.uiBtnDeployPopover.hide();
    this.uiTxtContractAddress = document.getElementById("txt-contract-address").value;
    if (this.uiTxtContractAddress === ""){
      this.uiBtnDeployPopover.show();
    }
    else{
      this.freelanceContractAddress = this.uiTxtContractAddress;
      this.freelancerContract = new web3.eth.Contract(freelancerArtifact.abi, this.freelanceContractAddress);
      this.retrieveNFTwarranty(this.uiTxtContractAddress);
    }
  },

  btnViewToken: async function(){
      this.uiTxtTokenId = document.getElementById("txt-token-id");
      this.currentToken = this.uiTxtTokenId.value;
      this.utilGetTokenDetails(this.uiTxtTokenId.value);
  },

  btnTransferToken: async function(){
    this.uiTxtTransferToken = document.getElementById("txt-transfer-address");
    console.log(this.uiTxtTransferToken.value);
    console.log(this.currentToken);

    this.uiSpnTransfer = document.getElementById("spn-transfer");
    this.uiSpnTransfer.classList.remove('d-none');

    this.NFTwarrantyContract.methods.safeTransferFrom(this.account,this.uiTxtTransferToken.value, this.currentToken).send({from: this.account})
    .then((result) =>{
      App.transferModal = Modal.getInstance(document.getElementById('transferModal'));
      App.transferModal.hide();
      this.utilGetTokenDetails(this.currentToken);
      this.uiSpnTransfer.classList.add('d-none');
    });
  },

  btnAuthorizeEscrow: async function(){
    this.uiTxtAuthorizeEscrow = document.getElementById("txt-authorize-address");
    console.log(this.uiTxtAuthorizeEscrow.value);
    console.log(this.currentToken);

    this.uiSpnAuthorize = document.getElementById("spn-authorize");
    this.uiSpnAuthorize.classList.remove('d-none');

    this.NFTwarrantyContract.methods.approve(this.uiTxtAuthorizeEscrow.value, this.currentToken).send({from: this.account})
    .then((result) =>{
      App.AuthorizeModal = Modal.getInstance(document.getElementById('AuthorizeModal'));
      App.AuthorizeModal.hide();
      this.utilGetTokenDetails(this.currentToken);
      this.uiSpnAuthorize.classList.add('d-none');
    });
  },

  btnClaim: function(){
    serial_no = document.getElementById("txt-serial-number").value;
    console.log(serial_no);

    var curtime = new Date();
    curtime = parseInt(curtime.getHours() + "" + ("0" + curtime.getMinutes()).substr(-2) + "" + ("0" + curtime.getSeconds()).substr(-2));
    var warranty_period = 150;
    var warranty_start = creation_obj[serial_no];
    warranty_start = parseInt(warranty_start.getHours() + "" + ("0" + warranty_start.getMinutes()).substr(-2) + "" + ("0" + warranty_start.getSeconds()).substr(-2));

    console.log(warranty_start+warranty_period);
    // console.log(warranty_period);
    console.log(curtime);
    // var flag = 1;
    // if(cnt_claim===0) 
    // {
    //   flag = 1;
    //   cnt_claim++;
    // }
    // else{
    //   cnt_claim++;
    //   flag = 0;
    // }

    // if(curtime<=(warranty_start+warranty_period) )
    // {
    //   var flag = 1;
    // }

    if(curtime>(warranty_start+warranty_period))
    {
      // flag = 0; 
      document.getElementById("warranty-expiry").innerHTML = "Sorry, your Warranty has Expired.";
      if(warranties_live!=0) warranties_live = warranties_live-1;
      document.getElementById("lbl-total-live").innerHTML = warranties_live;
      console.log(warranties_live);
    }
    else
    {
      if(!([serial_no] in ser_obj))
      {
        var new_obj = {
          [serial_no] : 1,
        };

        ser_obj = Object.assign(ser_obj,new_obj);
      }
      else
      {
        ser_obj[serial_no] = ser_obj[serial_no]+1;
      }
      console.log(ser_obj);
    }

    
  },

  btnReward: function () {
    serial_no = document.getElementById("txt-serial-number").value;

    clicks = (ser_obj[serial_no]);

    if(clicks>=3)
    {
      document.getElementById("display-reward-message").innerText = "Sorry you are not eligible for any reward!";
    }
    else if(clicks === 2)
    {
      document.getElementById("display-reward-message").innerText = "Congratulations, you get 10 flipkart SuperCoins!";
    }
    else if(clicks === 1)
    {
      document.getElementById("display-reward-message").innerText = "Congratulations, you get 20 flipkart SuperCoins!";
    }
    else
    {
      document.getElementById("display-reward-message").innerText = "Congratulations, you get 30 flipkart SuperCoins!";
    }

    App.rewardModal = Modal.getInstance(document.getElementById('rewardModal'));
    App.rewardModal.hide();
  },

  btnMint: async function(){
    //temp 28th Aug 2021 - upload file
    if (document.getElementById("Mint-Form").checkValidity()){
        this.uiSpnMint = document.getElementById("spn-mint");
        this.uiSpnMint.classList.remove('d-none');

        var data = new FormData();
        
        data.append("model", document.getElementById("txt-model").value);
        data.append("manufactured-date ", document.getElementById("txt-manufactured-date").value);
        data.append("serial-number", document.getElementById("txt-serial-number").value);

        var serial_no = document.getElementById("txt-serial-number").value;
        var creation_time = new Date();
        var new_obj = {
          [serial_no] : creation_time,
        };
        creation_obj = Object.assign(creation_obj,new_obj);

        warranties_live = warranties_live+1;
        document.getElementById("lbl-total-live").innerHTML = warranties_live;

        var object = {};
        data.forEach((value, key) => object[key] = value);
        var json_file = JSON.stringify(object);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", (event) => {
          console.log(event.target.readyState);
          if (event.target.readyState === 4)  {
            var config = {
              method: 'post',
              url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer JWT'
              },
              data : json_file
            };
            
            var myipfsURI = ipfsURI + JSON.parse(event.target.responseText).IpfsHash;

            console.log(JSON.parse(event.target.responseText).IpfsHash);
            // const res = await axios(config);

            // var myipfsURI = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
            // var myipfsURI = "https://gateway.pinata.cloud/ipfs/QmVmx84GNZbfzBZ5pTNMfHkfQv5J4sK7Nz5aQpjJmFgTqt";
            console.log(myipfsURI);
            this.NFTwarrantyContract.methods.mint(this.account, myipfsURI).send({from: this.account})
            .on('error', function(error, receipt) { 
              console.log("a");
              App.uiSpnMint.classList.add('d-none');
              App.mintModal = Modal.getInstance(document.getElementById('mintModal'));
              App.mintModal.hide();
            }) 
            .then((result) =>{
              this.currentToken = result.events.Transfer.returnValues.tokenId;
              console.log(this.currentToken);
              console.log(this.NFTwarrantyContract);
              console.log(this.NFTwarrantyContractAddress);

              this.uiSpnMint.classList.add('d-none');
              App.uiSpnMint.classList.add('d-none');
              App.mintModal = Modal.getInstance(document.getElementById('mintModal'));
              App.mintModal.hide();

              this.utilGetTokenDetails(this.currentToken);
              this.utilGetTotalSupply();
            });
          }
        });
        xhr.open("POST", "https://api.pinata.cloud/pinning/pinJSONToIPFS");
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.setRequestHeader('Authorization', 'Bearer JWT')
        const naruto_json = {
          "model": "Naruto-Manga",
          "manufactured-date": "2022-07-20",
          "serial-number": "10",
          "photo": "https://gateway.pinata.cloud/ipfs/QmPQ26aZPp9jFF31GE4UWq286aTsVkufyiKPhRkJTcfxXE"
        };
        xhr.send(json_file); 

        // var object = {};
        // data.forEach((value, key) => object[key] = value);
        // var json_file = JSON.stringify(object);

        // var config = {
        //   method: 'post',
        //   url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        //   headers: { 
        //     'Content-Type': 'application/json', 
        //     'Authorization': 'Bearer JWT'
        //   },
        //   data : json_file
        // };
        
        // const res = await axios(config);
        
        // console.log(res.data);

        // const readableStreamForFile = fs.createReadStream(json_file);
        // const options = {
        //     pinataMetadata: {
        //         name: `JSON_file_input_${document.getElementById("txt-serial-number").value}.json`,
        //         keyvalues: {
        //             customKey: 'customValue',
        //             customKey2: 'customValue2'
        //         }
        //     },
        //     pinataOptions: {
        //         cidVersion: 0
        //     }
        // };
        // pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
        //     //handle results here
        //     console.log(result);
        // }).catch((err) => {
        //     //handle error here
        //     console.log(err);
        // });
      }
    else{
          console.log("nope");
    }
  },

  utilGetTotalSupply: async function(){
    this.uiLblTotalSupply = document.getElementById("lbl-total-supply");

    let totalRow;
    let totalDisbursed=0;
    let totalValue = 0;
    //may need to put await
    await this.NFTwarrantyContract.methods.totalSupply().call().then((result) => {
      this.uiLblTotalSupply.innerHTML = result;
      console.log(result);
    });

  },

  utilRefreshHeader: async function(ContractAddress){
    const { web3 } = this;
    this.NFTwarrantyContract = new web3.eth.Contract(NFTwarrantyArtifact.abi, ContractAddress);
    this.uiConContract = document.getElementById("con-contract");
    this.uiLblContractAddress = document.getElementById("lbl-contract-address");
    this.uiLblOwnerAddress = document.getElementById("lbl-owner-address");
    this.uiLblName = document.getElementById("lbl-name");
    this.uiLblSymbol = document.getElementById("lbl-symbol");

    this.uiConContract.classList.remove('d-none');

    this.uiLblContractAddress.textContent = ContractAddress;

    this.NFTwarrantyContract.methods.owner().call().then((result) =>{
      this.uiLblOwnerAddress.textContent = result;
      this.contractOwnerAddress = result;
    });

    this.NFTwarrantyContract.methods.name().call().then((result) =>{
      this.uiLblName.textContent = result;
    });

    this.NFTwarrantyContract.methods.symbol().call().then((result) =>{
      this.uiLblSymbol.textContent = result;
    });

    //update the ETH Value boxes
    this.utilGetTotalSupply();
  },

  utilGetTokenDetails: async function(tokenID){
    this.NFTwarrantyContract.methods.tokenURI(tokenID).call().then((result) =>{     
      this.httpGet(result).then((myURL) =>{
        //show the container
        this.uiConToken = document.getElementById("con-token");
        this.uiConToken.classList.remove('d-none');
        console.log(JSON.parse(myURL));

        //Show the owner
        this.uiLblTokenOwner = document.getElementById("lbl-token-owner");
        this.NFTwarrantyContract.methods.ownerOf(tokenID).call()
        .then((result) => {
          console.log(result);
          this.uiLblTokenOwner.textContent =  result;

          //should I show the transfer token button?
          if (result === this.account){
            this.uiBtnTransferToken = document.getElementById("btn-Transfer-Token");
            this.uiBtnTransferToken.classList.remove('d-none');

            this.uiBtnAuthorizeEscrow = document.getElementById("btn-Claim-Token");
            this.uiBtnAuthorizeEscrow.classList.remove('d-none');

            this.uiBtnAuthorizeEscrow = document.getElementById("btn-Claim-Reward");
            this.uiBtnAuthorizeEscrow.classList.remove('d-none');
          }
          else{
            this.uiBtnTransferToken = document.getElementById("btn-Transfer-Token");
            this.uiBtnTransferToken.classList.add('d-none');      
          
            this.uiBtnAuthorizeEscrow = document.getElementById("btn-Claim-Token");
            this.uiBtnAuthorizeEscrow.classList.add('d-none');   

            this.uiBtnAuthorizeEscrow = document.getElementById("btn-Claim-Reward");
            this.uiBtnAuthorizeEscrow.classList.remove('d-none');
          }

          //Show the model, manufactured date, serila number
          this.uiLblTokenModel = document.getElementById("lbl-token-model");
          this.uiLblTokenModel.textContent = JSON.parse(myURL)["model"];
          this.uiLblTokenManufacturedDate = document.getElementById("lbl-token-manufactured-date");
          this.uiLblTokenManufacturedDate.textContent = JSON.parse(myURL)["manufactured-date "];
          this.uiLblTokenSerialNumber = document.getElementById("lbl-token-serial-number");
          this.uiLblTokenSerialNumber.textContent = JSON.parse(myURL)["serial-number"];

          //Show the Picture
          this.uiImgTokenPicture = document.getElementById("img-token-picture");
          this.uiImgTokenPicture.src = JSON.parse(myURL).photo;
        }).catch((err) => {
          console.log(err);
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
  },

  //thank you: https://stackoverflow.com/questions/10642289/return-html-content-as-a-string-given-url-javascript-function
  httpGet: async function(theUrl)
  {
      let xmlhttp;
      if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp=new XMLHttpRequest();
      } else { // code for IE6, IE5
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }
      xmlhttp.onreadystatechange=function() {
          if (xmlhttp.readyState==4 && xmlhttp.status==200) {
              return xmlhttp.responseText;
          }
      }
      xmlhttp.open("GET", theUrl, false);
      xmlhttp.send();
      return xmlhttp.response;
  },

  retrieveNFTwarranty: function(ContractAddress){
    this.utilRefreshHeader(ContractAddress);
  },

  deployNFTwarranty: function() {
    const { web3 } = this;
    this.NFTwarrantyContract = new web3.eth.Contract(NFTwarrantyArtifact.abi);
    this.uiSpnLoad = document.getElementById("spn-load");
    this.uiConContract = document.getElementById("con-contract");
    this.uiLblContractAddress = document.getElementById("lbl-contract-address");
    this.uiLblOwnerAddress = document.getElementById("lbl-owner-address");
    this.uiLblName = document.getElementById("lbl-name");
    this.uiLblSymbol = document.getElementById("lbl-symbol");

    this.uiSpnLoad.classList.remove('d-none');
    this.NFTwarrantyContract.deploy({
      data: NFTwarrantyArtifact.bytecode,
      arguments: []
    }).send({
      from: this.account, 
    }, (error, transactionHash) => {})
    .on('error', (error) => { 
      console.log("error");            
    })
    .on('receipt', (receipt) => {
      console.log("DONE" + receipt.contractAddress); // contains the new contract address
      this.uiSpnLoad.classList.add('d-none');
      this.uiConContract.classList.remove('d-none');

      this.NFTwarrantyContractAddress = receipt.contractAddress;
      this.uiLblContractAddress.textContent = receipt.contractAddress;

      this.NFTwarrantyContract = new web3.eth.Contract(NFTwarrantyArtifact.abi, this.NFTwarrantyContractAddress);
      this.NFTwarrantyContractAddress = receipt.contractAddress;

      console.log(this.NFTwarrantyContractAddress);
      console.log(this.NFTwarrantyContract);

      this.NFTwarrantyContract.methods.owner().call().then((result) =>{
        this.uiLblOwnerAddress.textContent = result;
        this.contractOwnerAddress = result;
      });

      this.NFTwarrantyContract.methods.name().call().then((result) =>{
        this.uiLblName.textContent = result;
      });

      this.NFTwarrantyContract.methods.symbol().call().then((result) =>{
        this.uiLblSymbol.textContent = result;
      });

      //update the ETH Value boxes
      this.utilGetTotalSupply();

    })
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});