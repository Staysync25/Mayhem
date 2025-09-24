import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Users, TrendingUp, BarChart3 } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="SpendSense"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-primary">SpendSense</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/quiz"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Take Assessment
              </Link>
              <Link
                href="/onboarding"
                className="btn-primary"
              >
                Start Free Checkup
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Image
              src="/logo.png"
              alt="SpendSense"
              width={120}
              height={120}
              className="mx-auto mb-8"
            />
            <h1 className="text-5xl font-bold text-primary mb-6">
              Turn invoices into opportunities.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get a comprehensive audit of your food costs, vendor pricing, and inventory management. 
              Discover savings opportunities that can reduce your food costs by 15-25%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quiz"
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Take Free Assessment
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/onboarding"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Start Full Checkup
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              What you'll get
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive analysis covers every aspect of your food cost management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Savings Audit</h3>
              <p className="text-muted-foreground">
                Identify price gaps by category, vendor leverage opportunities, and quick wins 
                that can immediately reduce your food costs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vendor Negotiation</h3>
              <p className="text-muted-foreground">
                We handle the negotiations with your current vendors and find new suppliers 
                to ensure you're getting the best possible pricing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Month-End Inventory Audit</h3>
              <p className="text-muted-foreground">
                Complete inventory management review with variance analysis and 
                recommendations for better count cadence and accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Highlight */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Not sure where to start? Take our free assessment
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Get a personalized optimization score and recommendations in just 2 minutes. 
              Discover your biggest opportunities for cost savings without any commitment.
            </p>
            <Link
              href="/quiz"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-colors font-semibold"
            >
              Take Free Assessment
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm mt-4 opacity-75">
              2 minutes • No commitment • Instant results
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Ready to reduce your food costs?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurants that have already discovered significant savings opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quiz"
              className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Take Free Assessment
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/onboarding"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Start Full Checkup
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="SpendSense"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-semibold text-primary">SpendSense</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Contact: <a href="mailto:sales@spendsense.com" className="hover:text-primary">sales@spendsense.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
