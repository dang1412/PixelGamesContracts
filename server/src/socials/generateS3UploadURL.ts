import 'dotenv/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Khởi tạo S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1', // Ví dụ: Singapore
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function generateS3UploadURL(fileName: string, fileType: string): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'bomb-game-results'

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: fileType,
  })

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // URL hợp lệ trong 1 giờ
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL', error)
    throw new Error('Could not generate signed URL')
  }
}