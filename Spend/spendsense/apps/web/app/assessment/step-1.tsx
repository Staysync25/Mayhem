'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, TrendingUp, Calculator, Users } from 'lucide-react'
import { useAssessmentStore } from '@/lib/assessment-store'

export default function AssessmentStep1() {
  const router = useRouter()
  const { setCurrentStep } = useAssessmentStore()

  const handleContinue = () => {
    setCurrentStep(2)
    router.push('/assessment/step-2')
  }

  return (
    <div className="text-center space-y-8">
      <div className="space-y-6">
        <Image
          src="/logo.png"
          alt="SpendSense"
          width={120}
          height={120}
          className="mx-auto"
        />
        <h1 className="text-4xl font-bold text-gray-900">
          Discover Your Cost Savings Potential
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Take our 2-minute assessment to identify opportunities to reduce your food costs by 15-25% and get a personalized action plan.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 py-8">
        <div className="bg-blue-50 p-6 rounded-xl">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">COGS Analysis</h3>
          <p className="text-sm text-gray-600">Estimate theoretical vs actual costs and spot variance issues</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl">
          <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Vendor Optimization</h3>
          <p className="text-sm text-gray-600">Gauge vendor leverage and consolidation opportunities</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl">
          <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Systems Triage</h3>
          <p className="text-sm text-gray-600">Identify fast wins in inventory and process improvements</p>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-colors"
        >
          Start Assessment
          <ArrowRight className="h-5 w-5" />
        </button>
        <p className="text-sm text-gray-500 mt-3">Takes about 2 minutes • Completely confidential</p>
      </div>
    </div>
  )
}
