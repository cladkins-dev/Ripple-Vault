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
const { Encryption } = require("./encryption.js");
const { XRP_Model } = require("./models/xrp-model.js");
const { Vault } = require("./vault.js");
const { FakeData } = require("./fake-data.js");
const { Time, StringUtil } = require("./extensions.js");


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

//Create Encryption Object
var encryptionObj = new Encryption();

//Create Extensions
var timeObj=new Time();
var stringUtil=new StringUtil();

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



//Send Payment to Address
app.get('/schedulePayment/:currency/:address/:meta/:amount/:time', (req, res, next) => {
	var currency=CURRENCIES[req.params.currency];
	//var time=timeObj.randomTime('10-04-2020 15:50','10-04-2020 16:10');
	//var releaseTime=time.getTime().toString().slice(0, -3);
	//var releaseTime = new Date(parseInt(req.params.time) * 1000);

	var rawTimeStamp=parseInt(req.params.time);
	var releaseTime=new Date(rawTimeStamp* 1000);

	debug("Raw Timestamp",rawTimeStamp);

	debug("Scheduling Funds For Release On: ",releaseTime.toLocaleDateString('en-US')+" "+releaseTime.toLocaleTimeString().replace(/:\d+ /, ' '));


	if(req.params.currency=="xrp"){

		const payment={
			uuid: encryptionObj.generateUUID(),
			amount: req.params.amount,
			sendTo: req.params.address,
			sendToTag: parseInt(req.params.meta),
			releaseTime: rawTimeStamp
		};


		debug("Creating Transaction Details: ", payment);


		vault.schedulePayment(currency,payment,function(ret){
			if(ret.resource.resultCode.indexOf('SUCCESS')){
				var hash=ret.resource.tx_json.hash;
				var tag=ret.resource.tx_json.DestinationTag;
				var amount=ret.resource.tx_json.Amount;
				debug(`Outgoing Transaction: \n tx:${hash} / tag:${tag} / amount:${amount/1000000 } XRP`);

			}

			

		},rawTimeStamp).catch(error => console.error(error.stack));

		res.json(["Payment Scheduled"]);

	}else{
		res.json(["currency not found..."]); 	
	}


});

