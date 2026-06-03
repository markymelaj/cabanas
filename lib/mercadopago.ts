import MercadoPago from 'mercadopago'

const mp = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })

export interface CreatePreferenceInput {
  reservationId: string
  title: string
  quantity: number
  unit_price: number
  payerEmail: string
  payerName: string
}

export async function createPreference(input: CreatePreferenceInput) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  const preference = await mp.preference.create({
    body: {
      items: [
        {
          id: input.reservationId,
          title: input.title,
          quantity: input.quantity,
          unit_price: input.unit_price,
          currency_id: 'CLP',
        },
      ],
      payer: {
        email: input.payerEmail,
        name: input.payerName,
      },
      back_urls: {
        success: `${baseUrl}/confirmacion?reserva=${input.reservationId}&status=success`,
        failure: `${baseUrl}/confirmacion?reserva=${input.reservationId}&status=failure`,
        pending: `${baseUrl}/confirmacion?reserva=${input.reservationId}&status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhook-mp`,
      external_reference: input.reservationId,
    },
  })

  return preference
}

export async function getPayment(paymentId: string) {
  return await mp.payment.get({ id: Number(paymentId) })
}

export default mp
