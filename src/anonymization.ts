import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as crypto from 'crypto';

const generatePseudonym = (identifier: string): string => {
    return crypto.createHash('sha256').update(identifier).digest('hex');
};

export const anonymizationHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody: string = event.body as string;
        if (!requestBody) {
            throw new Error('Request body is empty');
        }

        const requestData = JSON.parse(requestBody);
        const anonymizedData = anonymizeData(requestData);
        return {
            statusCode: 200,
            body: JSON.stringify({ anonymizedData })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

const pseudonymRecord: { [key: string]: string } = {};

const anonymizeData = (data: any): any => {
    const identifierFields = ['firstName', 'lastName', 'email', 'phone'];

    for (const field of identifierFields) {
        if (data[field]) {
            const identifier = data[field];
            if (!pseudonymRecord[identifier]) {
                pseudonymRecord[identifier] = generatePseudonym(identifier);
            }
            data[field] = pseudonymRecord[identifier];
        }
    }

    return data;
};
