class Vault {
	CURRENCIES=null;

	constructor(currencies) {
		this.CURRENCIES=currencies;
	}





	async sendPayment(currency,payment,callback){
		var currency_symbol=currency.PARAMS.SYMBOL;


		debug("Selected Currency:", currency_symbol);

		if(currency_symbol=="XRP"){

			currency.sendPayment(payment,function(res){
				callback(res);
			}).catch(error => console.error(error.stack));


		}else{
			debug("Currency not Supported...");
		}




	}


	async sendXRP(){
		var currency=this.CURRENCIES.xrp;

		currency.sendPayment({
			amount:10,
			sendTo:"r4z5yejJMyGfjeehnrZQhb28p4fjmPLf9",
			sendToTag:121432567
		},function(res){
			debug(res);
		}).catch(error => console.error(error.stack));


	}

	async watchXRP(){
		var currency=this.CURRENCIES.xrp;

		currency.run(
			function(API){
				debug("Connected...");
				debug("Subscribing to Address...");

				currency.watchAddress(
					"r4z5yejJMyGfjeehnrZQhb28p4fjmPLf9",
					function(method,e){
						debug('subscribe', method,e)
					});


			},function(API,event){
				debug("Disconnected...",event);
			},
			function(errorCode,errorMessage){

			},function(API,transaction){
				var hash=transaction.transaction.hash;
				var tag=transaction.transaction.DestinationTag;
				var amount=transaction.transaction.Amount;
				debug(`Incoming Transaction: \n tx:${hash} / tag:${tag} / amount:${amount/1000000 } XRP`);
			});
	}

}



module.exports= {Vault};
