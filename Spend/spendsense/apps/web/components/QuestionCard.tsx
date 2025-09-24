'use client'

import { useState } from 'react'
import { useAssessmentStore } from '@/lib/assessment-store'
import { Question } from '@/lib/assessment-store'

interface QuestionCardProps {
  question: Question
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export default function QuestionCard({ question, onNext, onPrevious, isFirst, isLast }: QuestionCardProps) {
  const { addAnswer, data } = useAssessmentStore()
  const [value, setValue] = useState<string | number>(
    data.answers.find(a => a.questionId === question.id)?.value || ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value !== '' && value !== null && value !== undefined) {
      addAnswer(question.id, value)
      onNext()
    }
  }

  const handleValueChange = (newValue: string | number) => {
    setValue(newValue)
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleValueChange(e.target.value)}
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
                name={question.id}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => handleValueChange(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={value === 'no'}
                onChange={(e) => handleValueChange(e.target.value)}
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
              <span>{question.min}</span>
              <span>{question.max}</span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.step || 1}
              value={value || question.min}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{value || question.min}</span>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-4 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {question.text}
        </h2>
        {renderQuestionInput()}
      </div>
      
      <div className="flex justify-between">
        {!isFirst && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
        )}
        
        <div className="ml-auto">
          <button
            type="submit"
            disabled={value === '' || value === null || value === undefined}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? 'Get Results' : 'Next'}
          </button>
        </div>
      </div>
    </form>
  )
}
