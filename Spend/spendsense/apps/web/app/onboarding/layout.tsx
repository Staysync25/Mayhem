'use client'

import { ProgressBar } from '@/components/ProgressBar'
import { useOnboardingStore } from '@/lib/onboarding-store'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { currentStep, totalSteps } = useOnboardingStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            className="mb-8"
          />
          <div className="onboarding-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
