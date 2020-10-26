var express = require("express");
var app = express();
var bodyParser = require('body-parser')

//Listening Port
const SERVER_PORT = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());


//Toggle Debug On.
const debugOn = true;

//Debug Function
global.debugCache = null;
global.debugCacheCount = 1;

global.debug = function (...args) {
	if (debugOn) {
		if (JSON.stringify(global.debugCache) == JSON.stringify(args)) {
			console.log("DEBUG:", args, " / MSG REPEAT (times):", global.debugCacheCount, "\r");
			global.debugCacheCount++;
		} else {
			console.log("DEBUG:", args);
			global.debugCacheCount = 1;
			global.debugCache = args;
		}
	}
}
const { Encryption } = require("./encryption.js");
const { XRP_Model } = require("./models/xrp-model.js");
const { XLM_Model } = require("./models/xlm-model.js");
const { Vault } = require("./vault.js");
const { FakeData } = require("./fake-data.js");
const { Time, StringUtil } = require("./extensions.js");
const { debug } = require("console");
const { exit } = require("process");


//Create Some Fake Data
const APP_ACCOUNTS = new FakeData(1000).getAccounts();



//Supported Currencies
const CURRENCIES = {
	XRP: new XRP_Model({
		SYMBOL: "XRP",
		FRIENDY_NAME: "HotWallet",
		ADDRESS: "rJenoFjrbPks37yjRogCBWkXDV3T7VNwh",
		TAG: 123456789,
		SECRET_KEY: "ssWjKfjWSKnpJVn4m7yoeSy8dDxcK"
	},{
		servers: ["wss://s.altnet.rippletest.net:51233"]
	}),
	XLM: new XLM_Model({
		SYMBOL: "XLM",
		FRIENDY_NAME: "HotWallet1",
		ADDRESS: "GAMV6LNFRUDZZZ65VQ7GJTKASUFX6S2HUONPE6PEABCXIB2F2Y5X3ATB",
		TAG: 123456789,
		SECRET_KEY: "SDYJHLWUIONIWLXVYO2AVDT6QUNYXQX72DK2Q5JHT7XW5F433LGQMPDS"
	},{
		servers: ["https://horizon-testnet.stellar.org"]
	})
};

//Create Encryption Object
var encryptionObj = new Encryption();

//Create Extensions
var timeObj = new Time();
var stringUtil = new StringUtil();

//Create a new Vault
const vault = new Vault(CURRENCIES);





//Main API Server
app.listen(SERVER_PORT, () => {
	debug("Server running on port:", SERVER_PORT);
	vault.watchXRP();
});



//Show Accounts
app.get('/accounts', (req, res, next) => {
	res.json(APP_ACCOUNTS);
});



//Get Deposit Address
app.get('/receiveUser/:currency/address', (req, res, next) => {

	//Get Random Account and Deposit Address
	var account = APP_ACCOUNTS[Math.floor(0 + Math.random() * APP_ACCOUNTS.length)];



	if (req.params.currency == "xrp") {
		res.json(
			{
				[req.params.currency]: {
					address: CURRENCIES[req.params.currency].PARAMS.ADDRESS,
					tag: account.tag
				}
			}
		);
	} else {
		res.json(["currency not found..."]);
	}


});


//Get Deposit Address
app.get('/serverInfo/:currency/', (req, res, next) => {

	if (req.params.currency == "xrp") {
		res.json(
			{
				[req.params.currency]: {
					address: CURRENCIES[req.params.currency].PARAMS.ADDRESS,
					tag: CURRENCIES[req.params.currency].PARAMS.TAG
				}
			}
		);
	} else {
		res.json(["currency not found..."]);
	}


});


//Send Payment to Addresses , Schedule Random Times
app.post('/schedulePayment', (req, res, next) => {
	var currency_symbol=req.body.currency.toUpperCase();
	var currency = CURRENCIES[currency_symbol];
	var address = req.body.address;
	var meta = req.body.address;
	var amount = req.body.amount;
	var req_time=parseInt(req.body.time)
	var rawTimeStamp = (!isNaN(req_time))?req_time:0;
	var releaseTime = (rawTimeStamp>0)?new Date(rawTimeStamp * 1000):new Date();

	//If we pass in no trans_count, we just do
	var trans_count =(req.body.trans_count>0)?req.body.trans_count:1;

	//Ensure we have Defined all of our body params.
	if ((typeof currency != "undefined") && (typeof address != "undefined") && (typeof meta != "undefined") && (typeof amount != "undefined")) {

		//Scope locally
		let date_ob = releaseTime;

		// current date
		// adjust 0 before single digit date
		let date = ("0" + date_ob.getDate()).slice(-2);

		// current month
		let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

		// current year
		let year = date_ob.getFullYear();

		// current hours
		let hours = date_ob.getHours();

		// current minutes
		let minutes = date_ob.getMinutes();

		let composedCurrentTime=month+"-"+date+"-"+year+" "+hours+":"+minutes;
		let composedFutureTime=month+"-"+date+"-"+year+" "+(hours+1)+":"+minutes;

		debug("Current Time:",composedCurrentTime," ","Future Time:",composedFutureTime);

		let unprocessedPayments=Array();
	

		for (var i = 0; i < trans_count; i++) {
			let newReleaseTime=releaseTime;
			let newRawTimeStamp=rawTimeStamp;

			if(rawTimeStamp==0){
				newReleaseTime = timeObj.randomTime(composedCurrentTime, composedFutureTime);
			}
			
			newRawTimeStamp = parseInt(timeObj.epoch(newReleaseTime).toString()) / 1000;

			debug("Random Time:", newReleaseTime);
			debug("Raw Timestamp", newRawTimeStamp);
			debug("Scheduling Funds For Release On: ", newReleaseTime.toLocaleDateString('en-US') + " " + newReleaseTime.toLocaleTimeString().replace(/:\d+ /, ' '));

			//Match Currency Case
			if ((currency_symbol == "XRP") || (currency_symbol == "XLM")) {

				//Create Payment
				const payment = {
					currency: currency.PARAMS.SYMBOL,
					uuid: encryptionObj.generateUUID(),
					amount: req.body.amount,
					sendTo: req.body.address,
					sendToTag: parseInt(req.body.meta),
					releaseTime: newRawTimeStamp
				};

				debug("Creating Transaction Details: ", payment);


				try {				  

				//Schedule Payment
				vault.schedulePayment(currency, payment, function (ret) {
					debug("Ret",ret);
					
					if ((ret.resource.resultCode.indexOf('SUCCESS'))) {
						var hash = ret.resource.tx_json.hash;
						var tag = ret.resource.tx_json.DestinationTag;
						var amount = ret.resource.tx_json.Amount;
						debug(`Outgoing Transaction: \n tx:${hash} / tag:${tag} / amount:${amount / 1000000} ${currency_symbol}`);

					}
				},function(ret){
					unprocessedPayments.push(payment);
				}).catch(error => console.error(error.stack));


			} catch (error) {
				debug(error);
			}

			} else {
				res.json(["currency not found..."]);
			}


		}

		if(unprocessedPayments.length>0){
			res.json(unprocessedPayments);
		}else{
			res.json(["Payments Scheduled"]);
		}

	} else {
		res.json(["One Or More Paramaters is Missing"]);
	}

});


