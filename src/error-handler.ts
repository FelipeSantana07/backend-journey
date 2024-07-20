import { FastifyInstance } from "fastify"
import { ClientError } from "./errors/client-error"
import { ZodError } from "zod"

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (err, res, reply) => {
   if (err instanceof ZodError) {
      return reply.status(400).send({
         message: 'Invalid input',
         errors: err.flatten().fieldErrors
      })
   }
   if (err instanceof ClientError) {
      return reply.status(400).send({
         message: err.message
      })
   }

   return reply.status(500).send({ message: 'Internal server error' })
}