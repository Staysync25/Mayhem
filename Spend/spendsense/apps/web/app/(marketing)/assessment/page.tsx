'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calculator, TrendingUp, Users, Clock, Shield } from 'lucide-react'

export default function AssessmentLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <Image
              src="/logo.png"
              alt="SpendSense"
              width={120}
              height={120}
              className="mx-auto mb-6"
            />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Discover Your Cost Savings Potential
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take our comprehensive 2-minute assessment to identify opportunities to reduce your food costs by 15-25% and get a personalized action plan tailored to your restaurant's needs.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">COGS Analysis</h3>
              <p className="text-gray-600">Estimate theoretical vs actual costs and spot variance issues that are eating into your profits.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendor Optimization</h3>
              <p className="text-gray-600">Gauge vendor leverage and identify consolidation opportunities to negotiate better pricing.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Systems Triage</h3>
              <p className="text-gray-600">Identify fast wins in inventory management and process improvements.</p>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Immediate Insights:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Optimization readiness score</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Personalized recommendations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Service tier suggestions</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Assessment Covers:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Business & operational basics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Current systems & processes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Pain points & goals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>2 minutes to complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>100% confidential</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>15-25% potential savings</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-4 rounded-xl transition-colors"
            >
              Start Free Assessment
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-gray-500">
              No commitment required • Get results instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
