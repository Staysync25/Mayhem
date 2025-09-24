'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { trackOnboardingStep } from '@/lib/events'

const inventoryFrequencies = ['Weekly', 'Biweekly', 'Monthly', 'Inconsistent']
const inventoryMethods = ['By area', 'By category', 'Recipe-level', 'Other']

export default function Step4() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboardingStore()
  const [formData, setFormData] = useState({
    vendors: data.vendors || '',
    monthlySpend: data.monthlySpend || '',
    foodCostPct: data.foodCostPct || '',
    inventoryFrequency: data.inventoryFrequency || '',
    inventoryMethod: data.inventoryMethod || '',
    systemsUsed: data.systemsUsed || '',
    primeVendorPct: data.primeVendorPct || '',
    monthlySales: data.monthlySales || '',
    goals: data.goals || ''
  })

  const handleContinue = () => {
    updateData(formData)
    trackOnboardingStep('ops_snapshot', 4)
    setCurrentStep(5)
    router.push('/onboarding/step-5')
  }

  const handleBack = () => {
    setCurrentStep(3)
    router.push('/onboarding/step-3')
  }

  const isFormValid = formData.vendors.trim() && formData.monthlySpend && formData.inventoryFrequency

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Operations Snapshot</h1>
        <p className="text-muted-foreground">Help us understand your current operations</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label block mb-2">Current Vendors *</label>
          <textarea
            className="input w-full min-h-[100px] resize-none"
            placeholder="List your main vendors (e.g., Sysco, US Foods, local suppliers)"
            value={formData.vendors}
            onChange={(e) => setFormData(prev => ({ ...prev, vendors: e.target.value }))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label block mb-2">Monthly Food Spend ($) *</label>
            <input
              type="number"
              className="input w-full"
              placeholder="25000"
              value={formData.monthlySpend}
              onChange={(e) => setFormData(prev => ({ ...prev, monthlySpend: parseFloat(e.target.value) || '' }))}
            />
          </div>
          <div>
            <label className="label block mb-2">Current Food Cost %</label>
            <input
              type="number"
              step="0.1"
              className="input w-full"
              placeholder="28.5"
              value={formData.foodCostPct}
              onChange={(e) => setFormData(prev => ({ ...prev, foodCostPct: parseFloat(e.target.value) || '' }))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label block mb-2">Inventory Frequency *</label>
            <select
              className="input w-full"
              value={formData.inventoryFrequency}
              onChange={(e) => setFormData(prev => ({ ...prev, inventoryFrequency: e.target.value }))}
            >
              <option value="">Select frequency</option>
              {inventoryFrequencies.map((freq) => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-2">Inventory Method</label>
            <select
              className="input w-full"
              value={formData.inventoryMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, inventoryMethod: e.target.value }))}
            >
              <option value="">Select method</option>
              {inventoryMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label block mb-2">Systems Used</label>
          <input
            type="text"
            className="input w-full"
            placeholder="e.g., Toast, Square, QuickBooks, Excel"
            value={formData.systemsUsed}
            onChange={(e) => setFormData(prev => ({ ...prev, systemsUsed: e.target.value }))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label block mb-2">Prime Vendor %</label>
            <input
              type="number"
              className="input w-full"
              placeholder="60"
              value={formData.primeVendorPct}
              onChange={(e) => setFormData(prev => ({ ...prev, primeVendorPct: parseInt(e.target.value) || '' }))}
            />
          </div>
          <div>
            <label className="label block mb-2">Monthly Sales ($)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="100000"
              value={formData.monthlySales}
              onChange={(e) => setFormData(prev => ({ ...prev, monthlySales: parseFloat(e.target.value) || '' }))}
            />
          </div>
        </div>

        <div>
          <label className="label block mb-2">Goals (optional)</label>
          <textarea
            className="input w-full min-h-[80px] resize-none"
            placeholder="What are your main goals? (e.g., reduce food costs, improve inventory accuracy, find new vendors)"
            value={formData.goals}
            onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
          />
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
