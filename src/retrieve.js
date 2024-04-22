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
exports.retrieveHandler = void 0;
const AWS = __importStar(require("aws-sdk"));
const crypto = __importStar(require("crypto"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const s3 = new AWS.S3();
// Function to decrypt AES key with RSA private key
const decryptRSA = (encryptedData, privateKey) => {
    return crypto.privateDecrypt(privateKey, encryptedData);
};
// Function to decrypt data with AES-256
const decryptAES = (encryptedData, key) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decryptedData = decipher.update(encryptedData, 'base64', 'utf-8');
    decryptedData += decipher.final('utf-8');
    return JSON.parse(decryptedData);
};
const retrieveHandler = async (event) => {
    var _a;
    try {
        console.log('Received request:', event);
        // Extract object key from the query parameters
        const objectKey = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.objectKey;
        if (!objectKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Object key not provided' }),
            };
        }
        // Fetch encrypted data from S3
        const s3Params = {
            Bucket: 'financial-record', // Replace with your S3 bucket name
            Key: objectKey,
        };
        const s3Data = await s3.getObject(s3Params).promise();
        // Check if s3Data.Body exists
        if (!s3Data.Body) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'No data found in S3' }),
            };
        }
        // Parse the encrypted data from S3
        const encryptedDataObj = JSON.parse(s3Data.Body.toString('utf-8'));
        console.log('encryptedDataObj:', encryptedDataObj);
        // Retrieve RSA private key from .env securely
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('Missing private key in .env file');
        }
        const decryptedAESKey = decryptRSA(Buffer.from(encryptedDataObj.aesKey, 'base64'), privateKey);
        // Decrypt the userDetails field using AES-256
        const decryptedUserDetails = decryptAES(encryptedDataObj.userDetails, decryptedAESKey);
        // Replace the encrypted userDetails with decrypted userDetails in the object
        const decryptedDataObj = {
            ...encryptedDataObj,
            userDetails: decryptedUserDetails,
        };
        console.log('Decrypted data:', decryptedDataObj);
        return {
            statusCode: 200,
            body: JSON.stringify(decryptedDataObj),
        };
    }
    catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.retrieveHandler = retrieveHandler;
