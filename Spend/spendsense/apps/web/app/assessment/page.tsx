'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/lib/assessment-store'

export default function AssessmentPage() {
  const router = useRouter()
  const { currentStep } = useAssessmentStore()

  useEffect(() => {
    router.push(`/assessment/step-${currentStep}`)
  }, [currentStep, router])

  return null
}
