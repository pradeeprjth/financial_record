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
Object.defineProperty(exports, "__esModule", { value: true });
exports.anonymizationHandler = void 0;
const crypto = require("crypto");
const generatePseudonym = (identifier) => {
    return crypto.createHash('sha256').update(identifier).digest('hex');
};
const anonymizationHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
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
});
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
