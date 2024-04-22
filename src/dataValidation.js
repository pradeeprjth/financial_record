"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataValidationHandler = void 0;
const dataValidationHandler = async (event) => {
    try {
        let requestData;
        if (typeof event.body === 'string' && event.body.trim() !== '') {
            requestData = JSON.parse(event.body);
        }
        else {
            throw new Error('Request body is empty');
        }
        // Validate structure of request data
        if (!requestData.transactionId || !requestData.userId || !requestData.transactionDetails || !requestData.userDetails) {
            throw new Error('Missing required fields');
        }
        const { transactionDetails, userDetails } = requestData;
        // Validate transaction details
        if (!transactionDetails.amount || !transactionDetails.currency || !transactionDetails.transactionDate) {
            throw new Error('Invalid transaction details');
        }
        // Validate user details
        if (!userDetails.firstName || !userDetails.lastName || !userDetails.email || !userDetails.phone || !userDetails.billingAddress) {
            throw new Error('Invalid user details');
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data is valid' })
        };
    }
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        };
    }
};
exports.dataValidationHandler = dataValidationHandler;
