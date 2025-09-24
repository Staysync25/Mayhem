'use client'

import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/lib/assessment-store'
import QuestionCard from '@/components/QuestionCard'

interface StepPageProps {
  params: {
    stepId: string
  }
}

export default function StepPage({ params }: StepPageProps) {
  const router = useRouter()
  const { questions, currentStep, setCurrentStep, calculateScore, generateRecommendations, data } = useAssessmentStore()
  const stepNumber = parseInt(params.stepId)
  
  // Redirect to step 1 if invalid step
  if (stepNumber < 1 || stepNumber > questions.length + 1) {
    router.push('/assessment/step-1')
    return null
  }

  // Handle results page (step after last question)
  if (stepNumber > questions.length) {
    const score = calculateScore()
    const recommendations = generateRecommendations(score)
    
    return (
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-blue-600">{score}%</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Optimization Readiness Score
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Based on your responses, here's your assessment and personalized recommendations.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 text-left">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Recommendations:</h2>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">{index + 1}.</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready to get started?</h3>
          <p className="text-gray-600 mb-4">
            Based on your assessment, we recommend our tailored service tier to maximize your savings potential.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Choose Your Service Tier
          </button>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => {
              useAssessmentStore.getState().reset()
              router.push('/assessment/step-1')
            }}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Take Assessment Again
          </button>
        </div>
      </div>
    )
  }

  // Handle question steps
  const question = questions[stepNumber - 1]
  
  const handleNext = () => {
    if (stepNumber < questions.length) {
      setCurrentStep(stepNumber + 1)
      router.push(`/assessment/step-${stepNumber + 1}`)
    } else {
      setCurrentStep(stepNumber + 1)
      router.push(`/assessment/step-${stepNumber + 1}`)
    }
  }
  
  const handlePrevious = () => {
    if (stepNumber > 1) {
      setCurrentStep(stepNumber - 1)
      router.push(`/assessment/step-${stepNumber - 1}`)
    }
  }

  return (
    <QuestionCard
      question={question}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isFirst={stepNumber === 1}
      isLast={stepNumber === questions.length}
    />
  )
}
