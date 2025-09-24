import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { trackSubmissionPaid } from '@/lib/events'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const submissionId = session.metadata?.submissionId
          const planTier = parseInt(session.metadata?.planTier || '1')
          
          if (submissionId) {
            // Update submission status and add Stripe customer ID
            await db.submission.update({
              where: { id: submissionId },
              data: {
                status: 'paid',
                user: {
                  update: {
                    stripeCusId: session.customer as string
                  }
                }
              }
            })

            // Track successful payment
            trackSubmissionPaid(submissionId, planTier)
          }
        }
        break
      }
      
      case 'payment_intent.succeeded': {
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object)
        break
      }
      
      case 'payment_intent.payment_failed': {
        // Handle failed payment
        console.log('Payment failed:', event.data.object)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
