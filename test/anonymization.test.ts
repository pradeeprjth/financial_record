import { APIGatewayEvent, APIGatewayProxyEventBase } from 'aws-lambda';
import { anonymizationHandler } from '../src/anonymization';

describe('anonymizationHandler', () => {
    const mockEvent: APIGatewayEvent & APIGatewayProxyEventBase<any> = {
        httpMethod: 'POST',
        body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '1234567890'
        }),
        queryStringParameters: {},
        pathParameters: {},
        headers: {},
        multiValueHeaders: {},
        isBase64Encoded: false,
        requestContext: {} as any,
        resource: '',
        path: '', 
        multiValueQueryStringParameters: {}, 
        stageVariables: {} 
    };

    it('should anonymize data in the request body and return 200 status code', async () => {
        const response = await anonymizationHandler(mockEvent);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();

        const responseBody = JSON.parse(response.body);
        expect(responseBody.anonymizedData.firstName).not.toBe('John');
        expect(responseBody.anonymizedData.lastName).not.toBe('Doe');
        expect(responseBody.anonymizedData.email).not.toBe('john.doe@example.com');
        expect(responseBody.anonymizedData.phone).not.toBe('1234567890');
    });

    it('should return 500 status code and error message if request body is empty', async () => {
        const emptyEvent: APIGatewayEvent & APIGatewayProxyEventBase<any> = {
            ...mockEvent,
            body: null 
        };

        const response = await anonymizationHandler(emptyEvent);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBeDefined();

        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Internal server error');
    });

});
