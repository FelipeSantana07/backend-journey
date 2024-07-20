import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { request } from "http";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer'
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function confirmTrip(app: FastifyInstance) {
   app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
      schema: {
         params: z.object({
            tripId: z.string().uuid()
         })
      }
   }, async (req, reply) => {
      const { tripId } = req.params

      const trip = await prisma.trip.findUnique({
         where: {
            id: tripId,
         },
         include: {
            participants: {
               where: {
                  is_owner: false
               }
            }
         }
      })

      if (!trip) {
         throw new ClientError('Trip not found.')
      }

      if (trip.is_confirmed) {
         console.log(trip)
         return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
      }

      await prisma.trip.update({
         where: { id: tripId },
         data: { is_confirmed: true },
      })
      
      const formattedStartDate = dayjs(trip.starts_at).format('LL')
      const formattedEndDate = dayjs(trip.ends_at).format('LL')

      // const participants = await prisma.participant.findMany({
      //    where: {
      //       trip_id: tripId,
      //       is_owner: false,
      //    }
      // })

      const mail = await getMailClient()

      await Promise.all(
         trip.participants.map(async (participants) => {

            const confirmationLink = `${env.API_BASE_URL}/participants/${participants.id}/confirm`

            const message = await mail.sendMail({
               from: {
                  name: 'Equipe plann.er',
                  address: 'teste@plann.er'
               },
               to: participants.email,
               subject: `Confirme sua viagem para ${trip.destination}`,
               html: `
               <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                  <p>Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> 
                  a <strong>${formattedEndDate}</strong>.</p>
                  <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                  <p>
                     <a href="${confirmationLink}">Confirmar viagem</a>
                  </p>
                  <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
               </div>
               `.trim(),
            })

            console.log(nodemailer.getTestMessageUrl(message))
         })
      )

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
   })
}




