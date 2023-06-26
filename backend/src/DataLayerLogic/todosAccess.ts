import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todosAccess')
const XAWS = AWSXRay.captureAWSClient(new AWS.DynamoDB())

// TODO: Implement the dataLayer logic
export class TodosAccess {
  private readonly docClient: DocumentClient
  private readonly todosTable: string

  constructor() {
    this.docClient = new AWS.DynamoDB.DocumentClient({ service: XAWS })
    this.todosTable = process.env.TODOS_TABLE
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.debug('Getting all todos')

    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient.query(params).promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()

    return todoItem
  }

  async updateTodo(
    userId: string,
    todoId: string,
    todoItemUpdate: TodoUpdate
  ): Promise<TodoItem> {
    logger.debug('Update todo')

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression:
        'set #todoName = :todoName, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: { '#todoName': 'name' },
      ExpressionAttributeValues: {
        ':todoName': todoItemUpdate.name,
        ':dueDate': todoItemUpdate.dueDate,
        ':done': todoItemUpdate.done
      },
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()

    const updatedTodoItem = result.Attributes

    return updatedTodoItem as TodoItem
  }

  async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    logger.debug('Deleting todo')

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }

    const result = await this.docClient.delete(params).promise()

    const deletedTodo = result.Attributes

    return deletedTodo as TodoItem
  }

  async updateTodoAttachmentUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoItem> {
    logger.debug('Update attachment')

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
        ':url': attachmentUrl
      },
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()

    const updatedTodo = result.Attributes

    return updatedTodo as TodoItem
  }

  async isAvailableForTodo(userId: string, todoId: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()

    const isExist = result.Item !== null && result.Item !== undefined

    return isExist
  }
}
