var express = require("express");
var app = express();


//Toggle Debug On.
const debugOn=true;

//Debug Function
global.debug=function(...args){
	if(debugOn){
		console.log("DEBUG:",args);
	}
}

const { XRP_Model } = require("./models/xrp-model.js");
const { Vault } = require("./vault.js");
const { FakeData } = require("./fake-data.js");


//Create Some Fake Data
const APP_ACCOUNTS=new FakeData(1000).getAccounts();



//Supported Currencies
const CURRENCIES={ 
	xrp: new XRP_Model({
		FRIENDY_NAME: "HotWallet",
		ADDRESS: "rJenoFjrbPks37yjRogCBWkXDV3T7VNwh",
		TAG: 123456789,
		SECRET_KEY:"ssWjKfjWSKnpJVn4m7yoeSy8dDxcK"
	},
	{
		servers:["wss://s.altnet.rippletest.net:51233"]
	})
};

//Create a new Vault
const vault = new Vault(CURRENCIES);





//Main API Server
app.listen(3000, () => {
	debug("Server running on port 3000");
	vault.watchXRP();
});



//Show Accounts
app.get('/accounts',(req,res,next) => {
	res.json(APP_ACCOUNTS);
});



//Get Deposit Address
app.get('/receiveUser/:currency/address', (req, res, next) => {

 	//Get Random Account and Deposit Address
 	var account=APP_ACCOUNTS[Math.floor(0 + Math.random() * APP_ACCOUNTS.length)];



 	if(req.params.currency=="xrp"){
 		res.json(
 		{
 			[req.params.currency]:{
 				address: CURRENCIES[req.params.currency].PARAMS.ADDRESS,
 				tag: account.tag
 			}
 		}
 		);
 	}else{
 		res.json(["currency not found..."]); 	
 	}


 });


//Get Deposit Address
app.get('/receiveServer/:currency/', (req, res, next) => {

	if(req.params.currency=="xrp"){
		res.json(
		{
			[req.params.currency]:{
				address: CURRENCIES[req.params.currency].PARAMS.ADDRESS,
				tag: CURRENCIES[req.params.currency].PARAMS.TAG
			}
		}
		);
	}else{
		res.json(["currency not found..."]); 	
	}


});



//Send Payment to Address
app.get('/sendPayment/:currency/:address/:meta/:amount', (req, res, next) => {
	var currency=CURRENCIES[req.params.currency];

	if(req.params.currency=="xrp"){

		const payment={
			amount: req.params.amount,
			sendTo: req.params.address,
			sendToTag: parseInt(req.params.meta)
		};


		debug("Creating Transaction Details: ",payment);


		vault.sendPayment(currency,payment,function(ret){
			if(ret.resource.resultCode.indexOf('SUCCESS')){
				var hash=ret.resource.tx_json.hash;
				var tag=ret.resource.tx_json.DestinationTag;
				var amount=ret.resource.tx_json.Amount;
				debug(`Outgoing Transaction: \n tx:${hash} / tag:${tag} / amount:${amount/1000000 } XRP`);

				res.json({
					[req.params.currency]:{
						address: req.params.address,
						tag: parseInt(req.params.meta),
						hash: hash,
						amount: amount

					}
				});
			}else{


				res.json(["currency not found..."]); 

			}
		}).catch(error => console.error(error.stack));

	}else{
		res.json(["currency not found..."]); 	
	}


});

