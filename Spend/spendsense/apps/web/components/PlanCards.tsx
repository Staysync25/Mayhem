'use client'

import { Check } from 'lucide-react'

interface Plan {
  id: number
  name: string
  description: string
  features: string[]
  price: string
  popular?: boolean
}

interface PlanCardsProps {
  selectedPlan: number | null
  onPlanSelect: (planId: number) => void
}

const plans: Plan[] = [
  {
    id: 1,
    name: 'Purchase Review & Opportunity Report',
    description: 'Audit last 4–8 weeks of invoices & price lists',
    features: [
      'Audit last 4–8 weeks of invoices & price lists',
      'Savings by brand/pack/vendor with benchmarks',
      'Prioritized action plan'
    ],
    price: '$299'
  },
  {
    id: 2,
    name: 'Vendor Negotiation & Price Comparisons',
    description: 'Everything in Tier 1, plus vendor negotiations',
    features: [
      'Everything in Tier 1, plus:',
      'We negotiate pricing with current vendors',
      'Cross-vendor price comps (including new vendors)',
      'Lock savings in writing'
    ],
    price: '$599',
    popular: true
  },
  {
    id: 3,
    name: 'Month-End Inventory Audit',
    description: 'Complete solution with inventory management',
    features: [
      'Everything in Tier 1 & 2, plus:',
      'End-of-month inventory audit & variance review',
      'Count cadence & method tune-up',
      'Tie-out to theoretical vs. actual'
    ],
    price: '$999'
  }
]

export function PlanCards({ selectedPlan, onPlanSelect }: PlanCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative card p-6 cursor-pointer transition-all duration-200 ${
            selectedPlan === plan.id
              ? 'ring-2 ring-accent bg-accent/5'
              : 'hover:shadow-md'
          } ${plan.popular ? 'border-accent' : ''}`}
          onClick={() => onPlanSelect(plan.id)}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            <div className="text-3xl font-bold text-primary">{plan.price}</div>
          </div>
          
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
              selectedPlan === plan.id
                ? 'bg-accent border-accent'
                : 'border-muted-foreground'
            }`}>
              {selectedPlan === plan.id && (
                <Check className="h-3 w-3 text-white m-0.5" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
