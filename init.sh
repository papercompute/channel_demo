node utils/deploy.js
node utils/deposit.js --key keys/Alice.hex --value 1.0
node utils/deposit.js --key keys/Bob.hex --value 0.5
#node utils/balance.js
node utils/send.js --key keys/Alice.hex --partner keys/Bob_addr.hex --tx txs/tx00001.json --value 0.5
node utils/challenge_start.js --key keys/Bob.hex --tx txs/tx00001.json
#node utils/challenge_update.js --key keys/Alex.hex --tx txs/tx00002.json
# wait
#node utils/challenge_finish.js --key keys/Bob.hex --tx txs/tx00001.json

