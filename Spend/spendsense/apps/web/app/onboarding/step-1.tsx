'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { trackOnboardingStep } from '@/lib/events'

export default function Step1() {
  const router = useRouter()
  const { setCurrentStep } = useOnboardingStore()

  const handleContinue = () => {
    trackOnboardingStep('intro', 1)
    setCurrentStep(2)
    router.push('/onboarding/step-2')
  }

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <Image
          src="/logo.png"
          alt="SpendSense"
          width={120}
          height={120}
          className="mx-auto"
        />
        <h1 className="text-3xl font-bold text-primary">
          Turn invoices into opportunities.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Get a comprehensive audit of your food costs and discover savings opportunities 
          that can reduce your costs by 15-25%.
        </p>
      </div>
      
      <div className="pt-8">
        <button
          onClick={handleContinue}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
        >
          Start free checkup
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
