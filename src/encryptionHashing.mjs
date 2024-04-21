"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionHashingHandler = void 0;
const anonymization_1 = require("./anonymization");
const encryptionHashingHandler = async (event) => {
    try {
        // Parse the request body as JSON
        const requestBody = JSON.parse(event.body || '');
        // Anonymize sensitive user data
        const anonymizedData = await (0, anonymization_1.anonymizationHandler)(event);
        // Parse the anonymized response body
        const anonymizedBody = JSON.parse(anonymizedData.body);
        // Return response with modified data
        return {
            statusCode: 200,
            body: JSON.stringify({ ...requestBody, userDetails: anonymizedBody.anonymizedData })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.encryptionHashingHandler = encryptionHashingHandler;
