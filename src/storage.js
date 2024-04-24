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
exports.storageHandler = void 0;
const AWS = __importStar(require("aws-sdk"));
const s3 = new AWS.S3();
const storageHandler = async (event) => {
    try {
        console.log('Received request:', event);
        if (!event) {
            console.error('Request data is missing or invalid');
            throw new Error('Request data is missing or invalid');
        }
        const requestData = event;
        console.log('Request data:', requestData);
        const storedData = await storeData(requestData);
        console.log('Data stored successfully:', storedData);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Data Stored successfully',
                data: storedData,
            }),
        };
    }
    catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.storageHandler = storageHandler;
const storeData = async (data) => {
    const storedObjectKey = `data_${Date.now()}.json`;
    try {
        console.log('Storing data in S3:', data);
        await s3.upload({
            Bucket: 'financial-record',
            Key: storedObjectKey,
            Body: JSON.stringify(data),
            ContentType: 'application/json'
        }).promise();
        console.log('Data stored successfully:', storedObjectKey);
        return storedObjectKey;
    }
    catch (error) {
        console.error('Error storing data in S3:', error);
        throw new Error('Failed to store data in S3');
    }
};
