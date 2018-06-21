/*
*
* The purpose of this program is to provide an easy to use passport service for metamask whereby a user can prove
* ownership of a token to gain privileged access to services online.
* This is the client side application which contains a button to login and requires a backend server to store and log sessions
*
*/

let web3 = require("web3");
let request = require("superagent");
let serviceId = "AWTT"; //service provider to fill this

$(() => {

    initWeb3();

    function initWeb3()
    {
        //check if plugin node is available if not use localhost
        if (typeof window.web3 !== 'undefined')
        {
            const injectedProvider = window.web3.currentProvider;
            web3 = new Web3(injectedProvider);
        }
        else
        {
            web3 = new web3("http://localhost:8545/");
            alert(
                "no injected provider found, using localhost:8545," +
                " please ensure your local node is running " +
                "with rpc and rpccorsdomain enabled or download metamask"
            );
        }
    }

    $("#login").click(() =>
    {
        //timestamp is in future and must be above current time
        let challenge = parseInt(new Date.now()) + 1000;
        signChallengeResponse(challenge + serviceId);
    });

    //sign a random message with timestamp
    //this is enough to prove the signature is not old and reused
    //can be submitted back to the service provider where
    //lookups for balance can be done with assurance
    function signChallengeResponse(challengeMessage)
    {
        let account = web3.eth.coinbase;
        let messageHashed = web3.sha3(challengeMessage);
        let signature = web3.eth.sign(messageHashed, account);
        request.post("https://blockchainapis.herokuapp.com/passport/" + serviceId + "/"
            + challengeMessage + "/" + signature, (err, data) =>
        {
           if(err)
           {
               alert(err);
               return;
           }
           //handle redirect to service
            window.location.href = data.body.callback;
        });
    }

});