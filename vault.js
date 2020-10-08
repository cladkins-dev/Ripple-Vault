var scheduler = require('node-schedule');


class Vault {
	CURRENCIES=null;


	SCHEDULED_PAYMENTS=null;

	SCHEDULER_TASK=null;


	constructor(currencies) {
		this.CURRENCIES=currencies;
		this.SCHEDULED_PAYMENTS=new Array();

		var parent=this;
		if(parent.SCHEDULER_TASK==null){
			debug("Creating new Scheduler...");
			parent.SCHEDULER_TASK = scheduler.scheduleJob('* * * * *', function(){
				parent.checkScheduledPayments(new Date());
			});
		}



	}


	getScheduledPayments(){
		return this.SCHEDULED_PAYMENTS;
	}

	async checkScheduledPayments(fireDate){
		var currentDate = new Date();
		var currentTime=currentDate.getTime().toString();
		var newPayments=Array();
		var parent=this;
		var lasthash=null;
		var lastPayment=null;
		parent.SCHEDULED_PAYMENTS.forEach(async function(item){


			var rawTimeStamp=parseInt(item.payment.releaseTime);
			var releaseTime=new Date(rawTimeStamp* 1000);

			if(currentDate>=releaseTime){
				debug('This job is supposed to run at ' + releaseTime.toLocaleDateString('en-US')+" "+releaseTime.toLocaleTimeString().replace(/:\d+ /, ' ')  + ', and it actually ran at ' + currentDate.toLocaleDateString('en-US')+" "+currentDate.toLocaleTimeString().replace(/:\d+ /, ' '));
				
				//The shame I feel for implementing this hack...
				//Ensure our payment is submitted.
				var interval=setInterval(function(){


					parent.sendPayment(item.currency,item.payment, function(res){
						var currenthash=res.resource.tx_json.hash;
						var resultCode=res.resource.resultCode;


						if(resultCode.indexOf('SUCCESS') && !(lasthash==currenthash)){
							item.callback(res);
							clearInterval(interval);
						}



						lasthash=currenthash;
						lastPayment=item;

					});


				},1000);
				
			}else{
				newPayments.push(item);
			}
		});



		parent.SCHEDULED_PAYMENTS=newPayments;
		this.SCHEDULED_PAYMENTS=parent.SCHEDULED_PAYMENTS;
		debug("Scheduled Items In Queue:",this.SCHEDULED_PAYMENTS.length);
	}



	//Schedule a payment
	async schedulePayment(currency,payment,callback){
		var parent=this;

		parent.SCHEDULED_PAYMENTS.push({
			currency:currency,
			payment:payment,
			callback: callback
		});

	}



	//Send a payment
	async sendPayment(currency,payment,callback){
		var currency_symbol=currency.PARAMS.SYMBOL;


		//debug("Selected Currency:", currency_symbol);

		if(currency_symbol=="XRP"){

			currency.sendPayment(payment,function(res){
				callback(res);
			}).catch(error => console.error(error.stack));


		}else{
			debug("Currency not Supported...");
		}




	}

	async watchXRP(){
		var currency=this.CURRENCIES.xrp;

		currency.run(
			function(API){
				debug("Connected...");
				//debug("Subscribing to Address...");

				// currency.watchAddress(
				// 	"r4z5yejJMyGfjeehnrZQhb28p4fjmPLf9",
				// 	function(method,e){
				// 		debug('subscribe', method,e)
				// 	});


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
