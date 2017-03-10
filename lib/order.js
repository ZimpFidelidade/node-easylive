'use strict';

var Order = {

	createOrder(orderObj) {
		return Promise.resolve()
			.then(() => {
				return this.formatOrderObj(orderObj);
			})
			.then((formatedObj) => {
				return this.validateOrderObj(formatedObj)
			})
			.then((objToPost) => {
				return this.sendRequest('POST', '/orders', objToPost);
			})
			.catch((errorResponse) => {
				console.log(errorResponse);
				errorResponse = errorResponse.errorResponse;
				return this.errorHandler('order', `order-${errorResponse.statusCode}`, errorResponse);
			});
	},

	cancelOrder(orderId) {
		if(!orderId) {
			return this.errorHandler('order', 'missingOrderId');
		}

		return this.sendRequest('PUT', `/orders/${orderId}/cancel`)
			.catch((errorResponse) => {
				errorResponse = errorResponse.errorResponse;
				return this.errorHandler('order', `order-${errorResponse.statusCode}`, errorResponse);
			});
	},

	getOrder(orderId) {
		if(!orderId) {
			return this.errorHandler('order', 'missingOrderId');
		}

		return this.sendRequest('GET', `/orders/${orderId}.json`)
			.catch((errorResponse) => {
				errorResponse = errorResponse.errorResponse;
				return this.errorHandler('order', `order-${errorResponse.statusCode}`, errorResponse);
			});
	},

	resendOrderEmail(orderId) {
		if(!orderId) {
			return this.errorHandler('order', 'missingOrderId');
		}

		return this.sendRequest('GET', `/orders/${orderId}/resend_email`)
			.catch((errorResponse) => {
				errorResponse = errorResponse.errorResponse;
				return this.errorHandler('order', `order-${errorResponse.statusCode}`, errorResponse);
			});
	},

};

module.exports = Order;
