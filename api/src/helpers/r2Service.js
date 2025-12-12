import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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
        ContentType: contentType,
        ACL: "public-read"
    })

    await client.send(command)

    return `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`
}