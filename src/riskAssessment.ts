import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dataEnrichmentHandler } from './dataEnrichment'; // Import the dataEnrichmentHandler

// Define types for enriched data and additional information
interface EnrichedData {
    transactionDetails: {
        currency: string;
        merchantDetails: {
            countryCode: string;
        };
        paymentMethod: string;
    };
    userDetails: any;
    additionalInfo: AdditionalInfo;
    risk: number;
}

interface AdditionalInfo {
    currencyConversionRates: any; 
    regionalEconomicIndicators: any; 
    transactionType: string;
}

// Risk assessment handler function
export const riskAssessmentHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Step 1: Enrich the data
        const enrichmentResponse = await dataEnrichmentHandler(event);
        console.log('Enrichment response:', enrichmentResponse); 
        if (enrichmentResponse.statusCode !== 200) {
            console.error('Enrichment failed with status code:', enrichmentResponse.statusCode);
            return enrichmentResponse; 
        }
        
        // Parse the response once and store it in a variable
        const parsedResponse = JSON.parse(enrichmentResponse.body);
        console.log('This is parsed response from dataEnrichmentHandler:', parsedResponse);
        const enrichedData = parsedResponse.enrichedData;
        const additionalInfo = parsedResponse.additionalInfo;

        // Step 2: Perform risk assessment based on the enriched data
        const riskScore = calculateRiskScore(enrichedData);

        // Step 3: Add the risk score and additional info to the enriched data
        enrichedData.riskScore = riskScore;
        enrichedData.additionalInfo = additionalInfo;

        console.log("LE beta yaha se check kar pehle sab sahi h ya nahi ");
        console.log('Enrichment response:',enrichedData);
        console.log(additionalInfo);
        // Return the modified enrichedData as the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                enrichedData: enrichedData, 
                additionalInfo: additionalInfo
            })
        };
    } catch (error) {
        console.error('Error in riskAssessmentHandler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' })
        };
    }
};

// Function to calculate risk score based on various factors
const calculateRiskScore = (data: any): number => {
    let riskScore = 0;

    // Example: Increase risk score for high transaction amounts
    if (data.transactionDetails.amount > 1000) {
        riskScore += 10;
    }

    // Example: Increase risk score for transactions from certain countries
    riskScore += calculateRiskFromCountries(data.userDetails.billingAddress.country);

    // Example: Increase risk score based on transaction frequency
    riskScore += calculateRiskFromTransactionFrequency(data.userDetails.userId);

    // Example: Increase risk score based on past transaction behavior
    riskScore += calculateRiskFromPastTransactions(getTransactionHistory(data.userDetails.userId));

    return riskScore;
};

//  function to calculate risk based on countries
const calculateRiskFromCountries = (country: string): number => {
    if (!country) return 0; 
    const riskyCountries = ['Nigeria', 'Russia', 'China'];
    return riskyCountries.includes(country) ? 20 : 0;
};

//  function to calculate risk based on transaction frequency
const calculateRiskFromTransactionFrequency = (userId: string): number => {
    const transactionHistory = getTransactionHistory(userId);
    const transactionFrequency = transactionHistory.length;
    if (transactionFrequency > 10) {
        return 15;
    } else if (transactionFrequency > 5) {
        return 10;
    }
    return 0;
};

//  function to calculate risk based on past transaction behavior
const calculateRiskFromPastTransactions = (transactionHistory: any[]): number => {
    let suspiciousTransactionCount = 0;
    for (const transaction of transactionHistory) {
        if (transaction.amount > 2000) {
            suspiciousTransactionCount++;
        }
        // Increase risk score for transactions with unusual behavior
        if (transaction.country === 'Nigeria' || transaction.country === 'Russia') {
            suspiciousTransactionCount += 2;
        }
    }
    return suspiciousTransactionCount * 5; 
};

//  function to retrieve transaction history from a database or external service
const getTransactionHistory = (userId: string): any[] => {
    return [
        { amount: 500, country: 'USA' },
        { amount: 1200, country: 'Nigeria' },
        { amount: 800, country: 'Russia' },
    ];
};
