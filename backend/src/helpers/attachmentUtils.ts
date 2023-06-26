import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS_IMAGE = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
  private readonly bucketName: string
  private readonly urlExpiration: number
  private readonly s3: AWS.S3

  constructor() {
    this.bucketName = process.env.ATTACHMENT_S3_BUCKET
    this.urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
    this.s3 = new XAWS_IMAGE.S3({ signatureVersion: 'v4' })
  }

  async createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}
