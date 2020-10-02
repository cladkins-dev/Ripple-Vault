const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

var fs = require('fs');


class Encryption {
	key="";
	iv="";

	constructor() {
		this.key = crypto.randomBytes(32);
		this.iv = crypto.randomBytes(16);
	}

	encrypt(text) {
		let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.key), this.iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return { iv: this.iv.toString('hex'), encryptedData: encrypted.toString('hex') };
	}

	decrypt(text) {
		let iv = Buffer.from(text.iv, 'hex');
		let encryptedText = Buffer.from(text.encryptedData, 'hex');
		let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.key), this.iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	}

	toString(){
		return this.key.toString('hex');
	}


	writeEncryptionFile(filename,callback){
		try {
			fs.writeFile(filename, this.toString(), function (err) {
				if (err) {
					throw err;
				}
				callback(err);
			});
		} catch (err){
			console.error(err)
		}
	}

	readEncryptionFile(filename,callback){
		try {
			fs.readFile(filename, 'utf8' , (err, data) => {
				if (err) {
					console.error(err)
					return false;
				}
				callback(err);
			})	
		} catch (err) {
			console.error(err)
		}
	}

}


module.exports = {Encryption};