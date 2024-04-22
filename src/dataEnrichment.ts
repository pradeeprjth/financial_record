import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// Define types for enriched data and additional information
interface EnrichedData {
    transactionDetails: {
        currency: string;
        merchantDetails: {
            countryCode: string;
        };
        paymentMethod: string;
    };
    userDetails: any; // Define the type for userDetails
    additionalInfo: AdditionalInfo;
    risk: number;
}

interface AdditionalInfo {
    currencyConversionRates: any; 
    regionalEconomicIndicators: any; 
    transactionType: string;
}

export const dataEnrichmentHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Extract data from request body
        const requestData: string = event.body as string;

        // Parse the request data
        const parsedData: any = JSON.parse(requestData);

        // Enrich transaction data with additional information
        const enrichedData: EnrichedData = enrichData(parsedData);

        // Return response with enriched data, including enrichedData and additionalInfo properties
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                enrichedData: enrichedData, 
                additionalInfo: enrichedData.additionalInfo
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

const enrichData = (data: any): EnrichedData => {
    // Fetch currency conversion rates based on transaction currency
    const currencyConversionRates = fetchCurrencyConversionRates(data.transactionDetails.currency);

    // Retrieve regional economic indicators based on transaction location
    const regionalEconomicIndicators = fetchRegionalEconomicIndicators(data.transactionDetails.merchantDetails.countryCode);

    // Add any other relevant information to enhance risk assessment
    const additionalInfo: AdditionalInfo = {
        currencyConversionRates: currencyConversionRates,
        regionalEconomicIndicators: regionalEconomicIndicators,
        transactionType: data.transactionDetails.paymentMethod === 'CreditCard' ? 'Online' : 'InStore'
    };

    // Assuming userDetails is available elsewhere in the event or data,
    // include it here. Modify this part based on where userDetails is available.
    const userDetails = data.userDetails;

    // Return the enriched data
    return {
        transactionDetails: data.transactionDetails,
        userDetails: userDetails, // Include userDetails in the enriched data
        additionalInfo: additionalInfo, // Include additionalInfo in the enriched data
        risk: data.risk // Include the risk score in the enriched data
    };
}

// Function to fetch currency conversion rates from an external API
const fetchCurrencyConversionRates = (currency: string): any => {
    // Placeholder implementation: Simulate fetching currency conversion rates
    // You would typically make a request to an external API here
    return {
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.72
        // Add more currency conversion rates as needed
    };
};

// Function to fetch regional economic indicators from an external API
const fetchRegionalEconomicIndicators = (countryCode: string): any => {
    // Placeholder implementation: Simulate fetching regional economic indicators
    // You would typically make a request to an external API here
    return {
        country: countryCode,
        gdpGrowthRate: 3.2,
        inflationRate: 2.1,
        // Add more regional economic indicators as needed
    };
};
