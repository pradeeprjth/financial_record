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
const s3 = new AWS.S3();
// Function to generate RSA key pair
const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Adjust modulus length as per requirement
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    }
});
// Function to decrypt AES key with RSA private key
const decryptRSA = (encryptedData) => {
    console.log('Decrypting AES key with RSA private key...');
    console.log('Private Key:', privateKey); // Log the private key
    const decryptedData = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, encryptedData);
    return decryptedData;
};
// Function to decrypt data with AES-256
const decryptAES = (encryptedData, key) => {
    console.log('Decrypting data with AES-256...');
    const iv = Buffer.from(encryptedData.slice(0, 32), 'base64'); // Extract IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedData = decipher.update(encryptedData.slice(32), 'base64', 'utf-8');
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
            console.log('Object key not provided.');
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
            console.log('No data found in S3.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'No data found in S3' }),
            };
        }
        const encryptedDataObj = JSON.parse(s3Data.Body.toString('utf-8'));
        console.log('Encrypted data:', encryptedDataObj);
        // Decode Base64 strings before decryption
        const decodedUserDetails = Buffer.from(encryptedDataObj.userDetails, 'base64').toString();
        const decodedAESKey = Buffer.from(encryptedDataObj.aesKey, 'base64');
        // Decrypt AES key with RSA private key
        const decryptedAESKey = decryptRSA(decodedAESKey);
        console.log('Decrypted AES key:', decryptedAESKey.toString('base64'));
        // Decrypt the userDetails field using AES-256
        const decryptedUserDetails = decryptAES(decodedUserDetails, decryptedAESKey);
        console.log('Decrypted user details:', decryptedUserDetails);
        // Verify data integrity
        const hashedData = crypto.createHash('sha256').update(JSON.stringify(decryptedUserDetails)).digest('hex');
        if (hashedData !== encryptedDataObj.hash) {
            console.log('Data integrity check failed.');
            throw new Error('Data integrity check failed');
        }
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
