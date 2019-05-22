var Web3 = require('web3');
var fs = require('fs');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

//const EC = require('elliptic').ec
//const ec = new EC('secp256k1')

var eth_util = require('ethereumjs-util')
var Tx = require('ethereumjs-tx');


const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'provider', type: String, defaultValue: "http://localhost:8545"},
//  { name: 'A', type: String, defaultValue: "0xc5c7977789b84bf99b4663b0db9220b7a4abad57"},
//  { name: 'B', type: String, defaultValue: "0xed78c89ac96c13b28c0d40e06fe1884ef68cdac9"},
]

const commandLineArgs = require('command-line-args')
const opts = commandLineArgs(optionDefinitions)
console.log("opts:",opts)


var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(opts.provider));

var contractName = 'XPaymentChannel';

var abiFile = './contracts/build/'+contractName+'.abi';
var addrFile = contractName+'.address'

var abi = JSON.parse(fs.readFileSync(abiFile).toString());
var address = fs.readFileSync(addrFile).toString();

var contract = web3.eth.contract(abi);
var instance = contract.at(address);

console.log('state',instance.state().toNumber())
console.log('value',web3.fromWei(instance.balance().toString()))
var A=instance.A().toString();
var B=instance.B().toString();
console.log('A',A)
console.log('B',B)
console.log('valueA',web3.fromWei(instance.valueX(A)).toNumber())
console.log('valueB',web3.fromWei(instance.valueX(B)).toNumber())

console.log('A:',A,web3.fromWei(web3.eth.getBalance(A)).toNumber());
console.log('B:',B,web3.fromWei(web3.eth.getBalance(B)).toNumber());
