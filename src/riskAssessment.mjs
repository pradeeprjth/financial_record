"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskAssessmentHandler = void 0;
var dataEnrichment_1 = require("./dataEnrichment"); // Import the dataEnrichmentHandler
var riskAssessmentHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var enrichmentResponse, enrichedData, riskScore, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, dataEnrichment_1.dataEnrichmentHandler)(event)];
            case 1:
                enrichmentResponse = _a.sent();
                if (enrichmentResponse.statusCode !== 200) {
                    return [2 /*return*/, enrichmentResponse]; // Return if enrichment failed
                }
                enrichedData = JSON.parse(enrichmentResponse.body).enrichedData;
                riskScore = calculateRiskScore(enrichedData);
                // Step 3: Add the risk score to the enriched data
                enrichedData.risk = riskScore;
                // Return the modified enrichedData as the response
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify(enrichedData)
                    }];
            case 2:
                error_1 = _a.sent();
                console.error('Error:', error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({ error: error_1 instanceof Error ? error_1.message : 'Internal server error' })
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.riskAssessmentHandler = riskAssessmentHandler;
// Function to calculate risk score based on various factors
var calculateRiskScore = function (data) {
    var riskScore = 0;
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
var calculateRiskFromCountries = function (country) {
    var riskyCountries = ['Nigeria', 'Russia', 'China'];
    return riskyCountries.includes(country) ? 20 : 0;
};
// Example function to calculate risk based on transaction frequency
var calculateRiskFromTransactionFrequency = function (userId) {
    var transactionHistory = getTransactionHistory(userId);
    var transactionFrequency = transactionHistory.length;
    if (transactionFrequency > 10) {
        return 15;
    }
    else if (transactionFrequency > 5) {
        return 10;
    }
    return 0;
};
// Example function to calculate risk based on past transaction behavior
var calculateRiskFromPastTransactions = function (transactionHistory) {
    var suspiciousTransactionCount = 0;
    for (var _i = 0, transactionHistory_1 = transactionHistory; _i < transactionHistory_1.length; _i++) {
        var transaction = transactionHistory_1[_i];
        if (transaction.amount > 2000) {
            suspiciousTransactionCount++;
        }
        // Add more criteria as needed
    }
    return suspiciousTransactionCount * 5; // Each suspicious transaction contributes 5 to risk score
};
// Example function to retrieve transaction history from a database or external service
var getTransactionHistory = function (userId) {
    // Retrieve transaction history for the given user
    // Example implementation:
    return [
        { amount: 500, country: 'USA' },
        { amount: 1200, country: 'Nigeria' },
        { amount: 800, country: 'Russia' },
        // Additional transaction records
    ];
};
