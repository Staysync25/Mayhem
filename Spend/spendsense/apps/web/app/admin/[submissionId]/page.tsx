'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, Calendar, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { db } from '@/lib/db'

interface SubmissionDetail {
  id: string
  businessName: string
  website: string
  locationsCount: number
  cuisineType: string
  address: string
  contactName: string
  phone: string
  email: string
  monthlySpend: number
  monthlySales: number
  foodCostPct: number
  inventoryFrequency: string
  inventoryMethod: string
  systemsUsed: string
  vendors: string
  primeVendorPct: number
  goals: string
  planTier: number
  status: string
  createdAt: string
  files: Array<{
    id: string
    filename: string
    uploadedAt: string
  }>
}

export default function AdminSubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implement actual data fetching with admin authentication
    // For now, show placeholder
    setLoading(false)
  }, [params.submissionId])

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      in_review: 'bg-purple-100 text-purple-800',
      complete: 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPlanName = (tier: number) => {
    const plans = {
      1: 'Purchase Review & Opportunity Report',
      2: 'Vendor Negotiation & Price Comparisons',
      3: 'Month-End Inventory Audit'
    }
    return plans[tier as keyof typeof plans] || 'Unknown Plan'
  }

  const downloadFile = async (fileId: string, filename: string) => {
    // TODO: Implement file download with signed URL
    console.log('Download file:', fileId, filename)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submission details...</p>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Submission not found</h1>
            <button
              onClick={() => router.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary">{submission.businessName}</h1>
              <p className="text-muted-foreground">Submission ID: {submission.id}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{submission.businessName}</div>
                    {submission.website && (
                      <div className="text-sm text-muted-foreground">{submission.website}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{submission.locationsCount} location{submission.locationsCount > 1 ? 's' : ''}</div>
                    <div className="text-sm text-muted-foreground">{submission.cuisineType}</div>
                  </div>
                </div>
                
                {submission.address && (
                  <div className="text-sm text-muted-foreground">{submission.address}</div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{submission.contactName}</div>
                    <div className="text-sm text-muted-foreground">{submission.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">{submission.phone}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Spend:</span>
                  <span className="font-medium">${submission.monthlySpend.toLocaleString()}</span>
                </div>
                {submission.monthlySales && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Sales:</span>
                    <span className="font-medium">${submission.monthlySales.toLocaleString()}</span>
                  </div>
                )}
                {submission.foodCostPct && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food Cost %:</span>
                    <span className="font-medium">{submission.foodCostPct}%</span>
                  </div>
                )}
                {submission.primeVendorPct && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prime Vendor %:</span>
                    <span className="font-medium">{submission.primeVendorPct}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Operations</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Inventory Frequency:</span>
                  <div className="font-medium">{submission.inventoryFrequency}</div>
                </div>
                {submission.inventoryMethod && (
                  <div>
                    <span className="text-muted-foreground">Inventory Method:</span>
                    <div className="font-medium">{submission.inventoryMethod}</div>
                  </div>
                )}
                {submission.systemsUsed && (
                  <div>
                    <span className="text-muted-foreground">Systems Used:</span>
                    <div className="font-medium">{submission.systemsUsed}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Vendors & Goals</h2>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground">Current Vendors:</span>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{submission.vendors}</pre>
                </div>
              </div>
              {submission.goals && (
                <div>
                  <span className="text-muted-foreground">Goals:</span>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{submission.goals}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Uploaded Files</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {submission.files.length} file{submission.files.length !== 1 ? 's' : ''}
                </div>
                {getStatusBadge(submission.status)}
              </div>
            </div>
            
            {submission.files.length > 0 ? (
              <div className="space-y-2">
                {submission.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{file.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(file.id, file.filename)}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No files uploaded</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Submission Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Plan:</span>
                <div className="font-medium">{getPlanName(submission.planTier)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(submission.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
