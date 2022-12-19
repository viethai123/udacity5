import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers'
import { createLogger } from '../../utils/logger';

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    logger.info(`Starting create new todo! with ${userId}`);
    const newItem = await createTodo(userId, newTodo);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-type' : 'application/json',
      },
      body: JSON.stringify({item: newItem})
    }
  }
)

handler.use(httpErrorHandler())
.use(
  cors({
    origin:'*',
    credentials: true
  })
)
