'use client'

import { Progress } from '@radix-ui/react-progress'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { useAssessmentStore } from '@/lib/assessment-store'

interface ProgressBarProps {
  currentStep?: number
  totalSteps?: number
  className?: string
  context?: 'onboarding' | 'assessment'
}

export function ProgressBar({ currentStep, totalSteps, className = '', context }: ProgressBarProps) {
  // Auto-detect context if not provided
  const onboardingStore = useOnboardingStore()
  const assessmentStore = useAssessmentStore()
  
  let actualCurrentStep: number
  let actualTotalSteps: number
  
  if (context === 'onboarding' || (!context && onboardingStore.currentStep > 1)) {
    actualCurrentStep = currentStep || onboardingStore.currentStep
    actualTotalSteps = totalSteps || onboardingStore.totalSteps
  } else if (context === 'assessment' || (!context && assessmentStore.currentStep > 1)) {
    actualCurrentStep = currentStep || assessmentStore.currentStep
    actualTotalSteps = totalSteps || assessmentStore.totalSteps
  } else {
    actualCurrentStep = currentStep || 1
    actualTotalSteps = totalSteps || 1
  }
  
  const progress = (actualCurrentStep / actualTotalSteps) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {actualCurrentStep} of {actualTotalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress 
        value={progress} 
        className="w-full h-2 bg-secondary rounded-full overflow-hidden"
      />
    </div>
  )
}
