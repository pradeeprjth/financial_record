import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

const s3 = new AWS.S3();
const secretsManager = new AWS.SecretsManager();

// Function to decrypt AES key with RSA private key obtained from AWS Secrets Manager
const decryptRSA = async (encryptedData: Buffer): Promise<Buffer> => {
    console.log('Decrypting AES key with RSA private key obtained from AWS Secrets Manager...');

    try {
        // Retrieve the private key from AWS Secrets Manager
        const data = await secretsManager.getSecretValue({ SecretId: 'financial_record/rsa_keys' }).promise();
        if (data.SecretString) {
            const secret = JSON.parse(data.SecretString);
            const privateKey = Buffer.from(secret.privateKey, 'base64');

            console.log('Retrieved private key from AWS Secrets Manager:', privateKey);

            // Use the private key to decrypt the AES key
            const decryptedData = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                encryptedData
            );

            console.log('Decrypted AES key:', decryptedData);

            return decryptedData;
        } else {
            throw new Error('Private key not found in AWS Secrets Manager');
        }
    } catch (error) {
        console.error('Error retrieving private key from AWS Secrets Manager:', error);
        throw error;
    }
};

// Function to decrypt data with AES-256
const decryptAES = (encryptedData: Buffer, key: Buffer, iv: Buffer): Buffer => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    console.log('Decrypted data inside decryptAES:', decrypted.toString());
    return decrypted;
};

export const retrieveHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log('Received request:', event);

        // Extract object key from the query parameters
        const objectKey = event.queryStringParameters?.objectKey;

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
        console.log('Decoded userDetails before decryption:', decodedUserDetails); 

        const decodedAESKey = Buffer.from(encryptedDataObj.aesKey, 'base64');
        const iv = Buffer.from(encryptedDataObj.iv, 'base64');

        // Decrypt AES key with RSA private key obtained from AWS Secrets Manager
        const decryptedAESKey = await decryptRSA(decodedAESKey);
        console.log('Decrypted AES key:', decryptedAESKey.toString('base64'));


        // Decrypt the userDetails field using AES-256
        const decryptedUserDetails = decryptAES(Buffer.from(decodedUserDetails, 'utf8'), decryptedAESKey, iv);
        console.log('Decrypted user details:', decryptedUserDetails);
        const originalUserDetails = JSON.parse(decryptedUserDetails.toString());

        // Verify data integrity
        const hashedData = crypto.createHash('sha256').update(JSON.stringify(originalUserDetails)).digest('hex');
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
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
