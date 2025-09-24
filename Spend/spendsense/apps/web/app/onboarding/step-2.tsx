'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { trackOnboardingStep } from '@/lib/events'

const cuisineTypes = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
  'Mediterranean', 'French', 'Steakhouse', 'Seafood', 'Fast Casual', 'Pizza', 
  'BBQ', 'Other'
]

export default function Step2() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboardingStore()
  const [formData, setFormData] = useState({
    businessName: data.businessName || '',
    website: data.website || '',
    locationsCount: data.locationsCount || 1,
    cuisineType: data.cuisineType || ''
  })

  const handleContinue = () => {
    updateData(formData)
    trackOnboardingStep('business_basics', 2)
    setCurrentStep(3)
    router.push('/onboarding/step-3')
  }

  const handleBack = () => {
    setCurrentStep(1)
    router.push('/onboarding/step-1')
  }

  const isFormValid = formData.businessName.trim() && formData.cuisineType

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Tell us about your business</h1>
        <p className="text-muted-foreground">Help us understand your restaurant better</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label block mb-2">Business Name *</label>
          <input
            type="text"
            className="input w-full"
            placeholder="Enter your restaurant name"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          />
        </div>

        <div>
          <label className="label block mb-2">Website (optional)</label>
          <input
            type="url"
            className="input w-full"
            placeholder="https://yourrestaurant.com"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>

        <div>
          <label className="label block mb-2">Number of Locations</label>
          <select
            className="input w-full"
            value={formData.locationsCount}
            onChange={(e) => setFormData(prev => ({ ...prev, locationsCount: parseInt(e.target.value) }))}
          >
            <option value={1}>1 location</option>
            <option value={2}>2 locations</option>
            <option value={3}>3 locations</option>
            <option value={4}>4 locations</option>
            <option value={5}>5+ locations</option>
          </select>
        </div>

        <div>
          <label className="label block mb-2">Cuisine Type *</label>
          <select
            className="input w-full"
            value={formData.cuisineType}
            onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value }))}
          >
            <option value="">Select cuisine type</option>
            {cuisineTypes.map((cuisine) => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
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
