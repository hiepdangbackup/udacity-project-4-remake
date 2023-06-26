// import { update } from 'immutability-helper';
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl } from '../../BusinessLayerLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    const todoId: string = event.pathParameters.todoId
    let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>

    try {
      const presignedUrl = await createAttachmentPresignedUrl(userId, todoId)

      response = {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: presignedUrl
        })
      }
    } catch (e) {
      logger.error(`Error creating Todo item: ${e.message}`)
      response = {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
      }
    }
    return response
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    origin: '*',
    credentials: true
  })
)
