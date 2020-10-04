const { RippleAPI , Remote , Amount, Transaction } = require('ripple-lib');

class XRP_Model{

	PARAMS={
		ADDRESS: "",
		TAG: 123456789,
		SECRET_KEY:"",
		SYMBOL:"XRP"
	};

	API=null;


	SERVERS=["wss://s.altnet.rippletest.net:51233"];




	constructor(params,server){
		this.PARAMS.ADDRESS=params.ADDRESS;
		this.PARAMS.TAG=params.TAG;
		this.PARAMS.SECRET_KEY=params.SECRET_KEY;
		this.SERVERS=server.servers;
		console.log(this.SERVERS);

		this.API=new RippleAPI({
			server: this.SERVERS[0]
		});
	}


	toString(){
		return {address: this.PARAMS.ADDRESS,tag: this.PARAMS.TAG};
	}

	//Send XRP
	async sendPayment(data,callback){

		var amount=data.amount;
		var RIPPLE_FROM_ADDRESS=this.PARAMS.ADDRESS;
		var RIPPLE_FROM_SECRET=this.PARAMS.SECRET_KEY;
		var RIPPLE_TO_ADDRESS=data.sendTo;
		var RIPPLE_TO_ADDRESS_TAG=data.sendToTag;

		/* Define the order to place here */
		const payment = {
			source: {
				address: RIPPLE_FROM_ADDRESS,
				maxAmount: {
					value: amount,
					currency: 'XRP'
				}
			},
			destination: {
				address: RIPPLE_TO_ADDRESS,
				tag: RIPPLE_TO_ADDRESS_TAG,
				amount: {
					value: amount,
					currency: 'XRP'
				}
			}
		};


	// Get ready to submit the payment
	const prepared = await this.API.preparePayment(RIPPLE_FROM_ADDRESS, payment, {
		maxLedgerVersionOffset: 5
	});
  	// Sign the payment using the sender's secret
  	const { signedTransaction } = this.API.sign(prepared.txJSON, RIPPLE_FROM_SECRET);

 	// Submit the payment
 	const res = await this.API.submit(signedTransaction);

 	var data={resource:res,transaction:signedTransaction};

 	callback(data);

 }

	//Receive XRP / Get Address/Tag Info.
	receivePayment(callback){
		return this.toString();
	}

	async watchAddress(addresses,callback){

		this.API.request('subscribe', {
			accounts: [ addresses ]
		}).then(response => {
			console.log('Successfully subscribed');
			callback('response',response);
		}).catch(error => {
			callback('error',error);
		});

	}

	async run(onConnection,onDisconnection,onError,onTransaction){

		this.API.on('error', (errorCode, errorMessage) => {
			onError(this.API,errorCode,errorMessage);
		});
		this.API.on('connected', () => {
			onConnection(this.API);
		});
		this.API.on('disconnected', (code) => {
			onDisconnection(this.API,code);
		});

		this.API.connection.on('transaction', (event) => {
			onTransaction(this.API,event);
		});


		this.API.connect().then(() => {
		}).catch(onError());


	};




}
module.exports = {XRP_Model};