'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { trackOnboardingStep, trackCheckoutStart } from '@/lib/events'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Step8() {
  const router = useRouter()
  const { data, setCurrentStep } = useOnboardingStore()
  const [loading, setLoading] = useState(false)

  const handleBack = () => {
    setCurrentStep(7)
    router.push('/onboarding/step-7')
  }

  const handleCheckout = async () => {
    if (!data.planTier) return

    setLoading(true)
    trackOnboardingStep('checkout', 8)
    trackCheckoutStart(data.planTier, `price_t${data.planTier}`)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planTier: data.planTier,
          submissionData: data,
        }),
      })

      const { sessionId } = await response.json()

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe error:', error)
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanDetails = (tier: number) => {
    const plans = {
      1: { name: 'Purchase Review & Opportunity Report', price: '$299' },
      2: { name: 'Vendor Negotiation & Price Comparisons', price: '$599' },
      3: { name: 'Month-End Inventory Audit', price: '$999' }
    }
    return plans[tier as keyof typeof plans] || { name: 'Unknown Plan', price: '$0' }
  }

  const planDetails = data.planTier ? getPlanDetails(data.planTier) : null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Complete Your Purchase</h1>
        <p className="text-muted-foreground">Secure checkout powered by Stripe</p>
      </div>

      <div className="card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{planDetails?.name}</h3>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>
            <div className="text-2xl font-bold text-primary">{planDetails?.price}</div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">What's included:</h4>
            <ul className="space-y-2 text-sm">
              {data.planTier === 1 && (
                <>
                  <li>• Audit last 4–8 weeks of invoices & price lists</li>
                  <li>• Savings by brand/pack/vendor with benchmarks</li>
                  <li>• Prioritized action plan</li>
                </>
              )}
              {data.planTier === 2 && (
                <>
                  <li>• Everything in Tier 1, plus:</li>
                  <li>• We negotiate pricing with current vendors</li>
                  <li>• Cross-vendor price comps (including new vendors)</li>
                  <li>• Lock savings in writing</li>
                </>
              )}
              {data.planTier === 3 && (
                <>
                  <li>• Everything in Tier 1 & 2, plus:</li>
                  <li>• End-of-month inventory audit & variance review</li>
                  <li>• Count cadence & method tune-up</li>
                  <li>• Tie-out to theoretical vs. actual</li>
                </>
              )}
            </ul>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Secure payment processing by Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleBack}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading || !data.planTier}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Complete Purchase
            </>
          )}
        </button>
      </div>
    </div>
  )
}
