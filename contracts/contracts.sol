pragma solidity ^0.4.19;

contract XPaymentChannel {
    address public A;
    address public B;
    mapping( address=> uint256) values;
    uint256 public sum;

    uint256 challenge_endtime;
    uint32 nonce;

    enum ChannelState{init,funded,challenge,finished}
    ChannelState public state;

    uint256 ttl;

    uint256 public constant challenge_period = 1 minutes;

    event OnPayment(address sender, uint256 value);
    event OnChallengeStart(address sender,uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s);
    event OnChallengeUpdate(address sender,uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s);
    event OnChallengeFinish(address sender,uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s);
    event OnWithdraw(address sender, uint256 value);

    function XPaymentChannel(address _B, uint256 _ttl) public {
    	A=msg.sender;
    	B=_B;
    	sum=0;
    	ttl = now+_ttl;
    	challenge_endtime = 0;
    	nonce = 0;
    	state=ChannelState.init;
    }

	function () payable public {
		require(msg.sender==A ||msg.sender==B);
		require(msg.value>0);
		values[msg.sender]+=msg.value;
		if(state==ChannelState.init)state=ChannelState.funded;
		sum+=msg.value;
		OnPayment(msg.sender,msg.value);
	}

	function balance() public view returns(uint256){
		return sum;
	}


	function valueX(address addr) public view returns(uint256){
		return values[addr];
	}

	function checkSig(uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s) view internal {
		if(msg.sender==A){
			require(B == ecrecover(keccak256(address(this), A, id,vA,vB), v, r, s));
		} else if(msg.sender==B){
			require(A == ecrecover(keccak256(address(this), B, id,vA,vB), v, r, s));
		} else {
			revert();
		}	
	}

	function testSig(uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s) view public returns(bool){
		checkSig(id,vA,vB,v,r,s);
		return true;
	}	

	function challengeStart(uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s) public{
    	require(state==ChannelState.funded);
		require(sum>0 && sum == vA+vB);
		checkSig(id,vA,vB,v,r,s);
		require(id>nonce);
		nonce=id;
		challenge_endtime = now + challenge_period;
		state=ChannelState.challenge;
		OnChallengeStart(msg.sender,id,vA,vB,v,r,s);
	}

	function challengeUpdate(uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s) public{
    	require(state==ChannelState.challenge);
		require(sum>0 && sum == vA+vB);
		checkSig(id,vA,vB,v,r,s);
		require(id>nonce);
		nonce=id;
		OnChallengeUpdate(msg.sender,id,vA,vB,v,r,s);
	}

	function challengeFinish(uint32 id,uint256 vA, uint256 vB,uint8 v,bytes32 r,bytes32 s) public{
    	require(state==ChannelState.challenge);
    	require(now>challenge_endtime);
		require(sum>0 && sum == vA+vB);
		checkSig(id,vA,vB,v,r,s);
		require(id==nonce);
		if(vA>0)A.transfer(vA);
		if(vB>0)B.transfer(vB);
		values[A]=0;
		values[B]=0;
		sum=0;
		state=ChannelState.finished;
		OnChallengeFinish(msg.sender,id,vA,vB,v,r,s);
	}

	function withdraw() public{
		require(state!=ChannelState.finished);
		uint256 value = values[msg.sender];
		require(value>0);
		require(now>ttl);		
		msg.sender.transfer(value);
		sum-=value;
		values[msg.sender]=0;
		OnWithdraw(msg.sender,value);
	}
	
}

