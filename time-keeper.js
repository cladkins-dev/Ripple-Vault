import './prototypes.js';


var ENCRYPTED_TIME=""

var fs = require('fs');

var encryption=require('./encryption.js');

encryption.init();


var time=randomTime('10-02-2020 12:15','10-02-2020 12:30');

var hw = encrypt(epoch(time).toString())

var getTimeStamp=decrypt(hw).slice(0, -3);

console.log('Your decrypt string is : '+ getTimeStamp)


var hexkey=key.toString('hex');


fs.writeFile('encryption.txt', hexkey, function (err) {
  if (err) throw err;
  console.log('Saved!');
});


console.log("Encryption String New:"+hexkey);
