import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodosForUser } from '../../BusinessLayerLogic/todos'
import { getUserId } from '../utils'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>

    try {
      const todos: TodoItem[] = await getTodosForUser(userId)

      response = {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
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
