'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Question {
  id: string
  text: string
  type: 'multiple_choice' | 'scale' | 'yes_no' | 'text'
  options?: string[]
  min?: number
  max?: number
  step?: number
  category: string
  weight: number
}

export interface Answer {
  questionId: string
  value: string | number
  timestamp: Date
}

export interface AssessmentData {
  answers: Answer[]
  currentStep: number
  completedAt?: Date
  score?: number
  recommendations?: string[]
}

interface AssessmentStore {
  currentStep: number
  totalSteps: number
  data: AssessmentData
  questions: Question[]
  setCurrentStep: (step: number) => void
  addAnswer: (questionId: string, value: string | number) => void
  calculateScore: () => number
  generateRecommendations: (score: number) => string[]
  reset: () => void
  isCompleted: boolean
}

// Restaurant cost optimization assessment questions
const defaultQuestions: Question[] = [
  // Category: Business Basics
  {
    id: 'business_name',
    text: 'What is your restaurant name?',
    type: 'text',
    category: 'business',
    weight: 1
  },
  {
    id: 'cuisine_type',
    text: 'What type of cuisine/concept do you operate?',
    type: 'multiple_choice',
    options: ['Fast Casual', 'Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe/Bakery', 'Food Truck', 'Other'],
    category: 'business',
    weight: 1
  },
  {
    id: 'locations_count',
    text: 'How many locations do you operate?',
    type: 'multiple_choice',
    options: ['1', '2-3', '4-10', '11-25', '25+'],
    category: 'business',
    weight: 1
  },
  {
    id: 'website',
    text: 'What is your website? (optional)',
    type: 'text',
    category: 'business',
    weight: 0.5
  },
  
  // Category: Contact Information
  {
    id: 'contact_name',
    text: 'What is your name?',
    type: 'text',
    category: 'contact',
    weight: 1
  },
  {
    id: 'phone',
    text: 'What is your phone number?',
    type: 'text',
    category: 'contact',
    weight: 1
  },
  {
    id: 'email',
    text: 'What is your email address?',
    type: 'text',
    category: 'contact',
    weight: 1
  },
  {
    id: 'address',
    text: 'What is your restaurant address?',
    type: 'text',
    category: 'contact',
    weight: 1
  },
  
  // Category: Operations Snapshot
  {
    id: 'vendors',
    text: 'Who are your main food vendors? (list 3-5)',
    type: 'text',
    category: 'operations',
    weight: 1
  },
  {
    id: 'monthly_spend',
    text: 'What is your approximate monthly food spend?',
    type: 'multiple_choice',
    options: ['Under $5,000', '$5,000-$15,000', '$15,000-$50,000', '$50,000-$100,000', '$100,000+'],
    category: 'operations',
    weight: 1
  },
  {
    id: 'food_cost_pct',
    text: 'What is your current food cost percentage?',
    type: 'multiple_choice',
    options: ['Under 25%', '25-30%', '30-35%', '35-40%', 'Over 40%', 'Not sure'],
    category: 'operations',
    weight: 1
  },
  {
    id: 'inventory_frequency',
    text: 'How often do you do inventory?',
    type: 'multiple_choice',
    options: ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Inconsistent', 'Never'],
    category: 'operations',
    weight: 1
  },
  {
    id: 'inventory_method',
    text: 'What inventory method do you use?',
    type: 'multiple_choice',
    options: ['By area (walk-in, dry storage, etc.)', 'By category (proteins, produce, etc.)', 'Recipe-level tracking', 'Simple counting', 'No formal method'],
    category: 'operations',
    weight: 1
  },
  {
    id: 'systems_used',
    text: 'What systems do you currently use? (select all that apply)',
    type: 'multiple_choice',
    options: ['POS System', 'Inventory Management', 'Accounting Software', 'Recipe Management', 'None/Manual'],
    category: 'operations',
    weight: 1
  },
  {
    id: 'prime_vendor_pct',
    text: 'What percentage of your spend goes to your #1 vendor? (optional)',
    type: 'multiple_choice',
    options: ['Under 25%', '25-40%', '40-60%', '60-80%', 'Over 80%', 'Not sure'],
    category: 'operations',
    weight: 0.5
  },
  {
    id: 'monthly_sales',
    text: 'What are your approximate monthly sales? (optional)',
    type: 'multiple_choice',
    options: ['Under $25,000', '$25,000-$75,000', '$75,000-$150,000', '$150,000-$300,000', '$300,000+', 'Prefer not to say'],
    category: 'operations',
    weight: 0.5
  },
  
  // Category: Goals & Pain Points
  {
    id: 'goals',
    text: 'What would make this cost optimization a win for you?',
    type: 'multiple_choice',
    options: ['Reduce food costs by 15-25%', 'Better vendor relationships', 'Improved inventory accuracy', 'Streamlined operations', 'All of the above'],
    category: 'goals',
    weight: 1
  },
  {
    id: 'biggest_challenge',
    text: 'What is your biggest challenge with food costs?',
    type: 'multiple_choice',
    options: ['Waste/spoilage', 'Vendor pricing', 'Portion control', 'Menu costing', 'Inventory tracking', 'Time management'],
    category: 'goals',
    weight: 1
  },
  {
    id: 'readiness',
    text: 'How ready are you to implement changes?',
    type: 'scale',
    min: 1,
    max: 10,
    step: 1,
    category: 'goals',
    weight: 1
  }
]

const initialState = {
  currentStep: 1,
  totalSteps: defaultQuestions.length,
  data: {
    answers: [],
    currentStep: 1
  },
  questions: defaultQuestions,
  isCompleted: false
}

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCurrentStep: (step) => set((state) => ({
        currentStep: step,
        data: { ...state.data, currentStep: step }
      })),
      addAnswer: (questionId, value) => set((state) => {
        const existingAnswerIndex = state.data.answers.findIndex(a => a.questionId === questionId)
        let newAnswers = [...state.data.answers]
        
        if (existingAnswerIndex >= 0) {
          newAnswers[existingAnswerIndex] = { questionId, value, timestamp: new Date() }
        } else {
          newAnswers.push({ questionId, value, timestamp: new Date() })
        }
        
        return {
          data: { ...state.data, answers: newAnswers }
        }
      }),
      calculateScore: () => {
        const state = get()
        const { answers, questions } = state
        
        if (answers.length === 0) return 0
        
        let totalScore = 0
        let maxPossibleScore = 0
        
        questions.forEach(question => {
          const answer = answers.find(a => a.questionId === question.id)
          if (answer) {
            let score = 0
            
            switch (question.type) {
              case 'scale':
                score = Number(answer.value)
                break
              case 'multiple_choice':
                const optionIndex = question.options?.indexOf(answer.value as string) || 0
                score = optionIndex + 1
                break
              case 'yes_no':
                score = answer.value === 'yes' ? 1 : 0
                break
              case 'text':
                score = 1 // Text answers get a default score
                break
            }
            
            totalScore += score * question.weight
            maxPossibleScore += (question.type === 'scale' ? question.max || 10 : question.options?.length || 2) * question.weight
          }
        })
        
        const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
        return Math.round(percentage)
      }),
      generateRecommendations: (score) => {
        const recommendations = []
        const state = get()
        const { answers } = state.data
        
        // Analyze specific answers for targeted recommendations
        const foodCostAnswer = answers.find(a => a.questionId === 'food_cost_pct')?.value
        const inventoryFreqAnswer = answers.find(a => a.questionId === 'inventory_frequency')?.value
        const systemsAnswer = answers.find(a => a.questionId === 'systems_used')?.value
        const biggestChallenge = answers.find(a => a.questionId === 'biggest_challenge')?.value
        
        // High-level recommendations based on score
        if (score < 30) {
          recommendations.push('Start with basic inventory tracking and vendor analysis')
          recommendations.push('Consider Tier 1 service for immediate quick wins')
          recommendations.push('Focus on building foundational systems first')
        } else if (score < 60) {
          recommendations.push('You have good operational foundation - ready for optimization')
          recommendations.push('Consider Tier 2 service for vendor negotiations and price comparisons')
          recommendations.push('Focus on inventory accuracy and waste reduction')
        } else if (score < 80) {
          recommendations.push('Strong operational setup - ready for advanced optimization')
          recommendations.push('Consider Tier 3 service for comprehensive inventory audit')
          recommendations.push('Focus on theoretical vs actual COGS analysis')
        } else {
          recommendations.push('Excellent operational foundation - ready for maximum optimization')
          recommendations.push('Consider Tier 3 service for complete cost optimization')
          recommendations.push('Focus on advanced analytics and continuous improvement')
        }
        
        // Specific recommendations based on answers
        if (foodCostAnswer && ['35-40%', 'Over 40%'].includes(foodCostAnswer as string)) {
          recommendations.push('High food costs detected - prioritize vendor negotiations and portion control')
        }
        
        if (inventoryFreqAnswer && ['Inconsistent', 'Never', 'Monthly'].includes(inventoryFreqAnswer as string)) {
          recommendations.push('Inventory tracking needs improvement - consider weekly/biweekly counts')
        }
        
        if (systemsAnswer && systemsAnswer === 'None/Manual') {
          recommendations.push('Consider implementing POS and inventory management systems')
        }
        
        if (biggestChallenge === 'Waste/spoilage') {
          recommendations.push('Focus on inventory rotation and waste tracking systems')
        } else if (biggestChallenge === 'Vendor pricing') {
          recommendations.push('Prioritize vendor negotiations and competitive pricing analysis')
        }
        
        return recommendations
      },
      reset: () => set(initialState),
      isCompleted: false
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({ 
        data: state.data, 
        currentStep: state.currentStep,
        isCompleted: state.isCompleted 
      })
    }
  )
)
