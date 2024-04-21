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
exports.encryptionHashingHandler = void 0;
const anonymization_1 = require("./anonymization");
const encryptionHashingHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse the request body as JSON
        const requestBody = JSON.parse(event.body || '');
        // Anonymize sensitive user data
        const anonymizedData = yield (0, anonymization_1.anonymizationHandler)(event);
        // Parse the anonymized response body
        const anonymizedBody = JSON.parse(anonymizedData.body);
        // Return response with modified data
        return {
            statusCode: 200,
            body: JSON.stringify(Object.assign(Object.assign({}, requestBody), { userDetails: anonymizedBody.anonymizedData }))
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
});
exports.encryptionHashingHandler = encryptionHashingHandler;
