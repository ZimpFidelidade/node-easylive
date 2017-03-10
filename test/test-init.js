'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');

lab.describe('init', () => {

	lab.test('Should not validate data', (done) => {
		expect(lib.init).to.throw(Error, 'You need to send your credentials to initialize the module');
		expect(lib.init.bind({})).to.throw(Error, 'You need to send your credentials to initialize the module');
		expect(lib.init.bind({ user: '123' })).to.throw(Error, 'You need to send your credentials to initialize the module');
		done();
	});

	lab.test('Should validate data', (done) => {
		let libInit = lib.init({
			user: "12345",
			password: "u5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpKTS3",
			basePath: 'zimp'
		});

		expect(libInit).to.be.an.object();
		expect(libInit.env).to.be.equal('development');
		expect(libInit.rootUrl).to.be.equal('https://easylive-homolog.totalcommit.com/zimp');
		done();
	});

	lab.test('Should validate data with another env', (done) => {
		let libInit = lib.init({
			user: "12345",
			password: "u5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpKTS3",
			basePath: 'zimp'
		}, 'production');

		expect(libInit).to.be.an.object();
		expect(libInit.env).to.be.equal('production');
		expect(libInit.rootUrl).to.be.equal('https://easylive.totalcommit.com/zimp');
		done();
	});
});
