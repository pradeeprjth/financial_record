import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const storageHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log('Received request:', event);

        if (!event) {
            console.error('Request data is missing or invalid');
            throw new Error('Request data is missing or invalid');
        }

        const requestData = event;

        console.log('Request data:', requestData);

        const storedData = await storeData(requestData);

        console.log('Data stored successfully:', storedData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Data Stored successfully',
                data: storedData,
            }),
        };
        
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

const storeData = async (data: any): Promise<string> => {
    const storedObjectKey = `data_${Date.now()}.json`;
    try {
        console.log('Storing data in S3:', data);

        await s3.upload({
            Bucket: 'financial-record',
            Key: storedObjectKey,
            Body: JSON.stringify(data),
            ContentType: 'application/json'
        }).promise();

        console.log('Data stored successfully:', storedObjectKey);

        return storedObjectKey;
    } catch (error) {
        console.error('Error storing data in S3:', error);
        throw new Error('Failed to store data in S3');
    }
};
