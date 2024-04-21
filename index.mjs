"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiGatewayHandler = void 0;
const dataValidation_1 = require("./src/dataValidation");
const encryptionHashing_1 = require("./src/encryptionHashing");
const riskAssessment_1 = require("./src/riskAssessment");
const storageRetrieval_1 = require("./src/storageRetrieval");
const apiGatewayHandler = async (event) => {
    try {
        const { httpMethod, resource, body } = event;
        if (httpMethod !== 'POST') {
            return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
        }
        switch (resource) {
            case '/financial_record':
                // Step 1: Data Validation
                const validationResponse = await (0, dataValidation_1.dataValidationHandler)(event);
                if (validationResponse.statusCode !== 200) {
                    return validationResponse;
                }
                // Step 2: Encryption and Hashing of sensitive data
                const encryptionHashingResponse = await (0, encryptionHashing_1.encryptionHashingHandler)(event);
                if (encryptionHashingResponse.statusCode !== 200) {
                    return encryptionHashingResponse;
                }
                // Step 3: Risk Assessment, adding additional attribute riskScore
                const riskAssessmentResponse = await (0, riskAssessment_1.riskAssessmentHandler)(event);
                if (riskAssessmentResponse.statusCode !== 200) {
                    return riskAssessmentResponse;
                }
                // Merge the encrypted data and risk assessment data
                const mergedData = mergeData(encryptionHashingResponse.body, riskAssessmentResponse.body);
                // Step 4: Store the entire object in S3
                const storageResponse = await (0, storageRetrieval_1.storageRetrievalHandler)(mergedData);
                if (storageResponse.statusCode !== 200) {
                    return storageResponse;
                }
                return storageResponse;
            default:
                return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
        }
    }
    catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
exports.apiGatewayHandler = apiGatewayHandler;
// Function to merge encrypted data and risk assessment data
const mergeData = (encryptedData, riskAssessmentData) => {
    // Merge the two objects into one
    const mergedData = {
        ...JSON.parse(encryptedData),
        ...JSON.parse(riskAssessmentData)
    };
    return mergedData;
};
