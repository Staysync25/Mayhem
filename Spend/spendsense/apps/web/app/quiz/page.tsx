'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuizStore } from '@/lib/quiz-store'

export default function QuizPage() {
  const router = useRouter()
  const { currentStep, totalSteps, questions, answers, setCurrentStep, addAnswer, calculateScore, getRecommendations, reset } = useQuizStore()
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('')

  // Show intro if on step 1
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <Image
            src="/logo.png"
            alt="SpendSense"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Your Cost Savings Potential
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Take our quick assessment to identify opportunities to reduce your food costs by 15-25%
          </p>
          <button
            onClick={() => setCurrentStep(2)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </div>
    )
  }

  // Show results if on last step
  if (currentStep > questions.length) {
    const score = calculateScore()
    const recommendations = getRecommendations()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-blue-600">{score}%</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Optimization Score
            </h1>
            <p className="text-gray-600">
              Based on your responses, here are your personalized recommendations
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Recommendations:</h2>
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-blue-600 font-bold">{index + 1}.</span>
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center space-y-4">
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Get Started with SpendSense
            </button>
            <div>
              <button
                onClick={() => {
                  reset()
                  router.push('/quiz')
                }}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Take Assessment Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show current question
  const currentQuestion = questions[currentStep - 2] // -2 because step 1 is intro
  const existingAnswer = answers.find(a => a.questionId === currentQuestion.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentAnswer !== '' && currentAnswer !== null) {
      addAnswer(currentQuestion.id, currentAnswer)
      setCurrentStep(currentStep + 1)
      setCurrentAnswer('')
    }
  }

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'yes_no':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={currentQuestion.id}
                value="yes"
                checked={currentAnswer === 'yes'}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={currentQuestion.id}
                value="no"
                checked={currentAnswer === 'no'}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        )
      
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{currentQuestion.min}</span>
              <span>{currentQuestion.max}</span>
            </div>
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={currentAnswer || currentQuestion.min}
              onChange={(e) => setCurrentAnswer(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center">
              <span className="text-3xl font-bold text-blue-600">{currentAnswer || currentQuestion.min}</span>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentStep - 1} of {questions.length}</span>
            <span>{Math.round(((currentStep - 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {currentQuestion.text}
          </h2>
          
          {renderQuestionInput()}
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            <button
              type="submit"
              disabled={currentAnswer === '' || currentAnswer === null}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === questions.length + 1 ? 'Get Results' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
