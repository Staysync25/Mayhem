import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { trackSubmissionCreated } from '@/lib/events'

export async function POST(request: NextRequest) {
  try {
    const { planTier, submissionData } = await request.json()

    if (!planTier || !submissionData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Create a temporary submission record
    const submission = await db.submission.create({
      data: {
        userId: 'temp-user', // Will be updated after auth
        businessName: submissionData.businessName,
        website: submissionData.website,
        locationsCount: submissionData.locationsCount,
        cuisineType: submissionData.cuisineType,
        contactName: submissionData.contactName,
        phone: submissionData.phone,
        monthlySpend: submissionData.monthlySpend,
        monthlySales: submissionData.monthlySales,
        foodCostPct: submissionData.foodCostPct,
        inventoryFrequency: submissionData.inventoryFrequency,
        inventoryMethod: submissionData.inventoryMethod,
        systemsUsed: submissionData.systemsUsed,
        vendors: submissionData.vendors,
        primeVendorPct: submissionData.primeVendorPct,
        goals: submissionData.goals,
        planTier: planTier,
        status: 'submitted'
      }
    })

    // Get the price ID for the selected plan
    const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_T${planTier}` as keyof typeof process.env]
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/onboarding/step-8`,
      metadata: {
        submissionId: submission.id,
        planTier: planTier.toString(),
      },
      customer_email: submissionData.email,
    })

    // Track submission creation
    trackSubmissionCreated(submission.id)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
