const fs = require('fs');
const solc = require('solc');


let source = fs.readFileSync(process.argv[2], 'utf8');
let outdir = process.argv[3] || './build';
let compiledContract = solc.compile(source);
for (let contractName in compiledContract.contracts) {
    let bytecode = compiledContract.contracts[contractName].bytecode;
    let abi = JSON.parse(compiledContract.contracts[contractName].interface);
    fs.writeFileSync(contractName.substr(1)+'.bin', bytecode);
    fs.writeFileSync(contractName.substr(1)+'.abi', abi);
}

//console.log(JSON.stringify(abi, undefined, 2));