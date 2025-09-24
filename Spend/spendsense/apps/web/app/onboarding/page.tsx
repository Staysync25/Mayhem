'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/onboarding-store'

export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep } = useOnboardingStore()

  useEffect(() => {
    router.push(`/onboarding/step-${currentStep}`)
  }, [currentStep, router])

  return null
}
