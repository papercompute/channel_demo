#!/usr/bin/env bash

cd contracts
#solcjs --abi --optimize --bin -o ./build contracts.sol
solc --abi --optimize --overwrite --bin --asm -o ./build contracts.sol
