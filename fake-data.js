//Class for creating Fake Data for Testing

class FakeData{



	APP_ACCOUNTS=Array(40);

	constructor(size=40){

	//Generate Test Data
	var APP_ACCOUNTS=Array(size);
	for(var i=0;i<APP_ACCOUNTS.length;i++){
		APP_ACCOUNTS[i]={
			tag: Math.floor(100000000 + Math.random() * 900000000),
			userid: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		};
	}

	this.APP_ACCOUNTS=APP_ACCOUNTS;
}


	getAccounts(){
		return this.APP_ACCOUNTS;
	}

}

module.exports={FakeData}