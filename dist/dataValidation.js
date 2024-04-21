"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataValidationHandler = void 0;
const dataValidationHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.dataValidationHandler = dataValidationHandler;
