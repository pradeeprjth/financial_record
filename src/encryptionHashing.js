"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionHashingHandler = exports.getRSAKeysFromSecretsManager = void 0;
const anonymization_1 = require("./anonymization");
const crypto_1 = __importDefault(require("crypto"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const secretsManager = new aws_sdk_1.default.SecretsManager();
// Function to generate RSA key pair
const generateRSAKeyPair = () => {
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        }
    });
    return {
        publicKey: Buffer.from(publicKey).toString('base64'),
        privateKey: Buffer.from(privateKey).toString('base64')
    };
};
// Function to get the private key from AWS Secrets Manager
const getRSAKeysFromSecretsManager = async () => {
    try {
        const data = await secretsManager.getSecretValue({ SecretId: 'financial_record/rsa_keys' }).promise();
        if (data.SecretString) {
            const secret = JSON.parse(data.SecretString);
            return {
                publicKey: secret['publicKey'],
                privateKey: secret['privateKey']
            };
        }
    }
    catch (error) {
        if (error.code !== 'ResourceNotFoundException') {
            throw error;
        }
        console.error('Secret with name "financial_recort/private_key" not found.');
    }
    return { publicKey: undefined, privateKey: undefined };
};
exports.getRSAKeysFromSecretsManager = getRSAKeysFromSecretsManager;
// Function to store the private key in AWS Secrets Manager
const storeRSAKeyPairInSecretsManager = async (publicKey, privateKey) => {
    try {
        // Check if the secret already exists
        await secretsManager.describeSecret({ SecretId: 'financial_record/rsa_keys' }).promise();
        console.log('Secret already exists, skipping creation.');
    }
    catch (error) {
        if (error.code === 'ResourceNotFoundException') {
            // Secrets don't exist, create them
            await secretsManager.createSecret({
                Name: 'financial_record/rsa_keys',
                SecretString: JSON.stringify({ publicKey, privateKey }),
            }).promise();
            console.log('Secrets created successfully.');
        }
        else {
            // Other error occurred, throw it
            throw error;
        }
    }
};
// Function to generate a random AES key
const generateAESKey = () => {
    return crypto_1.default.randomBytes(32); // 256 bits key for AES-256 encryption
};
// Function to encrypt data with AES-256
const encryptAES = (data, key) => {
    const iv = crypto_1.default.randomBytes(16); // Initialization Vector
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return Buffer.from(encryptedData, 'hex');
};
// Function to encrypt AES key with RSA private key
const encryptRSA = (data, publicKey) => {
    return crypto_1.default.publicEncrypt({
        key: publicKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, data);
};
// Function to hash data with SHA-256
const hashSHA256 = (data) => {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
};
const encryptionHashingHandler = async (event) => {
    try {
        // Parse the request body as JSON
        const requestBody = JSON.parse(event.body || '');
        // Anonymize sensitive user data
        const anonymizedData = await (0, anonymization_1.anonymizationHandler)(event);
        // Get the private key from AWS Secrets Manager or generate a new key pair if not present
        let { publicKey, privateKey } = await (0, exports.getRSAKeysFromSecretsManager)();
        if (!privateKey) {
            const { publicKey: generatedPublicKey, privateKey: generatedPrivateKey } = generateRSAKeyPair();
            publicKey = generatedPublicKey;
            privateKey = generatedPrivateKey;
            await storeRSAKeyPairInSecretsManager(publicKey, privateKey);
        }
        // Convert the private key from base64 string to Buffer
        const privateKeyBuffer = Buffer.from(privateKey, 'base64');
        // Use the private key to encrypt the AES key
        const aesKey = generateAESKey();
        const encryptedAESKey = encryptRSA(aesKey, privateKeyBuffer);
        // Encrypt the anonymized data with AES-256
        const encryptedData = encryptAES(anonymizedData, aesKey);
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
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.encryptionHashingHandler = encryptionHashingHandler;
