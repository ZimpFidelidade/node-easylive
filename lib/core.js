'use strict';

const got = require('got');
const pkg = require('../package.json');
const helper = require('./helper.js');

var coreAPI = {

	init(keys, env) {
		coreAPI.rootUrl = `https://easylive.com.br/${keys.basePath}`;

		if(env !== 'production') {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
			coreAPI.rootUrl = `https://easylive-homolog.totalcommit.com/${keys.basePath}`;
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
		} catch (parseError) {
			return response;
		}
	},

	sendRequest(method, url, requestData) {
		let gotParams = {
			method,
			headers: {
				'User-Agent': `node-easylive/${pkg.version} (${pkg.homepage})`,
				'Authorization': `Basic ${this.keys.authString}`
			}
		};

		if(requestData) {
			gotParams.body = JSON.stringify(requestData);
		}

		return got(`${this.rootUrl}${url}`, gotParams)
			.then(this.parseResponse)
			.then((requestResponse) => requestResponse.body)
			.catch((errorObj) => {
				return this.errorHandler('main', 'RequestError', errorObj);
			});
	}

};

module.exports = coreAPI;
