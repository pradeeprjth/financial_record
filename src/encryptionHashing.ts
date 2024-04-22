import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { anonymizationHandler } from './anonymization';
import crypto from 'crypto';

// Function to generate a random AES key
const generateAESKey = (): Buffer => {
    return crypto.randomBytes(32); // 256 bits key for AES-256 encryption
};

// Function to generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
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
const encryptAES = (data: any, key: Buffer): Buffer => {
    const iv = crypto.randomBytes(16); // Initialization Vector
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return Buffer.from(encryptedData, 'hex');
};

// Function to hash data with SHA-256
const hashSHA256 = (data: any): string => {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
};

// Function to encrypt AES key with RSA public key
const encryptRSA = (data: Buffer): Buffer => {
    return crypto.publicEncrypt(publicKey, data);
};

export const encryptionHashingHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the request body as JSON
        const requestBody = JSON.parse(event.body || '');

        // Anonymize sensitive user data
        const anonymizedData = await anonymizationHandler(event);

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
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
