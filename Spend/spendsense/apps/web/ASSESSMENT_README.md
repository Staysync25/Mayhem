# SpendSense Assessment System

## Overview

The SpendSense Assessment is a Quittr-inspired questionnaire system designed to evaluate restaurant owners' readiness for cost optimization services. It provides personalized recommendations and service tier suggestions based on responses.

## Features

### Question Types
- **Multiple Choice**: Select from predefined options
- **Yes/No**: Binary choice questions
- **Scale**: 1-10 rating scale with visual slider
- **Text**: Open-ended text responses

### Assessment Categories
1. **Business Basics**: Restaurant name, type, locations
2. **Contact Information**: Owner details and location
3. **Operations Snapshot**: Vendors, spend, inventory, systems
4. **Goals & Pain Points**: Challenges and optimization goals

### Scoring & Recommendations
- Calculates optimization readiness score (0-100%)
- Generates personalized recommendations based on responses
- Suggests appropriate service tiers (Tier 1, 2, or 3)
- Identifies specific pain points and solutions

## File Structure

```
app/assessment/
├── page.tsx                    # Assessment entry point
├── layout.tsx                  # Assessment layout with progress bar
├── step-1.tsx                  # Introduction/welcome step
└── step-[stepId]/
    └── page.tsx               # Dynamic step handler

lib/
└── assessment-store.ts         # Zustand store for assessment state

components/
├── QuestionCard.tsx           # Reusable question component
└── ProgressBar.tsx            # Progress tracking component

app/(marketing)/
├── assessment/page.tsx        # Assessment landing page
└── page.tsx                   # Updated marketing page with assessment links
```

## Usage

### Starting an Assessment
```typescript
import { useAssessmentStore } from '@/lib/assessment-store'

const { setCurrentStep } = useAssessmentStore()
setCurrentStep(1) // Start assessment
```

### Adding Answers
```typescript
const { addAnswer } = useAssessmentStore()
addAnswer('question_id', 'answer_value')
```

### Getting Results
```typescript
const { calculateScore, generateRecommendations } = useAssessmentStore()
const score = calculateScore()
const recommendations = generateRecommendations(score)
```

## Customization

### Adding New Questions
Edit the `defaultQuestions` array in `assessment-store.ts`:

```typescript
{
  id: 'new_question',
  text: 'Your question text?',
  type: 'multiple_choice',
  options: ['Option 1', 'Option 2'],
  category: 'category_name',
  weight: 1
}
```

### Modifying Scoring
Update the `calculateScore` function to change how responses are weighted and calculated.

### Customizing Recommendations
Modify the `generateRecommendations` function to provide different advice based on responses.

## Integration

The assessment integrates with the existing SpendSense onboarding flow:
- Assessment results can direct users to appropriate service tiers
- Contact information collected can pre-populate onboarding forms
- Assessment data can inform service recommendations

## Styling

The assessment uses Tailwind CSS with a modern, clean design inspired by Quittr:
- Gradient backgrounds
- Card-based layouts
- Smooth transitions
- Mobile-responsive design
- Progress indicators

## Data Persistence

Assessment progress is automatically saved using Zustand's persist middleware:
- Answers are stored in localStorage
- Users can resume incomplete assessments
- Data persists across browser sessions
