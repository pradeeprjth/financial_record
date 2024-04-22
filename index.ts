import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dataValidationHandler } from './src/dataValidation';
import { encryptionHashingHandler } from './src/encryptionHashing';
import { riskAssessmentHandler } from './src/riskAssessment';
import { storageRetrievalHandler } from './src/storageRetrieval';

export async function apiGatewayHandler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {

    try {
        const { httpMethod, resource, body } = event;

        if (httpMethod !== 'POST') {
            console.log('Method Not Allowed'); // Log method not allowed
            return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
        }

        switch (resource) {
            case '/financial_record':
                // Step 1: Data Validation
                const validationResponse = await dataValidationHandler(event);
                console.log('Data validation response:', validationResponse); // Log data validation response

                if (validationResponse.statusCode !== 200) {
                    return validationResponse;
                }

                // Step 2: Encryption and Hashing of sensitive data
                const encryptionHashingResponse = await encryptionHashingHandler(event);
                console.log('Encryption and hashing response:', encryptionHashingResponse); // Log encryption and hashing response

                if (encryptionHashingResponse.statusCode !== 200) {
                    return encryptionHashingResponse;
                }

                // Step 3: Risk Assessment, adding additional attribute riskScore
                const riskAssessmentResponse = await riskAssessmentHandler(event);
                console.log('Risk assessment response:', riskAssessmentResponse); // Log risk assessment response

                if (riskAssessmentResponse.statusCode !== 200) {
                    return riskAssessmentResponse;
                }

                // Merge the encrypted data and risk assessment data
                const mergedData = mergeData(encryptionHashingResponse.body, riskAssessmentResponse.body);
                console.log('Merged Data:', mergedData); // Log merged data

                // Step 4: Store the entire object in S3
                console.log('Storing data in S3'); // Log storage step
                const storageResponse = await storageRetrievalHandler(mergedData);
                console.log('Storage response:', storageResponse); // Log storage response

                if (storageResponse.statusCode !== 200) {
                    return storageResponse;
                }

                return storageResponse;

            default:
                console.log('Resource not found:', resource); // Log resource not found
                return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
        }
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

// Function to merge encrypted data, risk assessment data, and risk score
const mergeData = (encryptedData: string, riskAssessmentData: string): any => {
    try {
        console.log('Encrypted data:', encryptedData);
        console.log('Risk assessment data:', riskAssessmentData);

        const encryptedDataObj = JSON.parse(encryptedData);
        const riskAssessmentDataObj = JSON.parse(riskAssessmentData);

        console.log('Parsed encrypted data:', encryptedDataObj);
        console.log('Parsed risk assessment data:', riskAssessmentDataObj);

        // Extract risk score from riskAssessmentDataObj's enrichedData
        const riskScore = riskAssessmentDataObj.enrichedData.riskScore;

        // Merge encrypted data, enriched data, and risk score
        const mergedData = {
            transactionId: encryptedDataObj.transactionId,
            userId: encryptedDataObj.userId,
            transactionDetails: encryptedDataObj.transactionDetails,
            userDetails: encryptedDataObj.userDetails,
            additionalInfo: riskAssessmentDataObj.additionalInfo,
            aesKey: encryptedDataObj.aesKey,
            hash: encryptedDataObj.hash,
            riskScore: riskScore 
        };

        return mergedData;
    } catch (error) {
        console.error('Error parsing JSON data:', error);
        throw error; // Rethrow the error
    }
};
