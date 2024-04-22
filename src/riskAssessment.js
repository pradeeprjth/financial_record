"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskAssessmentHandler = void 0;
const dataEnrichment_1 = require("./dataEnrichment"); // Import the dataEnrichmentHandler
// Risk assessment handler function
const riskAssessmentHandler = async (event) => {
    try {
        // Step 1: Enrich the data
        const enrichmentResponse = await (0, dataEnrichment_1.dataEnrichmentHandler)(event);
        console.log('Enrichment response:', enrichmentResponse);
        if (enrichmentResponse.statusCode !== 200) {
            console.error('Enrichment failed with status code:', enrichmentResponse.statusCode);
            return enrichmentResponse; // Return if enrichment failed
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
        console.log('Enrichment response:', enrichedData);
        console.log(additionalInfo);
        // Return the modified enrichedData as the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                enrichedData: enrichedData, // this one has object + riskScore
                additionalInfo: additionalInfo //this is undefined
            })
        };
    }
    catch (error) {
        console.error('Error in riskAssessmentHandler:', error);
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
    if (!country)
        return 0; // Check if country is null or undefined
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
        // Example: Increase risk score for transactions with unusual behavior
        if (transaction.country === 'Nigeria' || transaction.country === 'Russia') {
            suspiciousTransactionCount += 2;
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
