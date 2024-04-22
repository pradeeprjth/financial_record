import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dataEnrichmentHandler } from './dataEnrichment'; // Import the dataEnrichmentHandler

export const riskAssessmentHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Step 1: Enrich the data
        const enrichmentResponse = await dataEnrichmentHandler(event);
        console.log('Enrichment response:', enrichmentResponse); // Log enrichment response
        if (enrichmentResponse.statusCode !== 200) {
            console.error('Enrichment failed with status code:', enrichmentResponse.statusCode);
            return enrichmentResponse; // Return if enrichment failed
        }
        
        // Extract enriched data from the response
        const enrichedData = JSON.parse(enrichmentResponse.body).enrichedData;
        console.log('Enriched data:', enrichedData); // Log enriched data

        // Step 2: Perform risk assessment based on the enriched data
        const riskScore = calculateRiskScore(enrichedData);
        console.log('Risk score:', riskScore); // Log risk score

        // Step 3: Add the risk score and additional info to the enriched data
        enrichedData.riskScore = riskScore;
        enrichedData.additionalInfo = JSON.parse(enrichmentResponse.body).additionalInfo;

        // Return the modified enrichedData as the response
        return {
            statusCode: 200,
            body: JSON.stringify(enrichedData)
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

    // Add more risk assessment logic as needed

    return riskScore;
};

// Example function to calculate risk based on countries

// Example function to calculate risk based on countries
const calculateRiskFromCountries = (country: string): number => {
    if (!country) return 0; // Check if country is null or undefined
    const riskyCountries = ['Nigeria', 'Russia', 'China'];
    return riskyCountries.includes(country) ? 20 : 0;
};


// Example function to calculate risk based on transaction frequency
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

// Example function to calculate risk based on past transaction behavior
const calculateRiskFromPastTransactions = (transactionHistory: any[]): number => {
    let suspiciousTransactionCount = 0;
    for (const transaction of transactionHistory) {
        if (transaction.amount > 2000) {
            suspiciousTransactionCount++;
        }
        // Example: Increase risk score for transactions with unusual behavior
        if (transaction.country === 'Nigeria' || transaction.country === 'Russia') {
            suspiciousTransactionCount += 2;
        }
        // Add more criteria as needed
    }
    return suspiciousTransactionCount * 5; // Each suspicious transaction contributes 5 to risk score
};

// Example function to retrieve transaction history from a database or external service
const getTransactionHistory = (userId: string): any[] => {
    // Retrieve transaction history for the given user
    // Example implementation:
    return [
        { amount: 500, country: 'USA' },
        { amount: 1200, country: 'Nigeria' },
        { amount: 800, country: 'Russia' },
        // Additional transaction records
    ];
};
