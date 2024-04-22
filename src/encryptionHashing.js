"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionHashingHandler = void 0;
const anonymization_1 = require("./anonymization");
const crypto_1 = __importDefault(require("crypto"));
// Function to generate a random AES key
const generateAESKey = () => {
    return crypto_1.default.randomBytes(32); // 256 bits key for AES-256 encryption
};
// Function to generate RSA key pair
const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('rsa', {
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
// Function to encrypt data with AES-256
const encryptAES = (data, key) => {
    const iv = crypto_1.default.randomBytes(16); // Initialization Vector
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return Buffer.from(encryptedData, 'hex');
};
// Function to hash data with SHA-256
const hashSHA256 = (data) => {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
};
// Function to encrypt AES key with RSA public key
const encryptRSA = (data) => {
    return crypto_1.default.publicEncrypt(publicKey, data);
};
const encryptionHashingHandler = async (event) => {
    try {
        // Parse the request body as JSON
        const requestBody = JSON.parse(event.body || '');
        // Anonymize sensitive user data
        const anonymizedData = await (0, anonymization_1.anonymizationHandler)(event);
        // Generate AES key
        const aesKey = generateAESKey();
        // Encrypt the anonymized data with AES-256
        const encryptedData = encryptAES(anonymizedData, aesKey);
        // Encrypt AES key with RSA
        const encryptedAESKey = encryptRSA(aesKey);
        // Hash important fields for integrity checks
        const hashedData = {
            ...anonymizedData,
            hash: hashSHA256(anonymizedData),
        };
        // Return response with modified data
        return {
            statusCode: 200,
            body: JSON.stringify({
                ...requestBody,
                userDetails: encryptedData.toString('base64'),
                aesKey: encryptedAESKey.toString('base64'),
                hash: hashedData.hash
            })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.encryptionHashingHandler = encryptionHashingHandler;
