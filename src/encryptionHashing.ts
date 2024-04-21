import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { anonymizationHandler } from './anonymization';

export const encryptionHashingHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the request body as JSON
        const requestBody = JSON.parse(event.body || '');

        // Anonymize sensitive user data
        const anonymizedData = await anonymizationHandler(event);

        // Parse the anonymized response body
        const anonymizedBody = JSON.parse(anonymizedData.body);

        // Return response with modified data
        return {
            statusCode: 200,
            body: JSON.stringify({ ...requestBody, userDetails: anonymizedBody.anonymizedData })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
