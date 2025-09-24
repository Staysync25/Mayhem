'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { db } from '@/lib/db'

interface Submission {
  id: string
  businessName: string
  planTier: number
  status: string
  createdAt: string
  files: Array<{
    id: string
    filename: string
    uploadedAt: string
  }>
}

export default function DashboardPage() {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implement actual data fetching with user authentication
    // For now, show a placeholder
    setLoading(false)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_review':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Payment Pending'
      case 'paid':
        return 'Analysis in Progress'
      case 'in_review':
        return 'Report Being Prepared'
      case 'complete':
        return 'Report Ready'
      default:
        return 'Unknown Status'
    }
  }

  const getPlanName = (tier: number) => {
    const plans = {
      1: 'Purchase Review & Opportunity Report',
      2: 'Vendor Negotiation & Price Comparisons',
      3: 'Month-End Inventory Audit'
    }
    return plans[tier as keyof typeof plans] || 'Unknown Plan'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
              <h1 className="text-3xl font-bold text-primary">No submissions yet</h1>
              <p className="text-lg text-muted-foreground">
                Start your first SpendSense checkup to see your analysis here.
              </p>
            </div>
            <a
              href="/onboarding"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Start Your Checkup
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
              <p className="text-muted-foreground">Track your SpendSense analysis progress</p>
            </div>
            <a
              href="/onboarding"
              className="btn-primary"
            >
              New Checkup
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Current Submission</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{submission.businessName}</h3>
                  <p className="text-sm text-muted-foreground">{getPlanName(submission.planTier)}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.status)}
                  <span className="font-medium">{getStatusText(submission.status)}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
              {submission.files.length > 0 ? (
                <div className="space-y-2">
                  {submission.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.filename}</span>
                      </div>
                      <button className="text-accent hover:text-accent/80">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No files uploaded yet</p>
              )}
            </div>
          </div>

          {submission.status === 'complete' && (
            <div className="card p-6 bg-accent/5 border-accent/20">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
                <h2 className="text-xl font-semibold">Your Report is Ready!</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Your comprehensive analysis is complete. Download your report to see the savings opportunities we've identified.
              </p>
              <button className="btn-primary">
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
