var Web3 = require('web3');

var eth_util = require('ethereumjs-util')
var Tx = require('ethereumjs-tx');

var fs = require('fs');

// ganache-cli --account "0x636dd68e3788e5d935d3787cb3356ba30ef668a50c0777457be39a0aebefb451,10000000000000000000" --account "0xceaa875bac4fadac1c74543c9926d767b3f9c4dd096d49aa50e11cd94681910e,10000000000000000000" --account "0x04a2e6b0acec462900ad7ac0e2bd8eaf06cacdb1dad6d7c36a382337ca3cbd97,10000000000000000000"


const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'key', type: String, defaultValue: "./keys/Alice.hex"},
  { name: 'provider', type: String, defaultValue: "http://localhost:8545"},
  { name: 'partner', type: String, defaultValue:"0xed78c89ac96c13b28c0d40e06fe1884ef68cdac9"},
  { name: 'ttl', type: Number, defaultValue: 3600},
]

const commandLineArgs = require('command-line-args')
const opts = commandLineArgs(optionDefinitions)
console.log("opts:",opts)


var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(opts.provider));

var key_hex = fs.readFileSync(opts.key).toString().slice(2,66)
var key_bin = Buffer.from(key_hex, 'hex')
console.log('key',key_hex)
var account='0x'+eth_util.pubToAddress(eth_util.privateToPublic(key_bin)).toString('hex')
console.log('account',account)


const duration = {
  seconds: function(val) { return val},
  minutes: function(val) { return val * this.seconds(60) },
  hours:   function(val) { return val * this.minutes(60) },
  days:    function(val) { return val * this.hours(24) },
  weeks:   function(val) { return val * this.days(7) },
  years:   function(val) { return val * this.days(365)} 
};


var contractName = 'XPaymentChannel';
var prefixName = './contracts/build/';
var abiFile = prefixName+contractName+'.abi';
var binFile = prefixName+contractName+'.bin';
var addrFile = contractName+'.address'


var abi = JSON.parse(fs.readFileSync(abiFile).toString());
var bin = fs.readFileSync(binFile).toString()


var contract = web3.eth.contract(abi);


var MyPriv = key_bin;
var MyAddr = account;

var PrAddr = opts.partner

console.log('me:',MyAddr,web3.fromWei(web3.eth.getBalance(MyAddr)).toNumber());
console.log('pr:',PrAddr,web3.fromWei(web3.eth.getBalance(PrAddr)).toNumber());


var tx = new Tx({
    nonce: web3.toHex(web3.eth.getTransactionCount(MyAddr)),
    gasPrice: web3.toHex(web3.eth.gasPrice),
    gasLimit: web3.toHex(4000000),
    from: MyAddr,
    value: '0x0',
    data: contract.new.getData(PrAddr,opts.ttl,{data: '0x'+bin})
});
tx.sign(MyPriv);

web3.eth.sendRawTransaction('0x'+tx.serialize().toString('hex'),function (err, hash) {
	if(err)throw new Error(err)
 	console.log('sendRawTransaction',err,hash) 
 	waitForAddress(hash,function(address){
 		console.log('address',address)
 		fs.writeFileSync(addrFile,address);
 	})
})

function waitForAddress(hash,cb){

var intObj=setInterval(function(){
	var receipt = web3.eth.getTransactionReceipt(hash);
	if(receipt){
		if('contractAddress' in receipt){
			clearInterval(intObj)
      console.log('receipt',receipt)
			cb(receipt.contractAddress)
			return
		} 
	}
	console.log('waiting receipt...');
},1000);

}


