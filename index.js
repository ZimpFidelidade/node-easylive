'use strict';

const coreAPI = require('./lib/core');
const Helpers = require('./lib/helper');
const Products = require('./lib/products');
const Order = require('./lib/order');
const Joi = require('joi');

var EasyLive = {

	validateData(initializeData) {
		const validatedData = Joi
			.validate(initializeData, Helpers.initialDataschema);

		if(validatedData.error) {
			return Helpers.errorHandler('main', 'missingCredentials', validatedData.error, true);
		}
	},

	init(config, env) {
		EasyLive.validateData(config);
		env = (env || 'development');

		const coreInit = coreAPI.init(config, env);

		return Object.assign(
			Helpers,
			coreInit,
			Products,
			Order
		);
	}

};

module.exports.init = EasyLive.init;
