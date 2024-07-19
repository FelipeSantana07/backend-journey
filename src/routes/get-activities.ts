import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { dayjs } from "../lib/dayjs"
import { PrismaClient } from "@prisma/client"


export async function getActivities(app: FastifyInstance) {
   app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
      schema: {
         params: z.object({
            tripId: z.string().uuid(),
         })
      }
   }, async (req) => {
      const { tripId } = req.params

      const trip = await prisma.trip.findUnique({
         where: { id: tripId },
         include: { activities: {
            orderBy: {
               occurs_at: 'asc'
            }
         } },
      })

      if (!trip) {
         throw new Error('Trip not found')
      }

      const differenciInDaysBweteenTripStartAndEnd = dayjs(trip.ends_at).diff(trip.starts_at, 'days')

      console.log(differenciInDaysBweteenTripStartAndEnd)

      const activities = Array.from({ length: differenciInDaysBweteenTripStartAndEnd + 1 }).map((_, index) => {
         const date = dayjs(trip.starts_at).add(index, 'days')

         return {
            date: date.toDate(),
            activities: trip.activities.filter(activitiy => {
               return dayjs(activitiy.occurs_at).isSame(date, 'day')
            })
         }
      })

      return { activities }

   })

}



