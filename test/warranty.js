const warranty = artifacts.require("NFTwarranty");
const assert = require("assert");

describe("warranty", function(){
    let accounts, my_warranty;
    
    before(async function() {
      accounts = await web3.eth.getAccounts();
    //   warranty = await hre.ethers.getContractFactory("BreitlexNFT");
      my_warranty = await warranty.new();
    //   await my_warranty.deployed();
    });
    
    it("should be able to mint a token", async function(){
      await my_warranty.mint("0x8dF55dA195aA22124E13bd769FC0d4e0767f9d00", "https://gateway.pinata.cloud/ipfs/QmVmx84GNZbfzBZ5pTNMfHkfQv5J4sK7Nz5aQpjJmFgTqt");
      let owner = await my_warranty.ownerOf(0);
    //   console.log("Owner of Token 0 is: ", owner);
    });
  
    it("should be able to transfer a token", async function(){
      // await my_warranty.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "https://gateway.pinata.cloud/ipfs/QmVmx84GNZbfzBZ5pTNMfHkfQv5J4sK7Nz5aQpjJmFgTqt");
      // await my_warranty.safeTransferFrom("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",0);
      await my_warranty.safeTransferFrom("0x8dF55dA195aA22124E13bd769FC0d4e0767f9d00", "0xA7A5B56C841eb0369660624bf4D61ee08C5D6530", 0);
      let owner = await my_warranty.ownerOf(0);
      // let balance = await my_warranty.balanceOf(owner);
    //   console.log("Owner of Token 0 is: ", owner);
      // console.log("Balance of Owner is: ", balance)
    });
});