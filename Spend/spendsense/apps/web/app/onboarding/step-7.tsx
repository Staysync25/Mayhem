'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { FileDropzone } from '@/components/FileDropzone'
import { trackOnboardingStep } from '@/lib/events'

export default function Step7() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboardingStore()
  const [files, setFiles] = useState(data.files || [])

  const handleContinue = () => {
    updateData({ files })
    trackOnboardingStep('file_upload', 7)
    setCurrentStep(8)
    router.push('/onboarding/step-8')
  }

  const handleBack = () => {
    setCurrentStep(6)
    router.push('/onboarding/step-6')
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Upload Your Files</h1>
        <p className="text-muted-foreground">
          Attach recent invoices (4–8 weeks), price lists, inventory sheets, and food cost reports. 
          Multiple files are welcome.
        </p>
      </div>

      <FileDropzone 
        onFilesChange={setFiles}
        maxFiles={20}
        maxSize={50 * 1024 * 1024} // 50MB
      />

      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium mb-2">What files should I upload?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Recent invoices from your main vendors (last 4-8 weeks)</li>
          <li>• Current price lists or catalogs</li>
          <li>• Inventory sheets or reports</li>
          <li>• Food cost reports or P&L statements</li>
          <li>• Any vendor contracts or agreements</li>
        </ul>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleBack}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="btn-primary inline-flex items-center gap-2"
        >
          Continue to Checkout
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
