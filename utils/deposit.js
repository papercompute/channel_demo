var Web3 = require('web3');
var fs = require('fs');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

const EC = require('elliptic').ec
const ec = new EC('secp256k1')

var eth_util = require('ethereumjs-util')
var Tx = require('ethereumjs-tx');


const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'key', type: String, defaultValue: "./keys/Alice.hex"},
  { name: 'provider', type: String, defaultValue: "http://localhost:8545"},
  { name: 'value', type: Number, defaultValue: 1.0},
]

const commandLineArgs = require('command-line-args')
const opts = commandLineArgs(optionDefinitions)
console.log("opts:",opts)


var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(opts.provider))

var value = web3.toWei(opts.value, "ether");


var contractName = 'XPaymentChannel';


var abiFile = './contracts/build/'+contractName+'.abi';
var binFile = './contracts/build/'+contractName+'.bin';
var addrFile = contractName+'.address'

var abi = JSON.parse(fs.readFileSync(abiFile).toString());
var address = fs.readFileSync(addrFile).toString();
var bin = fs.readFileSync(binFile).toString()


var contract = web3.eth.contract(abi);
var instance = contract.at(address);

//  ganache-cli --account "0x636dd68e3788e5d935d3787cb3356ba30ef668a50c0777457be39a0aebefb451,10000000000000000000" --account "0xceaa875bac4fadac1c74543c9926d767b3f9c4dd096d49aa50e11cd94681910e,10000000000000000000"

var key_hex = fs.readFileSync(opts.key).toString().slice(2,66)
var key_bin = Buffer.from(key_hex, 'hex')
console.log('key',key_hex)
var account='0x'+eth_util.pubToAddress(eth_util.privateToPublic(key_bin)).toString('hex')
console.log('account',account)



var MyPriv = key_bin;
var MyAddr = account;



var tx = new Tx({
    nonce: web3.toHex(web3.eth.getTransactionCount(MyAddr)),
    gasPrice: web3.toHex(web3.eth.gasPrice),
    gasLimit: web3.toHex(4000000),
    to: address,
    value: web3.toHex(value)
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
		    	console.log('balance',instance.balance.call().toNumber());
			return
		}
	console.log('waiting receipt...');
	},1000);
})

