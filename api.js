var express = require("express");
var app = express();


app.listen(3000, () => {
 console.log("Server running on port 3000");
});


app.get('/withdraw/:userId/Key/:keyString', (req, res, next) => {
 console.log(req.params.userId);
 console.log(req.params.keyString);
 res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});

app.get('/deposit/:currency/address', (req, res, next) => {
 if(req.params.currency=="xrp"){
 	res.json(["awfjhewfhj8023fh2wghf0gh0892"]);
 }


 console.log(req.params.userId);
 console.log(req.params.keyString);
 res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});


app.post('/withdraw2', function (req, res) {
	var address=req.address;
	var passcode=req.code;
  res.send('POST request to homepage')
})