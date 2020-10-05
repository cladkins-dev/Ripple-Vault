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

	async checkScheduledPayments(fireDate){
		var currentDate = new Date();
		var currentTime=currentDate.getTime().toString();
		var newPayments=Array();
		var parent=this;
		parent.SCHEDULED_PAYMENTS.forEach(function(item){


			var rawTimeStamp=parseInt(item.payment.releaseTime);
			var releaseTime=new Date(rawTimeStamp* 1000);

			if(currentDate>=releaseTime){
				debug('This job is supposed to run at ' + releaseTime.toLocaleDateString('en-US')+" "+releaseTime.toLocaleTimeString().replace(/:\d+ /, ' ')  + ', and it actually ran at ' + currentDate.toLocaleDateString('en-US')+" "+currentDate.toLocaleTimeString().replace(/:\d+ /, ' '));
				parent.sendPayment(item.currency,item.payment,function(res){
					item.callback(res);
				});
			}else{
				newPayments.push(item);
			}
		});

		parent.SCHEDULED_PAYMENTS=newPayments;
		this.SCHEDULED_PAYMENTS=parent.SCHEDULED_PAYMENTS;
	}



	async schedulePayment(currency,payment,callback,timestamp){
		var parent=this;

		parent.SCHEDULED_PAYMENTS.push({
			currency:currency,
			payment:payment,
			callback: callback
		});

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
