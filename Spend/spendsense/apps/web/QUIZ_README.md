# SpendSense Quiz System

## Overview

A clean, simple Quittr-inspired assessment system for restaurant cost optimization. Users take a quick quiz to get personalized recommendations and optimization scores.

## Features

- **7 targeted questions** covering key restaurant operations
- **Multiple question types**: Multiple choice, scale (1-10)
- **Smart scoring algorithm** based on readiness and operational efficiency
- **Personalized recommendations** with service tier suggestions
- **Progress tracking** with visual progress bar
- **Data persistence** using Zustand with localStorage

## File Structure

```
app/quiz/
└── page.tsx                    # Single-page quiz with all logic

lib/
└── quiz-store.ts              # Zustand store for quiz state

app/(marketing)/
└── page.tsx                   # Marketing page with quiz links
```

## Questions

1. **Restaurant Type**: Fast Casual, Fine Dining, etc.
2. **Number of Locations**: 1, 2-3, 4-10, etc.
3. **Monthly Food Spend**: Under $5K to $100K+
4. **Food Cost Percentage**: Under 25% to Over 40%
5. **Inventory Frequency**: Daily to Never
6. **Biggest Challenge**: Waste, pricing, portion control, etc.
7. **Readiness Scale**: 1-10 rating for implementation readiness

## Scoring

- **Readiness Score**: 10-50 points (based on 1-10 scale × 5)
- **Food Cost Efficiency**: 0-20 points (lower costs = higher score)
- **Inventory Management**: 0-15 points (more frequent = higher score)
- **Total**: 0-100 points

## Recommendations

Based on score ranges:
- **< 40**: Basic recommendations, Tier 1 service
- **40-70**: Good foundation, Tier 2 service
- **70+**: Advanced optimization, Tier 3 service

## Usage

### Starting Quiz
Navigate to `/quiz` or click "Take Assessment" from marketing page

### Quiz Flow
1. **Intro Screen**: Welcome and start button
2. **Questions**: 7 questions with progress tracking
3. **Results**: Score, recommendations, and next steps

### Integration
- Results page links to `/onboarding` for full service
- Marketing page has multiple quiz CTAs
- Clean, mobile-responsive design

## Customization

### Adding Questions
Edit the `questions` array in `quiz-store.ts`:

```typescript
{
  id: 'new_question',
  text: 'Your question?',
  type: 'multiple_choice',
  options: ['Option 1', 'Option 2']
}
```

### Modifying Scoring
Update the `calculateScore` function in `quiz-store.ts`

### Changing Recommendations
Modify the `getRecommendations` function in `quiz-store.ts`

## Styling

- **Design**: Clean, modern interface inspired by Quittr
- **Colors**: Blue gradient backgrounds with white cards
- **Responsive**: Mobile-first design with Tailwind CSS
- **Animations**: Smooth transitions and hover effects
