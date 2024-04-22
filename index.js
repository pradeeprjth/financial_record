"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiGatewayHandler = void 0;
const dataValidation_1 = require("./src/dataValidation");
const encryptionHashing_1 = require("./src/encryptionHashing");
const riskAssessment_1 = require("./src/riskAssessment");
const storageRetrieval_1 = require("./src/storageRetrieval");
async function apiGatewayHandler(event) {
    try {
        const { httpMethod, resource, body } = event;
        console.log('Received event:', JSON.stringify(event)); // Log the received event
        console.log('HTTP Method:', httpMethod); // Log the HTTP method
        console.log('Resource:', resource); // Log the resource path
        console.log('Request Body:', body); // Log the request body
        if (httpMethod !== 'POST') {
            console.log('Method Not Allowed'); // Log method not allowed
            return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
        }
        switch (resource) {
            case '/financial_record':
                // Step 1: Data Validation
                console.log('Performing data validation'); // Log data validation step
                const validationResponse = await (0, dataValidation_1.dataValidationHandler)(event);
                console.log('Data validation response:', validationResponse); // Log data validation response
                if (validationResponse.statusCode !== 200) {
                    return validationResponse;
                }
                // Step 2: Encryption and Hashing of sensitive data
                console.log('Performing encryption and hashing'); // Log encryption and hashing step
                const encryptionHashingResponse = await (0, encryptionHashing_1.encryptionHashingHandler)(event);
                console.log('Encryption and hashing response:', encryptionHashingResponse); // Log encryption and hashing response
                if (encryptionHashingResponse.statusCode !== 200) {
                    return encryptionHashingResponse;
                }
                // Step 3: Risk Assessment, adding additional attribute riskScore
                console.log('Performing risk assessment'); // Log risk assessment step
                const riskAssessmentResponse = await (0, riskAssessment_1.riskAssessmentHandler)(event);
                console.log('Risk assessment response:', riskAssessmentResponse); // Log risk assessment response
                if (riskAssessmentResponse.statusCode !== 200) {
                    return riskAssessmentResponse;
                }
                // Merge the encrypted data and risk assessment data
                const mergedData = mergeData(encryptionHashingResponse.body, riskAssessmentResponse.body);
                console.log('Merged Data:', mergedData); // Log merged data
                // Step 4: Store the entire object in S3
                console.log('Storing data in S3'); // Log storage step
                const storageResponse = await (0, storageRetrieval_1.storageRetrievalHandler)(mergedData);
                console.log('Storage response:', storageResponse); // Log storage response
                if (storageResponse.statusCode !== 200) {
                    return storageResponse;
                }
                return storageResponse;
            default:
                console.log('Resource not found:', resource); // Log resource not found
                return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
        }
    }
    catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
}
exports.apiGatewayHandler = apiGatewayHandler;
;
// Function to merge encrypted data, risk assessment data, and risk score
// Function to merge encrypted data, risk assessment data, and risk score
const mergeData = (encryptedData, riskAssessmentData) => {
    try {
        const encryptedDataObj = JSON.parse(encryptedData);
        const riskAssessmentDataObj = JSON.parse(riskAssessmentData);
        // Extract risk score directly from riskAssessmentData
        const riskScore = riskAssessmentDataObj.riskScore;
        // Merge encrypted data, enriched data, and risk score
        const mergedData = {
            transactionId: encryptedDataObj.transactionId,
            userId: encryptedDataObj.userId,
            transactionDetails: encryptedDataObj.transactionDetails,
            userDetails: encryptedDataObj.userDetails,
            additionalInfo: encryptedDataObj.additionalInfo,
            aesKey: encryptedDataObj.aesKey,
            hash: encryptedDataObj.hash,
            riskScore: riskScore
        };
        return mergedData;
    }
    catch (error) {
        console.error('Error parsing JSON data:', error);
        throw error; // Rethrow the error
    }
};
