export default {
	server: {
		host: '0.0.0.0'
	},
	hooks: {
		listen(server, options) {
			console.log('')
			require('qrcode-terminal').generate(`http://${options.host}:${options.port}`)
		}
	},
	head: {
		meta: [{
				hid: 'charset',
				charset: 'utf-8'
			},
			{
				hid: 'viewport',
				name: 'viewport',
				content: ['width=device-width', 'initial-scale=1', 'user-scalable=no'].join(',')
			}
		]
	}
}
