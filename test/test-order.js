'use strict';

require('dotenv').load();

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');

lab.describe('order', { timeout: 0 }, () => {
	let libInit;

	lab.beforeEach((done) => {
		libInit = lib.init({
			user: process.env.EASYLIVE_USER,
			password: process.env.EASYLIVE_PASSWORD,
			basePath: process.env.EASYLIVE_PATH
		}, 'development');
		done();
	});

});
