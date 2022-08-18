const NFTwarranty = artifacts.require("NFTwarranty");

module.exports = async function(deployer, network, accounts) {

    let wallet;
    //get address for programmer and client wallet
    await web3.eth.getAccounts().then(function(result){
        wallet = result[0];
    });
    
    //deploy freelancer contract
    await deployer.deploy(NFTwarranty, {from: wallet}).then(()=> {
        console.log("NFTwarranty Contract:" + NFTwarranty.address);
      }
    );
    
};