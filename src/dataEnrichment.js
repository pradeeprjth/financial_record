"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEnrichmentHandler = void 0;
const dataEnrichmentHandler = async (event) => {
    try {
        // Extract data from request body
        const requestData = event.body;
        // Parse the request data
        const parsedData = JSON.parse(requestData);
        // Enrich transaction data with additional information
        const enrichedData = enrichData(parsedData);
        // Return response with enriched data
        return {
            statusCode: 200,
            body: JSON.stringify({ enrichedData })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.dataEnrichmentHandler = dataEnrichmentHandler;
const enrichData = (data) => {
    // Fetch currency conversion rates based on transaction currency
    const currencyConversionRates = fetchCurrencyConversionRates(data.transactionDetails.currency);
    // Retrieve regional economic indicators based on transaction location
    const regionalEconomicIndicators = fetchRegionalEconomicIndicators(data.transactionDetails.merchantDetails.countryCode);
    // Add any other relevant information to enhance risk assessment
    const additionalInfo = {
        currencyConversionRates,
        regionalEconomicIndicators,
        transactionType: data.transactionDetails.paymentMethod === 'CreditCard' ? 'Online' : 'InStore'
    };
    // Assuming userDetails is available elsewhere in the event or data,
    // include it here. Modify this part based on where userDetails is available.
    const userDetails = data.userDetails;
    // Return the enriched data
    return {
        transactionDetails: data.transactionDetails,
        userDetails, // Include userDetails in the enriched data
        additionalInfo, // Include additionalInfo in the enriched data
        risk: data.risk // Include the risk score in the enriched data
    };
};
// Function to fetch currency conversion rates from an external API
const fetchCurrencyConversionRates = (currency) => {
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
const fetchRegionalEconomicIndicators = (countryCode) => {
    // Placeholder implementation: Simulate fetching regional economic indicators
    // You would typically make a request to an external API here
    return {
        country: countryCode,
        gdpGrowthRate: 3.2,
        inflationRate: 2.1,
        // Add more regional economic indicators as needed
    };
};
