"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskAssessmentHandler = void 0;
const dataEnrichment_1 = require("./dataEnrichment"); // Import the dataEnrichmentHandler
const riskAssessmentHandler = async (event) => {
    try {
        // Step 1: Enrich the data
        const enrichmentResponse = await (0, dataEnrichment_1.dataEnrichmentHandler)(event);
        if (enrichmentResponse.statusCode !== 200) {
            return enrichmentResponse; // Return if enrichment failed
        }
        // Extract enriched data from the response
        const enrichedData = JSON.parse(enrichmentResponse.body).enrichedData;
        // Step 2: Perform risk assessment based on the enriched data
        const riskScore = calculateRiskScore(enrichedData);
        // Step 3: Add the risk score to the enriched data
        enrichedData.risk = riskScore;
        // Return the modified enrichedData as the response
        return {
            statusCode: 200,
            body: JSON.stringify(enrichedData)
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' })
        };
    }
};
exports.riskAssessmentHandler = riskAssessmentHandler;
// Function to calculate risk score based on various factors
const calculateRiskScore = (data) => {
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
const calculateRiskFromCountries = (country) => {
    const riskyCountries = ['Nigeria', 'Russia', 'China'];
    return riskyCountries.includes(country) ? 20 : 0;
};
// Example function to calculate risk based on transaction frequency
const calculateRiskFromTransactionFrequency = (userId) => {
    const transactionHistory = getTransactionHistory(userId);
    const transactionFrequency = transactionHistory.length;
    if (transactionFrequency > 10) {
        return 15;
    }
    else if (transactionFrequency > 5) {
        return 10;
    }
    return 0;
};
// Example function to calculate risk based on past transaction behavior
const calculateRiskFromPastTransactions = (transactionHistory) => {
    let suspiciousTransactionCount = 0;
    for (const transaction of transactionHistory) {
        if (transaction.amount > 2000) {
            suspiciousTransactionCount++;
        }
        // Add more criteria as needed
    }
    return suspiciousTransactionCount * 5; // Each suspicious transaction contributes 5 to risk score
};
// Example function to retrieve transaction history from a database or external service
const getTransactionHistory = (userId) => {
    // Retrieve transaction history for the given user
    // Example implementation:
    return [
        { amount: 500, country: 'USA' },
        { amount: 1200, country: 'Nigeria' },
        { amount: 800, country: 'Russia' },
        // Additional transaction records
    ];
};
