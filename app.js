'use strict';

const Homey = require('homey');
const https = require('https');

var locales = ["bn-BD", "bn-IN", "cs-CZ", "da-DK", "de-DE", "el-GR", "en-AU", "en-GB", "en-IN", "en-US", "es-ES", "es-US", "fi-FI", "fil-PH", "fr-BE", "fr-FR", "hi-IN", "hu-HU", "in-ID", "it-IT", "ja-JP", "km-KH", "ko-KR", "nb-NO", "ne-NP", "nl-NL", "pl-PL", "pt-BR", "pt-PT", "ru-RU", "si-LK", "sv-SE", "th-TH", "tr-TR", "uk-UA", "vi-VN", "yue-HK"];

function searchForDevicesByValue ( value ) {
	var devices = Homey.ManagerSettings.get('devices');
	var tempItems = [];
	for (var i = 0; i < devices.length; i++) {
		var tempName = devices[i].name;
		var tempToken = devices[i].token;
		if ( tempName.indexOf(value) >= 0 )
			tempItems.push({ icon: '', name: tempName, token: tempToken });
	}
	return tempItems;
}

class RemoteSpeak extends Homey.App {

	onInit() {
		this.log('RemoteSpeak is running...');

		process.on('unhandledRejection', (error) => {
			this.error('unhandledRejection! ', error);
		});
		
		process.on('uncaughtException', (error) => {
			this.error('uncaughtException! ', error);
		});
		
		const sendMsg = new Homey.FlowCardAction('send_msg');
		
		sendMsg
			.register()
			.registerRunListener(async (args) => {
				if( typeof args.device == 'undefined' || args.device == null || args.device == '') return callback( new Error("Device cannot be empty!") );
				if( typeof args.lang == 'undefined' || args.lang == null || args.lang == '') return callback( new Error("Lang cannot be empty!") );
				if( typeof args.msg == 'undefined' || args.msg == null || args.msg == '') return callback( new Error("Message cannot be empty!") );
				const result = await this.sendMsg(args.device.token, args.lang, args.msg);
				return Promise.resolve(result);
			});
			
		sendMsg
			.getArgument('device')
			.registerAutocompleteListener(( query, args ) => {
				var items = searchForDevicesByValue( query );
            	return Promise.resolve(items);
			});
			
		sendMsg
			.getArgument('lang')
			.registerAutocompleteListener(( query, args ) => {
				var items = [];
				for (var i = 0; i < locales.length; i++)
					items.push({ icon: '', name: locales[i] });
            	return Promise.resolve(items);
			});
	}
	
	sendMsg(_token, _lang, _msg) {
		return new Promise(async (resolve, reject) => {
			try {
				const postData = {
						to: _token,
						priority: 'high',
						data: {
							lang: _lang.name,
							msg: _msg
						}
					};
				const headers = {
					'Content-Type': 'application/json',
					'Authorization': 'key=AIzaSyCau_csJXUd5RFFjdKGKH6h9Tvaz4sLj5Y',
				};
				const options = {
					hostname: 'gcm-http.googleapis.com',
					path: '/gcm/send',
					headers,
					method: 'POST',
				};
				//this.log("Json: " + JSON.stringify(postData));
				const result = await this._makeHttpsRequest(options, JSON.stringify(postData));
				if (result.statusCode !== 200)
					return reject(Error(`error: ${result.statusCode} ${result.body.substr(0, 100)}`));
				const response = JSON.parse(result.body);
				if (response.failure)
					return reject(Error(`error: ${JSON.stringify(response.results)}`));
				//this.log("Response: " + JSON.stringify(response));
				return resolve(response.success);
			} catch (error) {
				return reject(error);
			}
		});
	}

	_makeHttpsRequest(options, postData) {
		return new Promise((resolve, reject) => {
			const req = https.request(options, (res) => {
				let resBody = '';
				res.on('data', (chunk) => {
					resBody += chunk;
				});
				res.on('end', () => {
					res.body = resBody;
					return resolve(res); // resolve the request
				});
			});
			req.on('error', (e) => {
				this.log(e);
				reject(e);
			});
			req.setTimeout(50000, () => {
				req.abort();
				reject(Error('Connection timeout'));
			});
			req.write(postData);
			req.end();
		});
	}
}

module.exports = RemoteSpeak;