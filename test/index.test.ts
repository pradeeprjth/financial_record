import { APIGatewayEvent } from 'aws-lambda';
import { apiGatewayHandler } from '../index';
import { dataValidationHandler } from '../src/dataValidation';
import { encryptionHashingHandler } from '../src/encryptionHashing';
import { riskAssessmentHandler } from '../src/riskAssessment';
import { storageHandler } from '../src/storage';
import { retrieveHandler } from '../src/retrieve';

// Mock dependencies
jest.mock('../src/dataValidation');
jest.mock('../src/encryptionHashing');
jest.mock('../src/riskAssessment');
jest.mock('../src/storage');
jest.mock('../src/retrieve');

describe('apiGatewayHandler', () => {
    let mockEvent: APIGatewayEvent;

    beforeEach(() => {
        // Mock event object
        mockEvent = {
            httpMethod: 'POST',
            resource: '/financial_record',
            body: '{"transactionId":"123","userId":"456","transactionDetails":"details","userDetails":"user"}'
        } as APIGatewayEvent;
    });

    it('should handle GET request and return retrieve data response', async () => {
        mockEvent.httpMethod = 'GET';
        const mockRetrieveDataResponse = { statusCode: 200, body: '{}' };

        (retrieveHandler as jest.MockedFunction<typeof retrieveHandler>).mockResolvedValue(mockRetrieveDataResponse);

        const response = await apiGatewayHandler(mockEvent);

        expect(response).toEqual(mockRetrieveDataResponse);
    });

    it('should handle unsupported method and return Method Not Allowed error', async () => {
        mockEvent.httpMethod = 'PUT';

        const response = await apiGatewayHandler(mockEvent);

        expect(response.statusCode).toEqual(405);
        expect(response.body).toEqual('{"error":"Method Not Allowed"}');
    });

    it('should handle unsupported resource and return Not Found error', async () => {
        mockEvent.resource = '/other_resource';

        const response = await apiGatewayHandler(mockEvent);

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual('{"error":"Not Found"}');
    });

    it('should handle internal server error and return Internal Server Error response', async () => {
        (dataValidationHandler as jest.MockedFunction<typeof dataValidationHandler>).mockRejectedValue(new Error('Validation error'));

        const response = await apiGatewayHandler(mockEvent);

        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual('{"error":"Internal Server Error"}');
    });
});
