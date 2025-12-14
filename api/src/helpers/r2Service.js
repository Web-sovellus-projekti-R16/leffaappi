import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY
    }
})

export const uploadToR2 = async (fileBuffer, fileName, contentType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType
    })

    await client.send(command)

    const signedUrl = await getSignedUrl(client, new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName
    }), { expiresIn: 3600 })

    return { key: fileName, signedUrl }
}

export const deleteFromR2 = async (fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName
    })

    await client.send(command)
}