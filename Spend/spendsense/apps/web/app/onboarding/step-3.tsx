'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { trackOnboardingStep } from '@/lib/events'

export default function Step3() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboardingStore()
  const [formData, setFormData] = useState({
    contactName: data.contactName || '',
    phone: data.phone || '',
    email: data.email || ''
  })

  const handleContinue = () => {
    updateData(formData)
    trackOnboardingStep('contact', 3)
    setCurrentStep(4)
    router.push('/onboarding/step-4')
  }

  const handleBack = () => {
    setCurrentStep(2)
    router.push('/onboarding/step-2')
  }

  const isFormValid = formData.contactName.trim() && formData.phone.trim() && formData.email.trim()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Contact Information</h1>
        <p className="text-muted-foreground">We'll use this to send you your report and follow up</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label block mb-2">Contact Name *</label>
          <input
            type="text"
            className="input w-full"
            placeholder="Your full name"
            value={formData.contactName}
            onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
          />
        </div>

        <div>
          <label className="label block mb-2">Phone Number *</label>
          <input
            type="tel"
            className="input w-full"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div>
          <label className="label block mb-2">Email Address *</label>
          <input
            type="email"
            className="input w-full"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            We'll send you a magic link to verify your email
          </p>
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
          disabled={!isFormValid}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
