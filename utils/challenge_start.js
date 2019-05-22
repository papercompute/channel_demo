var Web3 = require('web3');
var fs = require('fs');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

var eth_util = require('ethereumjs-util')
var Tx = require('ethereumjs-tx');


const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'key', type: String, defaultValue: "./keys/Bob.hex"},
  { name: 'provider', type: String, defaultValue: "http://localhost:8545"},
  { name: 'tx', type: String},
]

const commandLineArgs = require('command-line-args')
const opts = commandLineArgs(optionDefinitions)
console.log("opts:",opts)

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(opts.provider))



var contractName = 'XPaymentChannel';


var abiFile = './contracts/build/'+contractName+'.abi';
var addrFile = contractName+'.address'

var abi = JSON.parse(fs.readFileSync(abiFile).toString());
var address = fs.readFileSync(addrFile).toString();


var contract = web3.eth.contract(abi);
var instance = contract.at(address);


var key_hex = fs.readFileSync(opts.key).toString().slice(2,66)
var key_bin = new Buffer.from(key_hex, 'hex')
console.log('key',key_hex)
var account='0x'+eth_util.pubToAddress(eth_util.privateToPublic(key_bin)).toString('hex')
console.log('account',account)

var MyPriv = key_bin;
var MyAddr = account;


var tx = JSON.parse(fs.readFileSync(opts.tx).toString());
console.log('tx',tx);

const leftpad=(s,n)=> "0".repeat(n-s.length)+s;


let id=tx.id;
var vA = web3.toWei(tx.vA, "ether")
var vB = web3.toWei(tx.vB, "ether")
let r=tx.r;
let s=tx.s;
let v=tx.v;



var tx = new Tx({
    nonce: web3.toHex(web3.eth.getTransactionCount(MyAddr)),
    gasPrice: web3.toHex(web3.eth.gasPrice),
    gasLimit: web3.toHex(4000000),
//    from: MyAddr,
    to: address,
    value: '0x0',
//    data: instance.challengeStart.getData(id,vA,vB, v,r,s)
    data: instance.testSig.getData(id,vA,vB, v,r,s)
});
tx.sign(MyPriv);

web3.eth.sendRawTransaction('0x'+tx.serialize().toString('hex'),function (err, hash) {
	if(err)throw new Error(err)
 	console.log('sendRawTransaction',hash) 
	var intObj=setInterval(function(){
		var receipt = web3.eth.getTransactionReceipt(hash);
		if(receipt){
			clearInterval(intObj)
			console.log('receipt',receipt);
			return
		}
	console.log('waiting receipt...');
	},1000);
})



