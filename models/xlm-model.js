const { debug } = require('console');



class XLM_Model{

	PARAMS={
		ADDRESS: "",
		TAG: 123456789,
		SECRET_KEY: "",
		SYMBOL: "XLM"
	};

	API=null;


	SERVERS=["https://horizon-testnet.stellar.org"];




	constructor(params,server){
		this.PARAMS.SYMBOL=params.SYMBOL;
		this.PARAMS.ADDRESS=params.ADDRESS;
		this.PARAMS.TAG=params.TAG;
		this.PARAMS.SECRET_KEY=params.SECRET_KEY;
		this.SERVERS=server.servers;

		debug(this.SERVERS);
	}


	toString(){
		return {address: this.PARAMS.ADDRESS,tag: this.PARAMS.TAG};
	}

	//Send XRP
	async sendPayment(data,callback){

		var amount=data.amount;
		var FROM_ADDRESS=this.PARAMS.ADDRESS;
		var FROM_SECRET=this.PARAMS.SECRET_KEY;
		var TO_ADDRESS=data.sendTo;
		var TO_ADDRESS_TAG=data.sendToTag;

		/* Define the order to place here */
		const payment = {
			source: {
				address: FROM_ADDRESS,
				maxAmount: {
					value: amount,
					currency: 'XLM'
				}
			},
			destination: {
				address: TO_ADDRESS,
				tag: TO_ADDRESS_TAG,
				amount: {
					value: amount,
					currency: 'XLM'
				}
			}
		};

		const { Asset, Memo, StellarSdk, Operation, BASE_FEE, TransactionBuilder,  Keypair, NotFoundError, Server, Networks} = require('stellar-sdk');

		var server = new Server(this.SERVERS[0]);
		var sourceKeys = Keypair
		  .fromSecret(FROM_SECRET);
		var destinationId = TO_ADDRESS;
		// Transaction will hold a built transaction we can resubmit if the result is unknown.
		var transaction;

		server.loadAccount(destinationId)
		// If the account is not found, surface a nicer error message for logging.
		.catch(function (error) {
		  if (error instanceof NotFoundError) {
			throw new Error('The destination account does not exist!');
		  } else return error
		})
		// If there was no error, load up-to-date information on your account.
		.then(function() {
		  return server.loadAccount(sourceKeys.publicKey());
		})
		.then(function(sourceAccount) {
		  // Start building the transaction.
		  transaction = new TransactionBuilder(sourceAccount, {
			fee: BASE_FEE,
			networkPassphrase: Networks.TESTNET
		  })
			.addOperation(Operation.payment({
			  destination: destinationId,
			  // Because Stellar allows transaction in many currencies, you must
			  // specify the asset type. The special "native" asset represents Lumens.
			  asset: Asset.native(),
			  amount: amount
			}))
			// A memo allows you to add your own metadata to a transaction. It's
			// optional and does not affect how Stellar treats the transaction.
			.addMemo(Memo.text(""+TO_ADDRESS_TAG))
			// Wait a maximum of three minutes for the transaction
			.setTimeout(180)
			.build();
		  // Sign the transaction to prove you are actually the person sending it.
		  transaction.sign(sourceKeys);
		  // And finally, send it off to Stellar!
		  return server.submitTransaction(transaction);
		})
		.then(function(result) {
		  //console.log('Success! Results:', result);
		  callback(result);
		})
		.catch(function(error) {
			callback(error);
		  //console.error('Something went wrong!', error);
		  // If the result is unknown (no response body, timeout etc.) we simply resubmit
		  // already built transaction:
		  // server.submitTransaction(transaction);
		});




	}

	//Receive XRP / Get Address/Tag Info.
	receivePayment(callback){
		return this.toString();
	}

	async watchAddress(addresses,callback){

		this.API.request('subscribe', {
			accounts: [ addresses ]
		}).then(response => {
			debug('Successfully subscribed');
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
module.exports = {XLM_Model};