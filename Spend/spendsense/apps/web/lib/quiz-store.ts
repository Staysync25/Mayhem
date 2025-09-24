'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuizQuestion {
  id: string
  text: string
  type: 'multiple_choice' | 'scale' | 'yes_no'
  options?: string[]
  min?: number
  max?: number
}

export interface QuizAnswer {
  questionId: string
  value: string | number
}

interface QuizStore {
  currentStep: number
  totalSteps: number
  answers: QuizAnswer[]
  questions: QuizQuestion[]
  setCurrentStep: (step: number) => void
  addAnswer: (questionId: string, value: string | number) => void
  reset: () => void
  calculateScore: () => number
  getRecommendations: () => string[]
}

const questions: QuizQuestion[] = [
  {
    id: 'cuisine_type',
    text: 'What type of restaurant do you operate?',
    type: 'multiple_choice',
    options: ['Fast Casual', 'Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe/Bakery', 'Food Truck']
  },
  {
    id: 'locations',
    text: 'How many locations do you have?',
    type: 'multiple_choice',
    options: ['1', '2-3', '4-10', '11-25', '25+']
  },
  {
    id: 'monthly_spend',
    text: 'What is your approximate monthly food spend?',
    type: 'multiple_choice',
    options: ['Under $5,000', '$5,000-$15,000', '$15,000-$50,000', '$50,000-$100,000', '$100,000+']
  },
  {
    id: 'food_cost_pct',
    text: 'What is your current food cost percentage?',
    type: 'multiple_choice',
    options: ['Under 25%', '25-30%', '30-35%', '35-40%', 'Over 40%', 'Not sure']
  },
  {
    id: 'inventory_frequency',
    text: 'How often do you do inventory?',
    type: 'multiple_choice',
    options: ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Inconsistent', 'Never']
  },
  {
    id: 'biggest_challenge',
    text: 'What is your biggest challenge with food costs?',
    type: 'multiple_choice',
    options: ['Waste/spoilage', 'Vendor pricing', 'Portion control', 'Menu costing', 'Inventory tracking']
  },
  {
    id: 'readiness',
    text: 'How ready are you to implement cost optimization changes?',
    type: 'scale',
    min: 1,
    max: 10
  }
]

const initialState = {
  currentStep: 1,
  totalSteps: questions.length + 1, // +1 for results page
  answers: [],
  questions
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      addAnswer: (questionId, value) => set((state) => ({
        answers: [...state.answers.filter(a => a.questionId !== questionId), { questionId, value }]
      })),
      reset: () => set(initialState),
      calculateScore: () => {
        const { answers, questions } = get()
        let score = 0
        
        // Simple scoring based on readiness and operational efficiency
        const readinessAnswer = answers.find(a => a.questionId === 'readiness')
        if (readinessAnswer) {
          score += Number(readinessAnswer.value) * 5 // 10-50 points
        }
        
        const foodCostAnswer = answers.find(a => a.questionId === 'food_cost_pct')
        if (foodCostAnswer) {
          const costValue = foodCostAnswer.value as string
          if (costValue.includes('Under 25%')) score += 20
          else if (costValue.includes('25-30%')) score += 15
          else if (costValue.includes('30-35%')) score += 10
          else if (costValue.includes('35-40%')) score += 5
          else score += 0
        }
        
        const inventoryAnswer = answers.find(a => a.questionId === 'inventory_frequency')
        if (inventoryAnswer) {
          const invValue = inventoryAnswer.value as string
          if (invValue.includes('Daily')) score += 15
          else if (invValue.includes('Weekly')) score += 12
          else if (invValue.includes('Biweekly')) score += 8
          else if (invValue.includes('Monthly')) score += 5
          else score += 0
        }
        
        return Math.min(100, Math.max(0, score))
      },
      getRecommendations: () => {
        const { answers, calculateScore } = get()
        const score = calculateScore()
        const recommendations = []
        
        if (score < 40) {
          recommendations.push('Start with basic inventory tracking')
          recommendations.push('Consider Tier 1 service for immediate wins')
          recommendations.push('Focus on vendor price comparisons')
        } else if (score < 70) {
          recommendations.push('You have good foundation - ready for optimization')
          recommendations.push('Consider Tier 2 service for vendor negotiations')
          recommendations.push('Improve inventory accuracy')
        } else {
          recommendations.push('Excellent setup - ready for advanced optimization')
          recommendations.push('Consider Tier 3 service for comprehensive audit')
          recommendations.push('Focus on theoretical vs actual COGS analysis')
        }
        
        return recommendations
      }
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({ 
        answers: state.answers, 
        currentStep: state.currentStep 
      })
    }
  )
)
