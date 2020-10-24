const { Encryption } = require("./encryption.js");
const { Time, StringUtil } = require("./extensions.js");


var encryptionObj = new Encryption();
var timeObj=new Time();
var stringUtil=new StringUtil();


var msg=encryptionObj.encrypt("test");

var time=timeObj.randomTime('10-02-2020 12:15','10-02-2020 12:30');


var hw = encryptionObj.encrypt(timeObj.epoch(time).toString())

var timeStamp=timeObj.getTimeStamp=encryptionObj.decrypt(hw).slice(0, -3);

console.log('Your decrypt string is : '+ timeStamp)


console.log(msg);
console.log(timeStamp);
console.log(encryptionObj.toString());
console.log("===========");

encryptionObj.writeEncryptionFile("keyfile.txt",function(err){
	console.log("Write File...");
});

encryptionObj.readEncryptionFile("keyfile.txt",function(err){
	console.log("Read File... ");
});