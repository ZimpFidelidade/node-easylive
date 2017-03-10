'use strict';

require('dotenv').load();

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');

const skuValidation = function(skuObj) {
	expect(skuObj).to.be.an.object();
	expect(skuObj.id).to.be.an.number();
	expect(skuObj.title).to.be.an.string();
	expect(skuObj.availability).to.be.an.boolean();
	expect(skuObj.active).to.be.an.boolean();
	expect(skuObj.stock).to.be.an.number();

	expect(skuObj.selling_start_date).to.satisfy((value) => {
		return value === null || value instanceof Date;
	});

	expect(skuObj.selling_end_date).to.satisfy((value) => {
		return value === null || value instanceof Date;
	});

	expect(skuObj.event_date).to.satisfy((value) => {
		return value === null || value instanceof Date;
	});

	expect(skuObj.list_price).to.be.an.number();
	expect(skuObj.price).to.be.an.number();
}

const productValidation = function(productObj) {
	expect(productObj).to.be.an.object();

	expect(productObj.id).to.be.an.number();
	expect(productObj.title).to.be.an.string();
	expect(productObj.summary).to.be.an.string();

	expect(productObj.city).to.be.an.string();
	expect(productObj.state).to.be.an.string().and.satisfy((value) => {
		return value.length === 2 || value === '';
	});

	expect(productObj.tags).to.be.an.array();
	expect(productObj.location).to.be.an.string();
	expect(productObj.selling_start_date).to.satisfy((value) => {
		return value === null || value instanceof Date;
	});

	expect(productObj.selling_end_date).to.satisfy((value) => {
		return value === null || value instanceof Date;
	});

	expect(productObj.min_selling_price).to.be.an.number();
	expect(productObj.category).to.be.an.object();
	expect(productObj.category.id).to.be.an.number();
	expect(productObj.category.name).to.be.an.string();

	if(productObj.category.parent_category) {
		expect(productObj.category.parent_category).to.be.an.object();
		expect(productObj.category.parent_category.id).to.be.an.number();
		expect(productObj.category.parent_category.name).to.be.an.string();
	}

	expect(productObj.images).to.be.an.array();
	productObj.images.forEach((thisImageObj) => {
		expect(thisImageObj).to.only.include(['url']);
		expect(thisImageObj.url).to.be.an.string();
	});

	expect(productObj.is_highlight).to.be.an.boolean();
	expect(productObj.is_digital).to.be.an.boolean();
	expect(productObj.url_easylive).to.be.an.string();

	expect(productObj.regras).to.be.an.object();
	expect(productObj.regras.regrasimportantes).to.be.an.string();
	expect(productObj.regras.comousar).to.be.an.string();

	expect(productObj.categoriesList).to.be.an.array();
	productObj.categoriesList.forEach((thisCategoryObj) => {
		expect(thisCategoryObj).to.be.an.object();
		expect(thisCategoryObj.id).to.be.an.number();
		expect(thisCategoryObj.name).to.be.an.string();

		if(thisCategoryObj.parent_category) {
			expect(thisCategoryObj.parent_category).to.be.an.object();
			expect(thisCategoryObj.parent_category.id).to.be.an.number();
			expect(thisCategoryObj.parent_category.name).to.be.an.string();
		}
	});

	expect(productObj.skus).to.be.an.array();
	productObj.skus.forEach((thisSkuObj) => {
		skuValidation(thisSkuObj);
	});

}

lab.describe('products', { timeout: 0 }, () => {
	let libInit;

	lab.beforeEach((done) => {
		libInit = lib.init({
			user: process.env.EASYLIVE_USER,
			password: process.env.EASYLIVE_PASSWORD,
			basePath: process.env.EASYLIVE_PATH
		}, 'development');
		done();
	});

	lab.test('getProducts', (done) => {
		libInit.getProducts()
			.then((products) => {
				expect(products).to.be.an.array();
				products.forEach((thisProduct) => {
					productValidation(thisProduct);
				});

				done();
			});
	});

	lab.test('getProduct', (done) => {
		libInit.getProduct(2562)
			.then((thisProduct) => {
				productValidation(thisProduct);
				done();
			});
	});

	lab.test('getSku', (done) => {
		libInit.getSku(2768)
			.then((thisSku) => {
				skuValidation(thisSku);
				done();
			});
	});

	lab.test('getMostSold', (done) => {
		libInit.getMostSold()
			.then((products) => {
				expect(products).to.be.an.array();

				products.forEach((thisProduct) => {
					expect(thisProduct).to.be.an.object();

					expect(thisProduct.id).to.be.an.number();
					expect(thisProduct.title).to.be.an.string();
					expect(thisProduct.summary).to.be.an.string();

					expect(thisProduct.city).to.be.an.string();
					expect(thisProduct.state).to.be.an.string().and.satisfy((value) => {
						return value.length === 2 || value === '';
					});

					expect(thisProduct.location).to.be.an.string();
					expect(thisProduct.image_url).to.be.an.string();

					expect(thisProduct.category).to.be.an.object();
					expect(thisProduct.category.id).to.be.an.number();
					expect(thisProduct.category.name).to.be.an.string();

					if(thisProduct.category.parent_category) {
						expect(thisProduct.category.parent_category).to.be.an.object();
						expect(thisProduct.category.parent_category.id).to.be.an.number();
						expect(thisProduct.category.parent_category.name).to.be.an.string();
					}

					expect(thisProduct.categoriesList).to.be.an.array();
					thisProduct.categoriesList.forEach((thisCategoryObj) => {
						expect(thisCategoryObj).to.be.an.object();
						expect(thisCategoryObj.id).to.be.an.number();
						expect(thisCategoryObj.name).to.be.an.string();

						if(thisCategoryObj.parent_category) {
							expect(thisCategoryObj.parent_category).to.be.an.object();
							expect(thisCategoryObj.parent_category.id).to.be.an.number();
							expect(thisCategoryObj.parent_category.name).to.be.an.string();
						}
					});
				});

				done();
			});
	});

	lab.test('getBillBoard', (done) => {
		libInit.getBillBoard()
			.then((billBoard) => {
				expect(billBoard).to.be.an.array();
				billBoard.forEach((thisBillBoardItem) => {
					expect(thisBillBoardItem.product_id).to.be.an.number();
					expect(thisBillBoardItem.image_url).to.be.an.string();
					expect(thisBillBoardItem.order).to.be.an.number();
				});
				done();
			});
	});

});
