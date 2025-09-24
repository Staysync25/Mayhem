'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { trackOnboardingStep } from '@/lib/events'

export default function Step5() {
  const router = useRouter()
  const { setCurrentStep } = useOnboardingStore()

  const handleContinue = () => {
    trackOnboardingStep('value_framing', 5)
    setCurrentStep(6)
    router.push('/onboarding/step-6')
  }

  const handleBack = () => {
    setCurrentStep(4)
    router.push('/onboarding/step-4')
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          We turn invoices into an actionable savings plan.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Spot price gaps by category, vendor leverage, and quick wins that move food cost down.
        </p>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">What you'll get this week:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <span>A prioritized savings report with specific recommendations</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <span>Vendor comparison matrix showing price differences</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <span>A short list of negotiation targets for this month</span>
            </li>
          </ul>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-accent">15-25%</span>
            </div>
            <h3 className="font-semibold">Average Savings</h3>
            <p className="text-sm text-muted-foreground">
              Most restaurants see 15-25% reduction in food costs
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-accent">5-7</span>
            </div>
            <h3 className="font-semibold">Days to Results</h3>
            <p className="text-sm text-muted-foreground">
              Complete analysis delivered within one week
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-accent">500+</span>
            </div>
            <h3 className="font-semibold">Restaurants Helped</h3>
            <p className="text-sm text-muted-foreground">
              Trusted by restaurants nationwide
            </p>
          </div>
        </div>

        <div className="card p-6 bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-semibold">SC</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">
                "SpendSense helped us identify $8,000 in monthly savings. Their vendor 
                negotiation service alone paid for itself in the first month."
              </p>
              <div className="font-medium">Sarah Chen</div>
              <div className="text-sm text-muted-foreground">Owner, Golden Dragon Restaurant</div>
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
          onClick={handleContinue}
          className="btn-primary inline-flex items-center gap-2"
        >
          Choose Your Plan
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
