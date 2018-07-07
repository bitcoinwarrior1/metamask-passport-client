/*
*
* The purpose of this program is to provide an easy to use passport service for metamask whereby a user can prove
* ownership of a token to gain privileged access to services online.
* This is the client side application which contains a button to login and requires a backend server to store and log sessions
*
* There is an example filled out there by the service provider is to fill their own and handle a callback url with their server
*/

let web3 = require("web3");
let request = require("superagent");
let contractAddress = "0x22a7d3c296692ba0f91c631b41bdfbc702885619"; //the contract address you want to check the user has balance against
let account; //will default to coinbase account
let serverUrl = "https://blockchainapis.herokuapp.com/passport/exampleAuthentication/"; //filled in by service, handles successful callbacks
let erc20Abi = JSON.parse('[{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]');
let erc875Abi = JSON.parse('[{ "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "name", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_tokens", "type": "uint256[]" } ], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "_balances", "type": "uint256[]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "expiryTimeStamp", "type": "uint256" }, { "name": "tokenIndices", "type": "uint256[]" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" } ], "name": "trade", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "symbol", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_tokens", "type": "uint256[]" } ], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "tokenIndices", "type": "uint256[]" } ], "name": "Transfer", "type": "event" }]');
let erc721Abi = JSON.parse('[ { "constant": true, "inputs": [ { "name": "_tokenId", "type": "uint256" } ], "name": "getApproved", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_approved", "type": "address" }, { "name": "_tokenId", "type": "uint256" } ], "name": "approve", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_tokenId", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_tokenId", "type": "uint256" } ], "name": "ownerOf", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_operator", "type": "address" }, { "name": "_approved", "type": "bool" } ], "name": "setApprovalForAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_tokenId", "type": "uint256" }, { "name": "data", "type": "bytes" } ], "name": "safeTransferFrom", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_operator", "type": "address" } ], "name": "isApprovedForAll", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": true, "name": "_tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_approved", "type": "address" }, { "indexed": true, "name": "_tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_operator", "type": "address" }, { "indexed": false, "name": "_approved", "type": "bool" } ], "name": "ApprovalForAll", "type": "event" } ]');
let type; //assigned by service

$(() => {


    //check if plugin node is available if not use localhost
    if (typeof window.web3 !== 'undefined')
    {
        const injectedProvider = window.web3.currentProvider;
        web3 = new Web3(injectedProvider);
        account = web3.eth.coinbase;
    }
    else
    {
        alert("no metamask installed, redirecting you now...")
        //redirect to download metamask
        window.location.href = "https://chrome.google.com/webstore/detail" +
            "/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en";
    }


    $("#login").click(() =>
    {
        //timestamp is in future and must be above current time
        let challenge = Math.floor(Date.now() / 1000) + 1000;
        signChallengeResponse(challenge);
    });

    //sign a random message with timestamp
    //this is enough to prove the signature is not old and reused
    //can be submitted back to the service provider where
    //lookups for balance can be done with assurance
    function signChallengeResponse(challengeMessage)
    {
        let messageHashed = web3.sha3(challengeMessage);
        let abi = getAbiEncoding(type);
        let contract = web3.eth.contract(abi).at(contractAddress);
        contract.balanceOf.call(account, (err, bal) => {
            if(bal == 0)
            {
                alert("you do not hold a valid token to enter, please try again");
                return;
            }
            web3.eth.sign(account, messageHashed, (err, signature) => {
                request.post(serverUrl + messageHashed + "/" + signature, (err, callback) => {
                    if (err) {
                        alert(err);
                        return;
                    }
                    //handle redirect to service
                    window.location.href = callback;
                });
            });
        });
    }

    function getAbiEncoding(type)
    {
        if(type == "ERC20")
        {
            return erc20Abi;
        }
        else if(type == "ERC875")
        {
            return erc875Abi;
        }
        else if(type == "ERC721")
        {
            return erc721Abi;
        }
        //default
        return erc20Abi;
    }

});