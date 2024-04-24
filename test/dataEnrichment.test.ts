import { APIGatewayEvent, APIGatewayProxyEventBase } from 'aws-lambda';
import { dataEnrichmentHandler } from '../src/dataEnrichment';

describe('dataEnrichmentHandler', () => {
    const mockEvent: APIGatewayEvent & APIGatewayProxyEventBase<any> = {
        httpMethod: 'POST',
        body: JSON.stringify({
            transactionDetails: {
                currency: 'USD',
                merchantDetails: {
                    countryCode: 'US'
                },
                paymentMethod: 'In-Store'
            },
            userDetails: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890'
            },
            risk: 5
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

    it('should enrich data in the request body and return 200 status code with enriched data and additional info', async () => {
        const response = await dataEnrichmentHandler(mockEvent);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();

        const responseBody = JSON.parse(response.body);
        expect(responseBody.enrichedData).toBeDefined();
        expect(responseBody.additionalInfo).toBeDefined();
        // Add more specific assertions for enriched data and additional info if needed
    });

    it('should return 500 status code and error message if request body is empty', async () => {
        const emptyEvent: APIGatewayEvent = {
            ...mockEvent,
            body: null
        };

        const response = await dataEnrichmentHandler(emptyEvent);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBeDefined();

        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Internal server error');
    });

    it('should return 500 status code and error message if request body is invalid JSON', async () => {
        const invalidJsonEvent: APIGatewayEvent = {
            ...mockEvent,
            body: 'invalid JSON'
        };

        const response = await dataEnrichmentHandler(invalidJsonEvent);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBeDefined();

        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Internal server error');
    });

    // Add more test cases as needed
});
