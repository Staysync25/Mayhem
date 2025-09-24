// Analytics event tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // PostHog tracking
    if (window.posthog) {
      window.posthog.capture(eventName, properties)
    }
    
    // Vercel Analytics
    if (window.va) {
      window.va.track(eventName, properties)
    }
  }
}

// Specific event helpers
export const trackOnboardingStep = (stepName: string, stepIndex: number) => {
  trackEvent('onboarding_step', { step_name: stepName, step_index: stepIndex })
}

export const trackPlanSelected = (tier: number) => {
  trackEvent('plan_selected', { tier })
}

export const trackCheckoutStart = (tier: number, priceId: string) => {
  trackEvent('checkout_start', { tier, priceId })
}

export const trackFileUpload = (name: string, size: number) => {
  trackEvent('file_upload', { name, size })
}

export const trackSubmissionCreated = (id: string) => {
  trackEvent('submission_created', { id })
}

export const trackSubmissionPaid = (id: string, tier: number) => {
  trackEvent('submission_paid', { id, tier })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    posthog?: any
    va?: any
  }
}
