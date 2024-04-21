"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anonymizationHandler = void 0;
const crypto = __importStar(require("crypto"));
const generatePseudonym = (identifier) => {
    return crypto.createHash('sha256').update(identifier).digest('hex');
};
const anonymizationHandler = async (event) => {
    try {
        const requestBody = event.body;
        if (!requestBody) {
            throw new Error('Request body is empty');
        }
        const requestData = JSON.parse(requestBody);
        const anonymizedData = anonymizeData(requestData);
        return {
            statusCode: 200,
            body: JSON.stringify({ anonymizedData })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.anonymizationHandler = anonymizationHandler;
const pseudonymRecord = {};
const anonymizeData = (data) => {
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
