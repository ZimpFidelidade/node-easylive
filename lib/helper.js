'use strict';

const Joi = require('joi');
const Schemas = require('./schemas');

var errorAPI = {

	initialDataschema: Schemas.initialDataschema,
	orderSchema: Schemas.orderSchema,

	errorObj: {
		main: {
			0: 'Request Error',
			missingCredentials: 'You need to send your credentials to initialize the module'
		},

		products: {
			missingProductId: 'You need to send the product ID',
			missingSkuId: 'You need to send the sku ID',
			'single-404': 'This product doesn\'t exist',
			'sku-404': 'This sku doesn\'t exist'
		},

		order: {
			missingOrderId: 'You need to send the order ID',
			'order-404': 'This order doesn\'t exist',
			'order-422': 'This order doesn\'t exist'
		},

		validation: {
			invalidOrderObj: 'Invalid orderObj'
		}
	},

	errorHandler(section, code, errorResponse, throwError) {
		var returnedError = { success: false },
			message = 'Error Unknow';

		if(errorAPI.errorObj[section][code]) {
			message = errorAPI.errorObj[section][code];
		}

		returnedError.code = code;
		returnedError.message = message;

		if(errorResponse) {
			if(errorResponse.errorResponse) {
				delete errorResponse.errorResponse;
			}

			delete errorResponse.isJoi;
			delete errorResponse.annotate;
			delete errorResponse._object; // eslint-disable-line no-underscore-dangle
			delete errorResponse.details;
			returnedError.errorResponse = errorResponse;
		}

		if(throwError) {
			throw Error(returnedError.message);
		}

		return Promise.reject(returnedError);
	},

	formatPrice(priceString) {
		return parseFloat(priceString.replace('.', '').replace(',', '.'));
	},

	createCategoriesList(categoryObj, categoriesArray) {
		if(!categoryObj.parent_category) {
			return categoriesArray;
		}

		categoriesArray.push(categoryObj.parent_category);
		return this.createCategoriesList(categoryObj.parent_category, categoriesArray);
	},

	formatProducts(productsList) {
		(productsList || []).forEach((thisProduct, index) => {
			delete productsList[index].custom_order;

			if(thisProduct.product_id) {
				productsList[index].id = thisProduct.product_id;
				delete productsList[index].product_id;
			}

			// Foi reportado a inconsistencia para a Easylive, porem foi tratado como não-erro
			if(thisProduct.is_highlight === null) {
				productsList[index].is_highlight = false;
			}

			// Foi reportado a inconsistencia para a Easylive, porem foi tratado como não-erro
			if(thisProduct.is_digital === null) {
				productsList[index].is_digital = false;
			}

			if(thisProduct.selling_start_date && thisProduct.selling_start_date !== null) {
				productsList[index].selling_start_date = new Date(thisProduct.selling_start_date);
			}

			if(thisProduct.selling_end_date && thisProduct.selling_end_date !== null) {
				productsList[index].selling_end_date = new Date(thisProduct.selling_end_date);
			}

			productsList[index].categoriesList = this
				.createCategoriesList(thisProduct.category, [ thisProduct.category ]);

			if(thisProduct.min_selling_price) {
				productsList[index].min_selling_price = this
					.formatPrice(thisProduct.min_selling_price);
			}

			if(thisProduct.regras) {
				// Foi reportado a inconsistencia para a Easylive, porem foi tratado como não-erro
				if(
					thisProduct.regras.regrasimportantes !== undefined && // eslint-disable-line operator-linebreak
					(
						thisProduct.regras.regrasimportantes === null || // eslint-disable-line operator-linebreak
						thisProduct.regras.regrasimportantes === 'null'
					)
				) {
					productsList[index].regras.regrasimportantes = '';
				}

				// Foi reportado a inconsistencia para a Easylive, porem foi tratado como não-erro
				if(
					thisProduct.regras.comousar !== undefined && // eslint-disable-line operator-linebreak
					(
						thisProduct.regras.comousar === null || // eslint-disable-line operator-linebreak
						thisProduct.regras.comousar === 'null'
					)
				) {
					productsList[index].regras.comousar = '';
				}
			}

			if(thisProduct.skus) {
				productsList[index].skus = this.formatSku(thisProduct.skus);
			}
		});

		return productsList;
	},

	formatSku(skuList) {
		skuList.forEach((thisSku, skuIndex) => {
			if(thisSku.selling_start_date !== null) {
				skuList[skuIndex].selling_start_date = new Date(thisSku.selling_start_date);
			}

			if(thisSku.selling_end_date !== null) {
				skuList[skuIndex].selling_end_date = new Date(thisSku.selling_end_date);
			}

			if(thisSku.event_date !== null) {
				skuList[skuIndex].event_date = new Date(thisSku.event_date);
			}

			skuList[skuIndex].list_price = this.formatPrice(thisSku.list_price);
			skuList[skuIndex].price = this.formatPrice(thisSku.price);
		});

		return skuList;
	},

	cleanInactiveProducts(productsList) {
		let newList = [];
		let dateNow = Date.now();

		(productsList || []).forEach((thisProduct, index) => {
			let isValid = true;
			let startDateDate = new Date(thisProduct.selling_start_date);
			let endDateDate = new Date(thisProduct.selling_end_date);

			if(startDateDate !== null && dateNow < startDateDate) {
				isValid = false;
			}

			if(endDateDate !== null && dateNow > endDateDate) {
				isValid = false;
			}

			thisProduct.skus.forEach((thisSku, skuIndex) => {
				let isSkuValid = true;
				let skuStartDateDate = new Date(thisSku.selling_start_date);
				let skuEndDateDate = new Date(thisSku.selling_end_date);
				let skuEventDateDate = new Date(thisSku.event_date);

				if(skuStartDateDate !== null && dateNow < skuStartDateDate) {
					isSkuValid = false;
				}

				if(skuEndDateDate !== null && dateNow > skuEndDateDate) {
					isSkuValid = false;
				}

				if(skuEventDateDate !== null && dateNow > skuEventDateDate) {
					isSkuValid = false;
				}

				if(!thisSku.active || !thisSku.stock || !thisSku.availability) {
					isSkuValid = false;
				}

				if(!isSkuValid) {
					thisProduct.skus.splice(skuIndex, 1);
				}
			});

			if(!thisProduct.skus.length) {
				isValid = false;
			}

			if(isValid) {
				newList.push(thisProduct);
			}
		});

		return newList;
	},

	validateOrderObj(objToValidate) {
		if(!objToValidate) {
			return this.errorHandler('validation', 'missingOrderObj');
		}

		objToValidate = Joi.validate(objToValidate, this.orderSchema);
		if(objToValidate.error) {
			return this.errorHandler('validation', 'invalidOrderObj', objToValidate.error);
		}

		objToValidate.value.datetime = objToValidate.value.datetime.toISOString().replace('Z', '') + '-03:00'; // eslint-disable-line prefer-template

		return Promise.resolve(objToValidate.value);
	},

	formatOrderObj(orderObj) {
		let orderItemsArray = [];

		if(!Array.isArray(orderObj.skus)) {
			orderObj.skus = [ orderObj.skus ];
		}

		orderObj.skus.forEach((thisSku) => {
			if(!thisSku) {
				return;
			}

			orderItemsArray.push({
				sku_id: thisSku.id,
				sku_qty: thisSku.qtd,
				sku_price: thisSku.price
			});
		});

		orderObj.order_items = orderItemsArray;
		delete orderObj.skus;

		return orderObj;
	}

};

module.exports = errorAPI;
