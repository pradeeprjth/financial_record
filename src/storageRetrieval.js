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
exports.storageRetrievalHandler = void 0;
const AWS = __importStar(require("aws-sdk"));
const s3 = new AWS.S3();
const storageRetrievalHandler = async (event) => {
    try {
        let requestData;
        if (typeof event.body === 'string' && event.body.trim() !== '') {
            requestData = JSON.parse(event.body);
        }
        else {
            throw new Error('Request body is empty');
        }
        const storedData = await storeData(requestData);
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
};
exports.storageRetrievalHandler = storageRetrievalHandler;
const storeData = async (data) => {
    const storedObjectKey = `data_${Date.now()}.json`;
    try {
        await s3
            .upload({
            Bucket: 'financial-record',
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
};
