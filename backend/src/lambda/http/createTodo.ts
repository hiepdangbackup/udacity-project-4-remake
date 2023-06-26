import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../BusinessLayerLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)
    let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>

    try {
      const newTodoItem = await createTodo(userId, createTodoRequest)

      response = {
        statusCode: 201,
        body: JSON.stringify({
          item: newTodoItem
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
