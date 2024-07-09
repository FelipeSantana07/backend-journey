import fastify from "fastify"
import cors from '@fastify/cors'

import { prisma } from "./lib/prisma"

import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";

const app = fastify();

app.register(cors,{
   origin: '*'
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip)
app.register(confirmTrip)




app.get('/teste', () => { return 'Hello World!' })
app.get('/listar', async () => {
   const trips = await prisma.trip.findMany()
   return trips
})

app.listen({ port: 3333 }).then(() => {
   console.log('Server running...')
   console.log('http://localhost:3333')
})
