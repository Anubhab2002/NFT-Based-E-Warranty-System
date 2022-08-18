// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTwarranty is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _transactionIdCounter;
    struct NFTtoken{
     uint tokenId;
     address owner;
     uint _start;
     uint warranty_count;
    }
    struct transaction{
        address _from;
        address _to; 
        uint token_id;
        uint t_time;
    }
    transaction [10]  transaction_array;
    event display(NFTtoken nfts);
    event print_string(string st);
    NFTtoken [] public nft_array;
    constructor() ERC721("NFT Warranty", "wNFT") {
       
    }

    function safeMint(address to) public onlyOwner {

        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        transaction memory temp;
        temp._from=from;
        temp._to=to;
        temp.t_time=block.timestamp;
        temp.token_id=tokenId;
        transaction_array[_transactionIdCounter.current()]=temp;
        _transactionIdCounter.increment();
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        //if(checkTime(tokenId)==true)
        super._burn(tokenId);
       // emit display(nft_array[tokenId]);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function mint(
        address _to,
        string memory tokenURI_
    ) external onlyOwner() {
        nft_array.push(NFTtoken(_tokenIdCounter.current(),_to,block.timestamp,0));
        emit display(nft_array[_tokenIdCounter.current()]);
        _safeMint(_to, _tokenIdCounter.current());
        _setTokenURI(_tokenIdCounter.current(), tokenURI_);
        _tokenIdCounter.increment();
    }
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public override
    {
        require(_to != address(0), "Reciever must not be dead address!");
        require(_isApprovedOrOwner(_from, _tokenId), "Must be owner or an approved operator to transfer the NFT!");

        _safeTransfer(_from, _to, _tokenId, "");
    }
    function checkTime(uint256 tokenId)public  
    { 
        if(block.timestamp >= nft_array[tokenId]._start + 10)
        {
            emit print_string("Warranty has expired");
        }
            else
        {
            nft_array[tokenId].warranty_count=nft_array[tokenId].warranty_count+1;
            emit print_string("Product under warranty");
        }    
        emit print_string("check something");
     }
     function give_award(uint256 tokenId)public 
     {
         if(block.timestamp>=nft_array[tokenId]._start+10)
         {
             if(nft_array[tokenId].warranty_count>=3)
             {
                 emit print_string("Sorry, you are not eligible for any flipkart coins");
             }
             else if(nft_array[tokenId].warranty_count==0)
             {
                 emit print_string("You get 30 flipkart coins");
             }
             else if(nft_array[tokenId].warranty_count==1)
             {
                 emit print_string("You get 20 flipkart coins");
             }
             else if(nft_array[tokenId].warranty_count==2)
             {
                 emit print_string("You get 10 flipkart coins");
             }
         }
         else
         {
             emit print_string("Product is still under warranty");
         }
     }
}