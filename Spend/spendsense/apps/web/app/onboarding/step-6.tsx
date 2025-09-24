'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { PlanCards } from '@/components/PlanCards'
import { trackOnboardingStep, trackPlanSelected } from '@/lib/events'

export default function Step6() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboardingStore()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(data.planTier || null)

  const handleContinue = () => {
    if (!selectedPlan) return
    
    updateData({ planTier: selectedPlan })
    trackOnboardingStep('plan_selection', 6)
    trackPlanSelected(selectedPlan)
    setCurrentStep(7)
    router.push('/onboarding/step-7')
  }

  const handleBack = () => {
    setCurrentStep(5)
    router.push('/onboarding/step-5')
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Choose Your Plan</h1>
        <p className="text-muted-foreground">Select the level of service that fits your needs</p>
      </div>

      <PlanCards 
        selectedPlan={selectedPlan}
        onPlanSelect={setSelectedPlan}
      />

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
          disabled={!selectedPlan}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
