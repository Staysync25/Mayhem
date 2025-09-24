'use client'

import { Progress } from '@radix-ui/react-progress'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressBar({ currentStep, totalSteps, className = '' }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {totalSteps}
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
