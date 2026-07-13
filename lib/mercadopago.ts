import MercadoPago, { Payment, Preference } from 'mercadopago'

let mercadoPagoClient: MercadoPago | null = null
let preferenceClient: Preference | null = null
let paymentClient: Payment | null = null

function getMercadoPagoClient() {
  if (!mercadoPagoClient) {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN
    if (!accessToken) throw new Error('Falta MERCADOPAGO_ACCESS_TOKEN')
    mercadoPagoClient = new MercadoPago({ accessToken })
  }

  return mercadoPagoClient
}

function getPreferenceClient() {
  if (!preferenceClient) {
    preferenceClient = new Preference(getMercadoPagoClient())
  }

  return preferenceClient
}

function getPaymentClient() {
  if (!paymentClient) {
    paymentClient = new Payment(getMercadoPagoClient())
  }

  return paymentClient
}

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

  const preference = await getPreferenceClient().create({
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
  return await getPaymentClient().get({ id: Number(paymentId) })
}

export default getMercadoPagoClient
