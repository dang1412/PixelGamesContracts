"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateS3UploadURL = generateS3UploadURL;
require("dotenv/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
// Khởi tạo S3 Client
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-1', // Ví dụ: Singapore
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
async function generateS3UploadURL(fileName, fileType) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'bomb-game-results';
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType,
    });
    try {
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 }); // URL hợp lệ trong 1 giờ
        return signedUrl;
    }
    catch (error) {
        console.error('Error generating signed URL', error);
        throw new Error('Could not generate signed URL');
    }
}
