# Nutrition AI Guardrails & Data Quality Framework

## Overview
This document outlines the comprehensive system for maintaining high-quality nutrition data in the Felony Fitness app while preventing AI hallucinations and inconsistencies.

## Core Principles

### 1. **Data Consistency First**
- All nutritional values must fall within realistic ranges
- Calorie calculations must be consistent with macronutrient breakdown
- Serving sizes must follow standardized patterns

### 2. **Category by Primary Ingredient**
- Foods are categorized by their main ingredient, not preparation method
- No vague categories like "Snacks" or "Prepared Foods"
- Fitness-focused categorization (chips go under "Grains" not "Vegetables")

### 3. **Duplicate Prevention**
- Smart matching prevents database bloat
- Similar foods are flagged before creation
- Users are guided to existing entries when appropriate

### 4. **Quality Scoring**
- Every food entry gets a quality score
- Local/verified data gets highest priority
- AI-generated data is validated and capped

## Validation Rules

### Nutritional Ranges (Per Serving)
```typescript
const LIMITS = {
  calories: { min: 0, max: 2000 },
  protein_g: { min: 0, max: 100 },
  carbs_g: { min: 0, max: 200 },
  fat_g: { min: 0, max: 100 }
};
```

### Calorie Consistency Check
- Estimated calories = (carbs × 4) + (protein × 4) + (fat × 9)
- Actual calories must be within 30% of estimated
- Flags major inconsistencies for review

### Category Enforcement
```
Valid Categories:
- Vegetables
- Fruits  
- Meat & Poultry
- Seafood
- Dairy & Eggs
- Grains, Bread & Pasta
- Protein & Supplements
- Beverages
- Breakfast & Cereals
- Desserts & Sweets
```

### Serving Description Patterns
- "1 cup", "100g", "1 medium", "1 slice"
- Must follow standardized formats
- No ambiguous descriptions like "1 serving"

## AI Prompt Engineering

### Enhanced Prompt Structure
```
You are a nutrition database expert. Provide accurate nutritional information for "{query}".

STRICT REQUIREMENTS:
1. Return 1-3 common serving sizes only
2. Use ONLY approved categories
3. Standard serving descriptions
4. Realistic nutritional values
5. Categorize by PRIMARY ingredient
6. Ensure calorie consistency

Format as valid JSON with exact schema.
```

### Temperature & Model Settings
- **Model**: GPT-4o (most accurate for factual data)
- **Temperature**: 0.1 (very low for consistency)
- **Response Format**: JSON object (structured output)
- **Max Tokens**: 1000 (sufficient for 3 foods)

## Database Guardrails

### Enhanced `log_food_item` Function
- **Input Validation**: Required fields checked
- **Nutrition Capping**: Values capped at maximum limits
- **Category Suggestion**: Auto-suggests based on food name
- **Duplicate Detection**: Prevents similar food creation
- **Quality Scoring**: Tracks data source and reliability

### Audit System
- **Real-time Validation**: Nutrition data validated on insert
- **Outlier Detection**: Flags unusual values for review
- **Category Analysis**: Identifies misaligned categories
- **Duplicate Scanning**: Finds potential duplicates

## Implementation Strategy

### Phase 1: Current Data Audit ✅
- [x] Analyze existing 83 NULL values
- [x] Fix category misalignments
- [x] Apply realistic nutritional values
- [x] Result: 100% NULL elimination

### Phase 2: Enhanced Edge Functions
- [x] Create `food-search-v2` with guardrails
- [x] Create `nutrition-audit` for ongoing analysis
- [x] Enhanced database functions with validation

### Phase 3: Client-Side Integration
- [ ] Update frontend to use new guardrail endpoints
- [ ] Display quality scores to users
- [ ] Implement duplicate warnings
- [ ] Add manual override capabilities

### Phase 4: Continuous Monitoring
- [ ] Regular audit reports
- [ ] Quality trend analysis
- [ ] AI model performance tracking
- [ ] User feedback integration

## Error Handling & Fallbacks

### Validation Failures
```typescript
if (!nutritionCheck.isValid) {
  return {
    error: "Validation failed",
    details: nutritionCheck.errors,
    suggested_action: "Review and correct values"
  };
}
```

### AI API Failures
- Fallback to local database search
- Return cached results when possible
- Graceful degradation with user notification

### Duplicate Detection
```typescript
if (duplicateFound) {
  return {
    warning: "Similar food exists",
    alternatives: similarFoods,
    action: "review_existing"
  };
}
```

## Monitoring & Analytics

### Quality Metrics
- **Validation Pass Rate**: % of AI-generated data passing validation
- **Duplicate Prevention**: Number of duplicates caught
- **Category Accuracy**: % of foods in correct categories
- **User Acceptance**: Rate of AI suggestions accepted

### Regular Audits
- **Weekly**: Nutrition outlier review
- **Monthly**: Category distribution analysis
- **Quarterly**: Full database quality assessment
- **Annually**: AI model performance evaluation

## Best Practices for Trainers/Admins

### Manual Food Entry
1. Always check for existing similar foods first
2. Use primary ingredient for categorization
3. Provide multiple realistic serving sizes
4. Verify calorie consistency before submitting

### Quality Review Process
1. Flag entries with quality scores below 80
2. Review all AI-generated entries monthly
3. Validate user-reported nutritional inconsistencies
4. Update categories based on audit recommendations

## Future Enhancements

### Advanced AI Features
- **Nutrient Density Scoring**: Rank foods by nutritional value
- **Meal Compatibility**: Suggest complementary foods
- **Portion Size Intelligence**: Recommend appropriate serving sizes
- **Cultural Adaptation**: Region-specific food variations

### Machine Learning Improvements
- **User Preference Learning**: Adapt suggestions to user habits
- **Quality Prediction**: Predict data quality before generation
- **Anomaly Detection**: Advanced outlier identification
- **Feedback Loop**: Learn from user corrections

## Conclusion

This comprehensive guardrail system ensures:
- **Consistent** nutritional data across all sources
- **Accurate** AI-generated content with validation
- **Clean** database without duplicates or inconsistencies
- **Reliable** user experience with quality indicators
- **Scalable** system that improves over time

The combination of strict validation rules, smart categorization, duplicate prevention, and continuous monitoring creates a robust foundation for nutrition data quality in the Felony Fitness app.