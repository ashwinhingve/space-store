import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { sendPurchaseReceipt } from '@/emails'
import Order from '@/lib/db/models/order.model'

// Ensure we have the required environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Only initialize Stripe if we have a secret key
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey) 
  : null

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe || !stripeWebhookSecret) {
      console.error('Stripe is not configured. Missing environment variables.')
      return new NextResponse('Stripe configuration error', { status: 500 })
    }

    const event = await stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get('stripe-signature') as string,
      stripeWebhookSecret
    )

    if (event.type === 'charge.succeeded') {
      const charge = event.data.object
      const orderId = charge.metadata.orderId
      const email = charge.billing_details.email
      const pricePaidInCents = charge.amount
      const order = await Order.findById(orderId).populate('user', 'email')
      if (order == null) {
        return new NextResponse('Bad Request', { status: 400 })
      }

      order.isPaid = true
      order.paidAt = new Date()
      order.paymentResult = {
        id: event.id,
        status: 'COMPLETED',
        email_address: email!,
        pricePaid: (pricePaidInCents / 100).toFixed(2),
      }
      await order.save()
      
      // Try to send email, but don't fail if it doesn't work
      try {
        await sendPurchaseReceipt({ order })
      } catch (err) {
        console.log('Email sending failed:', err)
        // Continue processing even if email fails
      }
      
      return NextResponse.json({
        message: 'updateOrderToPaid was successful',
      })
    }
    
    return new NextResponse('Event processed', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 400 
    })
  }
}
