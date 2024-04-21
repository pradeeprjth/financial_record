import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dataValidationHandler } from './src/dataValidation';
import { encryptionHashingHandler } from './src/encryptionHashing';
import { riskAssessmentHandler } from './src/riskAssessment';
import { storageRetrievalHandler } from './src/storageRetrieval';

export const apiGatewayHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { httpMethod, resource, body } = event;

        if (httpMethod !== 'POST') {
            return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
        }

        switch (resource) {
            case '/financial_record':
                // Step 1: Data Validation
                const validationResponse = await dataValidationHandler(event);
                if (validationResponse.statusCode !== 200) {
                    return validationResponse;
                }

                // Step 2: Encryption and Hashing of sensitive data
                const encryptionHashingResponse = await encryptionHashingHandler(event);
                if (encryptionHashingResponse.statusCode !== 200) {
                    return encryptionHashingResponse;
                }

                // Step 3: Risk Assessment, adding additional attribute riskScore
                const riskAssessmentResponse = await riskAssessmentHandler(event);
                if (riskAssessmentResponse.statusCode !== 200) {
                    return riskAssessmentResponse;
                }

                // Merge the encrypted data and risk assessment data
                const mergedData = mergeData(encryptionHashingResponse.body, riskAssessmentResponse.body);

                // Step 4: Store the entire object in S3
                const storageResponse = await storageRetrievalHandler(mergedData);
                if (storageResponse.statusCode !== 200) {
                    return storageResponse;
                }

                return storageResponse;

            default:
                return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
        }
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

// Function to merge encrypted data and risk assessment data
const mergeData = (encryptedData: any, riskAssessmentData: any): any => {
    // Merge the two objects into one
    const mergedData = {
        ...JSON.parse(encryptedData),
        ...JSON.parse(riskAssessmentData)
    };

    return mergedData;
};