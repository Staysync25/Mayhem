import { ProgressBar } from '@/components/ProgressBar'

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ProgressBar />
            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
