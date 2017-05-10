'use strict';

var Products = {

	getProducts() {
		return this.sendRequest('GET', '/products.json')
			.then((productsList) => {
				return this.formatProducts(productsList);
			});
	},

	getMostSold() {
		return this.sendRequest('GET', '/products/most_sold.json')
			.then((productsList) => {
				return this.formatProducts(productsList);
			});
	},

	getBillBoard() {
		return this.sendRequest('GET', '/products/billboard.json');
	},

	getProduct(productId) {
		if(!productId) {
			return this.errorHandler('products', 'missingProductId');
		}

		return this.sendRequest('GET', `/products/${productId}.json`)
			.then((productObj) => {
				return this.formatProducts([ productObj ]);
			})
			.then((formatedProducts) => {
				return formatedProducts[0];
			})
			.catch((errorResponse) => {
				if(errorResponse.response) {
					errorResponse = errorResponse.response;
				}

				if(errorResponse.errorResponse) {
					errorResponse = errorResponse.errorResponse;
				}

				return this.errorHandler('products', `single-${errorResponse.statusCode}`, errorResponse);
			});
	},

	getSku(skuId) {
		if(!skuId) {
			return this.errorHandler('products', 'missingSkuId');
		}

		return this.sendRequest('GET', `/products/sku/${skuId}.json`)
			.then((skuObj) => {
				return this.formatSku([ skuObj ]);
			})
			.then((skuFormated) => {
				return skuFormated[0];
			})
			.catch((errorResponse) => {
				if(errorResponse.response) {
					errorResponse = errorResponse.response;
				}

				if(errorResponse.errorResponse) {
					errorResponse = errorResponse.errorResponse;
				}

				return this.errorHandler('products', `sku-${errorResponse.statusCode}`, errorResponse);
			});
	}

};

module.exports = Products;
