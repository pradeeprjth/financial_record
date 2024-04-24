import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();


export const retrieveHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log('Received request:', event);

        // Extract object key from the query parameters
        const objectKey = event.queryStringParameters?.objectKey;

        if (!objectKey) {
            console.log('Object key not provided.');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Object key not provided' }),
            };
        }

        // Fetch encrypted data from S3
        const s3Params = {
            Bucket: 'financial-record', 
            Key: objectKey,
        };

        const s3Data = await s3.getObject(s3Params).promise();

        // Check if s3Data.Body exists
        if (!s3Data.Body) {
            console.log('No data found in S3.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'No data found in S3' }),
            };
        }

        const encryptedDataObj = JSON.parse(s3Data.Body.toString('utf-8'));
        console.log('Encrypted data:', encryptedDataObj);


        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Data retrieved successfully',
                data: encryptedDataObj,
            }),
        };
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
