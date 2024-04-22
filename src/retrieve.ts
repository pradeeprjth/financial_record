import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3();

// Function to decrypt AES key with RSA private key
const decryptRSA = (encryptedData: Buffer, privateKey: crypto.KeyLike): Buffer => {
  return crypto.privateDecrypt(privateKey, encryptedData);
};

// Function to decrypt data with AES-256
const decryptAES = (encryptedData: string, key: Buffer): any => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0)); 
  let decryptedData = decipher.update(encryptedData, 'base64', 'utf-8');
  decryptedData += decipher.final('utf-8');
  return JSON.parse(decryptedData);
};

export const retrieveHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received request:', event);

    // Extract object key from the query parameters
    const objectKey = event.queryStringParameters?.objectKey;

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
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
