import { TodosAccess } from '../DataLayerLogic/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'
import { URL } from 'url'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('todos')

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info(
    `Create attachment presigned url for (userId, todoId) = (${userId}, ${todoId})`
  )

  await checkTodoAvailable(userId, todoId)
  const presignedUrl: string =
    await attachmentUtils.createAttachmentPresignedUrl(todoId)
  logger.info(`Created presigned URL: ${presignedUrl}`)

  const urlObj = new URL(presignedUrl)
  urlObj.search = '' //remove query string
  const updatedTodo: TodoItem = await todosAccess.updateTodoAttachmentUrl(
    userId,
    todoId,
    urlObj.toString()
  )
  if (updatedTodo) {
    logger.info(`Updated Todo Item attachment URL`)
  } else {
    throw new createError[500]('Can not update Todo attachment URL')
  }

  return presignedUrl
}

export async function checkTodoAvailable(
  userId: string,
  todoId: string
): Promise<void> {
  logger.info(
    `check Todo Item exist for (userId, todoId) = (${userId}, ${todoId})`
  )
  if (!todosAccess.isAvailableForTodo(userId, todoId)) {
    throw new createError.NotFound(`Not found Todo Item with id = ${todoId}`)
  }
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info(`Get Todo Items for userId = ${userId}`)
  const todos = await todosAccess.getTodos(userId)
  return todos
}

export async function createTodo(
  userId: string,
  request: CreateTodoRequest
): Promise<TodoItem> {
  logger.info(`Create Todo Item for userId = ${userId}`)

  const newTodoItem: TodoItem = {
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: request.name,
    dueDate: request.dueDate,
    done: false,
    attachmentUrl: ''
  }

  const createdTodo = await todosAccess.createTodo(newTodoItem)

  return createdTodo
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  logger.info(`Update Todo Item for (userId, todoId) = (${userId}, ${todoId})`)

  await checkTodoAvailable(userId, todoId)

  const updatedTodo = await todosAccess.updateTodo(
    userId,
    todoId,
    updateTodoRequest as TodoUpdate
  )
  return updatedTodo
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  logger.info(`Delete Todo Item for (userId, todoId) = (${userId}, ${todoId})`)

  await checkTodoAvailable(userId, todoId)

  const deletedTodo = await todosAccess.deleteTodo(userId, todoId)
  return deletedTodo
}
