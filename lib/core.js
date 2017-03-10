'use strict';

const got = require('got');
const pkg = require('../package.json');
const helper = require('./helper.js');

var coreAPI = {

	init(keys, env) {
		coreAPI.rootUrl = `https://easylive.totalcommit.com/${keys.basePath}`;

		if(env === 'development') {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			coreAPI.rootUrl = coreAPI.rootUrl
				.replace('easylive', 'easylive-homolog');
		}

		keys.authString = Buffer
			.from(`${keys.user}:${keys.password}`)
			.toString('base64');

		coreAPI.env = env;
		coreAPI.keys = keys;

		return coreAPI;
	},

	parseResponse(response) {
		try {
			response.body = JSON.parse(response.body);
			return response;
		} catch (e) {
			return response;
		}
	},

	sendRequest(method, url, data) {
		let gotParams = {
			method: method,
			headers: {
				'User-Agent': `node-easylive/${pkg.version} (${pkg.homepage})`,
				'Authorization': `Basic ${this.keys.authString}`
			}
		};

		if(data) {
			gotParams.body = JSON.stringify(data);
		}

		return got(`${this.rootUrl}${url}`, gotParams)
			.then(this.parseResponse)
			.then((requestResponse) => requestResponse.body)
			.catch((errorObj) => {
				return this.errorHandler('main', 'RequestError', errorObj)
			});
	}

};

module.exports = coreAPI;
