'use strict';

const Joi = require('joi');
/* eslint-disable */
/* $lab:coverage:off$ */
const customJoi = Joi.extend({
	base: Joi.string().trim().lowercase().replace(/[^\d]+/g, '').length(11),
	name: 'string',
	language: { cpf: 'must be a valid CPF number' },
	rules: [{
		name: 'cpf',
		description: 'Valid CPF number',
        validate(params, value, state, options) {
			if (!value) {
				return this.createError('string.cpf', { v: value }, state, options);
			}

			let sumFirst = 0;
			let sumSecond = 0;
			let verFrist = 0;
			let verSecond = 0;

			let cpf = value;
			if( !cpf
				|| cpf === '00000000000' || cpf === '11111111111'
				|| cpf === '22222222222' || cpf === '33333333333'
				|| cpf === '44444444444' || cpf === '55555555555'
				|| cpf === '66666666666' || cpf === '77777777777'
				|| cpf === '88888888888' || cpf === '99999999999'
			) {
				return this.createError('string.cpf', { v: value }, state, options);
			}

			for (let x = 0; x < 9; x++) {
				sumFirst += parseInt(cpf.charAt(x), 10) * (10 - x);
			}

			for (let y = 0; y < 10; y++) {
				sumSecond += parseInt(cpf.charAt(y), 10) * (11 - y);
			}

			verFrist = 11 - (sumFirst % 11);
			verSecond = 11 - (sumSecond % 11);

			if(verFrist > 9) {
				verFrist = 0;
			}

			if(verSecond > 9) {
				verSecond = 0;
			}

			if (verFrist !== parseInt(cpf.charAt(9), 10) || verSecond !== parseInt(cpf.charAt(10), 10)) {
				return this.createError('string.cpf', { v: value }, state, options);
			}

			return cpf;
		}
	}]
});
/* $lab:coverage:on$ */
/* eslint-enable */

const initialDataschema = Joi.object().keys({
	user: Joi.string().alphanum().required(),
	password: Joi.string().required(),
	basePath: Joi.string().alphanum().required()
}).required();

const customerSchema = Joi.object().keys({
	id: Joi.number().optional(),
	name: Joi.string().trim().required(),
	email: Joi.string().email().required(),
	doc: customJoi.string().cpf().required(),
	phone: Joi.string().trim().replace('+', '').min(10).max(14).regex(/^[0-9]+$/, 'numbers').optional() // eslint-disable-line no-magic-numbers
});

const skuResumedSchema = Joi.object().keys({
	sku_id: Joi.number().integer().required(),
	sku_qty: Joi.number().integer().positive().min(1).required(),
	sku_price: Joi.number().positive().required()
});

const orderSchema = Joi.object().keys({
	id: Joi.number().optional(),
	datetime: Joi.date().max('now').default(Date.now, 'time of creation'),
	remark: Joi.string().trim().optional(),
	customer: customerSchema.required(),
	order_items: Joi.array().min(1).items(skuResumedSchema).required()
}).required();

module.exports = {
	initialDataschema,
	orderSchema
};
