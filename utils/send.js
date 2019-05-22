var Web3 = require('web3');
var fs = require('fs');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

var eth_util = require('ethereumjs-util')
var Tx = require('ethereumjs-tx');


const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'key', type: String, defaultValue: "./keys/Alice.hex"},
  { name: 'value', type: Number, defaultValue: 1.0},
  { name: 'partner', type: String, defaultValue:"./keys/Bob_addr.hex"},
  { name: 'ptx', type: String}, //defaultValue: "./txs/tx013.json"},
  { name: 'tx', type: String}, //defaultValue: "./txs/tx014.json"},
]

const commandLineArgs = require('command-line-args')
const opts = commandLineArgs(optionDefinitions)
console.log("opts:",opts)

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(opts.provider))

var value = web3.toWei(opts.value, "ether");

var contractName = 'XPaymentChannel';
var abiFile = './contracts/build/'+contractName+'.abi';
var addrFile = contractName+'.address'
var abi = JSON.parse(fs.readFileSync(abiFile).toString());
var address = fs.readFileSync(addrFile).toString();


var contract = web3.eth.contract(abi);
var instance = contract.at(address);


var key_hex = fs.readFileSync(opts.key).toString().slice(2,66)
var key_bin = Buffer.from(key_hex, 'hex')
console.log('key',key_hex)
var account='0x'+eth_util.pubToAddress(eth_util.privateToPublic(key_bin)).toString('hex')
console.log('account',account)
var MyPriv = key_bin;
var MyAddr = account;

var PrAddr = fs.readFileSync(opts.partner).toString().slice(0,42)

const leftpad=(s,n)=> "0".repeat(n-s.length)+s;

var ptx;

if(opts.ptx){
	ptx = JSON.parse(fs.readFileSync(opts.ptx).toString());
} else {
	ptx={
		id:0,
		A:instance.A(),
		B:instance.B()
	}
	ptx.vA=web3.fromWei(instance.valueX(ptx.A)).toNumber()
	ptx.vB=web3.fromWei(instance.valueX(ptx.B)).toNumber()
}

console.log('ptx',ptx);

if((ptx.vA-opts.value)<0){
	console.log('no enough value')
	process.exit(0)
}

let vA;
let vB;

if(MyAddr == ptx.A){
	vA=ptx.vA-opts.value;
	vB=ptx.vB+opts.value;
} else if(MyAddr == ptx.B){
	vA=ptx.vA+opts.value;
	vB=ptx.vB-opts.value;
} else {
	console.log('wrong addr')
	process.exit(0)	
}


console.log('vA,vB',vA,vB);
let id=ptx.id+1;

var _vA = web3.toWei(vA, "ether")
var _vB = web3.toWei(vB, "ether")
console.log('_vA',_vA)
console.log('_vB',_vB)
var vA_hex = leftpad(web3.toHex(_vA).substr(2), 64)
var vB_hex = leftpad(web3.toHex(_vB).substr(2), 64)

var id_hex = leftpad(web3.toHex(id).substr(2), 8)


let msg = address.substr(2)
+PrAddr.substr(2)
+id_hex
+vA_hex
+vB_hex;

console.log('msg',msg)

let hash = eth_util.sha3(Buffer.from(msg,'hex'))
let hash_hex = '0x'+hash.toString('hex')

console.log('hash',hash_hex);

var sig = secp256k1.sign(hash, MyPriv);

let r = '0x'+sig.signature.slice(0, 32).toString('hex');
let s = '0x'+sig.signature.slice(32, 64).toString('hex');
let v = sig.recovery + 27;

let tx={
	id:id,
	from:MyAddr,to:PrAddr,
	pvA:ptx.vA,pvB:ptx.vB,	
	value:opts.value,
	A:ptx.A,B:ptx.B,
	vA:vA,vB:vB,
	v:v,r:r,s:s
}

console.log('tx',tx);
fs.writeFileSync(opts.tx,JSON.stringify(tx))
