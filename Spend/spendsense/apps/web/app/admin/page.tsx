'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Search, Filter } from 'lucide-react'
import { db } from '@/lib/db'

interface Submission {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
  monthlySpend: number
  foodCostPct: number
  inventoryFrequency: string
  planTier: number
  status: string
  createdAt: string
  files: Array<{
    id: string
    filename: string
  }>
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // TODO: Implement actual data fetching with admin authentication
    // For now, show placeholder data
    setLoading(false)
  }, [])

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      in_review: 'bg-purple-100 text-purple-800',
      complete: 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPlanName = (tier: number) => {
    const plans = {
      1: 'Tier 1',
      2: 'Tier 2', 
      3: 'Tier 3'
    }
    return plans[tier as keyof typeof plans] || 'Unknown'
  }

  const exportCSV = () => {
    // TODO: Implement CSV export
    console.log('Export CSV functionality')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage submissions and track progress</p>
            </div>
            <button
              onClick={exportCSV}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <div className="card p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by business name, contact, or email..."
                    className="input pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="paid">Paid</option>
                  <option value="in_review">In Review</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Business</th>
                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 font-medium">Monthly Spend</th>
                    <th className="text-left py-3 px-4 font-medium">Food Cost %</th>
                    <th className="text-left py-3 px-4 font-medium">Inventory</th>
                    <th className="text-left py-3 px-4 font-medium">Plan</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Files</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{submission.businessName}</div>
                            <div className="text-sm text-muted-foreground">{submission.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{submission.contactName}</div>
                            <div className="text-sm text-muted-foreground">{submission.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          ${submission.monthlySpend.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {submission.foodCostPct ? `${submission.foodCostPct}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {submission.inventoryFrequency}
                        </td>
                        <td className="py-3 px-4">
                          {getPlanName(submission.planTier)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{submission.files.length}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/admin/${submission.id}`}
                              className="text-accent hover:text-accent/80"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
