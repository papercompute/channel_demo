## demo
payment/state channels demo  

### setup

```bash
ganache-cli --account "0x636dd68e3788e5d935d3787cb3356ba30ef668a50c0777457be39a0aebefb451,10000000000000000000" --account "0xceaa875bac4fadac1c74543c9926d767b3f9c4dd096d49aa50e11cd94681910e,10000000000000000000" --account "0x04a2e6b0acec462900ad7ac0e2bd8eaf06cacdb1dad6d7c36a382337ca3cbd97,10000000000000000000"  
```
or

```bash
geth --dev --rpc --rpcaddr "0.0.0.0" --rpcapi "admin,debug,miner,shh,txpool,personal,eth,net,web3" --datadir "/mnt/data/eth-data" console
personal.newAccount()
miner.setEtherbase(eth.accounts[0])
miner.start()

geth attach ipc:/mnt/data/eth-data/geth.ipc
personal.unlockAccount(eth.accounts[0])
eth.sendTransaction({from:eth.accounts[0],to:"0xc5c7977789b84bf99b4663b0db9220b7a4abad57",value:web3.toWei(5.0, "ether")})
web3.fromWei("0xc5c7977789b84bf99b4663b0db9220b7a4abad57")

eth.sendTransaction({from:eth.accounts[0],to:"0xed78c89ac96c13b28c0d40e06fe1884ef68cdac9",value:web3.toWei(5.0, "ether")})
web3.fromWei("0xed78c89ac96c13b28c0d40e06fe1884ef68cdac9")
```

### compile https://github.com/ethereum/solidity/releases/tag/v0.4.19
```bash
./build.sh
```

### deploy
```bash
node utils/deploy.js
```

### deposit
```bash
node utils/deposit.js --key keys/Alice.hex --value 1.0
node utils/deposit.js --key keys/Bob.hex --value 1.0
node utils/balance.js
```

### send
```bash
mkdir txs
node utils/send.js --key keys/Alice.hex --partner keys/Bob_addr.hex --tx txs/tx00001.json --value 0.1
node utils/send.js --key keys/Alice.hex --partner keys/Bob_addr.hex --ptx txs/tx00001.json --tx txs/tx00002.json --value 0.1
node utils/send.js --key keys/Alice.hex --partner keys/Bob_addr.hex --ptx txs/tx00002.json --tx txs/tx00003.json --value 0.3
```

### challenge
```bash
node utils/challenge_start.js --key keys/Bob.hex --tx txs/tx00003.json
# wait challenge_period...
node utils/challenge_finish.js --key keys/Bob.hex --tx txs/tx00003.json
node utils/balance.js
```
