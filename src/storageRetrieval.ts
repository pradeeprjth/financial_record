import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const storageRetrievalHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        let requestData;
        if (typeof event.body === 'string' && event.body.trim() !== '') {
            requestData = JSON.parse(event.body);
        } else {
            throw new Error('Request body is empty');
        }
        const storedData = await storeData(requestData);
        return {
            statusCode: 200,
            body: JSON.stringify({ storedData })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};


const storeData = async (data: any): Promise<string> => {
    const storedObjectKey = `data_${Date.now()}.json`;
    try {
        await s3
            .upload({
                Bucket: 'financial_record',
                Key: storedObjectKey,
                Body: JSON.stringify(data),
                ContentType: 'application/json'
            })
            .promise();
        return storedObjectKey;
    } catch (error) {
        console.error('Error storing data in S3:', error);
        throw new Error('Failed to store data in S3');
    }
};
