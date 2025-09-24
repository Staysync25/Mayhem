import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const STRIPE_PRICES = {
  T1: process.env.NEXT_PUBLIC_STRIPE_PRICE_T1!,
  T2: process.env.NEXT_PUBLIC_STRIPE_PRICE_T2!,
  T3: process.env.NEXT_PUBLIC_STRIPE_PRICE_T3!,
} as const

export type PlanTier = 1 | 2 | 3
