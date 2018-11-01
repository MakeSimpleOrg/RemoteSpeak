const Homey = require('homey');

module.exports = [
	{
		description: 'Test sending an message from frontend',
		method: 'POST',
		path: '/sendMsg',
		fn: async function fn(args, callback) {
			const result = await Homey.app.sendMsg(args.body.device.token, args.body.lang, args.body.msg);
			if (result instanceof Error) return callback(result);
			return callback(null, result);
		},
	},
];