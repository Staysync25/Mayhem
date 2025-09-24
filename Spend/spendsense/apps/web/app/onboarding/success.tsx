'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Clock, FileText, Users } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'

export default function SuccessPage() {
  const router = useRouter()
  const { data, reset } = useOnboardingStore()

  useEffect(() => {
    // Reset the onboarding store after successful completion
    const timer = setTimeout(() => {
      reset()
    }, 5000)

    return () => clearTimeout(timer)
  }, [reset])

  const getPlanName = (tier: number) => {
    const plans = {
      1: 'Purchase Review & Opportunity Report',
      2: 'Vendor Negotiation & Price Comparisons', 
      3: 'Month-End Inventory Audit'
    }
    return plans[tier as keyof typeof plans] || 'Unknown Plan'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-primary">
              Thanks—your SpendSense checkup is in.
            </h1>
            <p className="text-lg text-muted-foreground">
              We've received your submission for <strong>{getPlanName(data.planTier || 1)}</strong> 
              {data.businessName && ` for ${data.businessName}`}.
            </p>
          </div>

          <div className="card p-6 text-left">
            <h2 className="text-xl font-semibold mb-4">What happens next:</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Review & Analysis (5-7 days)</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your files and conduct a comprehensive analysis of your food costs and vendor relationships.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Report Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a detailed report with specific recommendations, vendor comparisons, and actionable next steps.
                  </p>
                </div>
              </div>
              
              {(data.planTier === 2 || data.planTier === 3) && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Vendor Outreach</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll start reaching out to your current vendors and potential new suppliers to negotiate better pricing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              We'll send you updates via email as we progress through your analysis. 
              If you have any questions, don't hesitate to reach out.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center gap-2"
              >
                View Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:support@spendsense.com"
                className="btn-secondary inline-flex items-center gap-2"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
