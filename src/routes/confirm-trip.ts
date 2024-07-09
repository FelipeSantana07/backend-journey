import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import dayjs from "dayjs"
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";

export async function confirmTrip(app: FastifyInstance) {
   app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
      schema: {
         params: z.object({
            tripId: z.string().uuid()
         })
      }
   }, async (req) => {
      return { tripId: req.params.tripId }
   })
}




