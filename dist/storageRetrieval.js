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
exports.storageRetrievalHandler = void 0;
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const storageRetrievalHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requestData;
        if (typeof event.body === 'string' && event.body.trim() !== '') {
            requestData = JSON.parse(event.body);
        }
        else {
            throw new Error('Request body is empty');
        }
        const storedData = yield storeData(requestData);
        return {
            statusCode: 200,
            body: JSON.stringify({ storedData })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
});
exports.storageRetrievalHandler = storageRetrievalHandler;
const storeData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const storedObjectKey = `data_${Date.now()}.json`;
    try {
        yield s3
            .upload({
            Bucket: 'financial_record',
            Key: storedObjectKey,
            Body: JSON.stringify(data),
            ContentType: 'application/json'
        })
            .promise();
        return storedObjectKey;
    }
    catch (error) {
        console.error('Error storing data in S3:', error);
        throw new Error('Failed to store data in S3');
    }
});
