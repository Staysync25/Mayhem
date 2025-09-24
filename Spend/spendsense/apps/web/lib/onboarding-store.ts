'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingData {
  // Step 1 - Intro (no data needed)
  
  // Step 2 - Business basics
  businessName?: string
  website?: string
  locationsCount?: number
  cuisineType?: string
  
  // Step 3 - Contact
  contactName?: string
  phone?: string
  email?: string
  
  // Step 4 - Ops snapshot
  vendors?: string
  monthlySpend?: number
  foodCostPct?: number
  inventoryFrequency?: string
  inventoryMethod?: string
  systemsUsed?: string
  primeVendorPct?: number
  monthlySales?: number
  goals?: string
  
  // Step 5 - Value framing (no data needed)
  
  // Step 6 - Plan selection
  planTier?: number
  
  // Step 7 - Upload
  files?: any[] // Will be populated with uploaded files
  
  // Step 8 - Checkout (handled by Stripe)
}

interface OnboardingStore {
  currentStep: number
  totalSteps: number
  data: OnboardingData
  setCurrentStep: (step: number) => void
  updateData: (data: Partial<OnboardingData>) => void
  reset: () => void
}

const initialState = {
  currentStep: 1,
  totalSteps: 8,
  data: {}
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      updateData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
      })),
      reset: () => set(initialState)
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({ data: state.data, currentStep: state.currentStep })
    }
  )
)
