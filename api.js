var express = require("express");
var app = express();

const RippledWsClient = require('rippled-ws-client')

const SERVER="wss://s.altnet.rippletest.net:51233";
const WATCH_ADDRESSES=[ 'rJenoFjrbPks37yjRogCBWkXDV3T7VNwh', 'r4z5yejJMyGfjeehnrZQhb28p4fjmPLf9' ];


const APP_ACCOUNTS=Array(40);

for(i=0;i<APP_ACCOUNTS.length;i++){
  APP_ACCOUNTS[i]={
  	address: WATCH_ADDRESSES[0],
    tag: Math.floor(100000000 + Math.random() * 900000000),
    userid: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  };
}

Array.prototype.getByTag = function(name) {
    for (var i=0, len=this.length; i<len; i++) {
        if (typeof this[i] != "object") continue;
        if (this[i].id === name) return this[i];
    }
};


app.listen(3000, () => {
 console.log("Server running on port 3000");
});



app.get('/accounts',(req,res,next) => {
	res.json(APP_ACCOUNTS);
});

app.get('/deposit/:currency/address', (req, res, next) => {
 if(req.params.currency=="xrp"){

 	var account=APP_ACCOUNTS[Math.floor(0 + Math.random() * APP_ACCOUNTS.length)];

 	res.json({"xrp":{
 		address: account.address,
 		tag: account.tag
 	}});
 }else if(req.params.currency=="btc"){
 	res.json({"btc":{
 		address: "jf92903jrf902390j90j290"
 	}});
 }else{
 	res.json(["currency not found..."]); 	
 }
});

