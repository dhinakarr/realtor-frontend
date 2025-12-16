export const createPayment = (data) =>
	API.post("/api/payments", data);

export const verifyPayment = (paymentId) =>
	API.patch(`/api/payments/${paymentId}/verify`);

export const getPaymentSummary = (saleId) =>
	API.get(`/api/payments/sale/${saleId}/summary`);

export const getPaymentsBySale = (saleId) =>
	API.get(`/api/payments/sale/${saleId}/list`);

export const receivePayment = (data) =>
	API.post("/api/payments", data);
