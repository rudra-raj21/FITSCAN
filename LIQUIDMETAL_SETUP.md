# LiquidMetal AI SmartBuckets Integration Setup

This guide will help you set up SmartBuckets from LiquidMetal AI in your diet tracking application.

## 🚀 Getting Started

### 1. Get Your LiquidMetal AI API Key

1. **Sign Up**: Visit [LiquidMetal AI](https://liquidmetal.ai) and create an account
2. **Navigate to Dashboard**: Go to your dashboard after signing in
3. **Get API Key**: Find your API key in the settings or API section
4. **Copy the Key**: Keep this key secure - you'll need it for the next step

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your LiquidMetal AI API key to the `.env` file:
```env
VITE_LIQUIDMETAL_API_KEY=your_actual_api_key_here
```

3. Make sure your Supabase credentials are also configured:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

The integration uses the LiquidMetal AI client. Install it with:

```bash
npm install @liquidmetal-ai/client
```

## 📋 Features Overview

### SmartBuckets Integration includes:

1. **Nutrition Data Insights** 🧠
   - Pattern analysis of eating habits
   - Macronutrient balance tracking
   - Personalized recommendations
   - Nutritional warnings and achievements

2. **Semantic Meal Search** 🔍
   - Natural language meal searching
   - Advanced filtering options
   - Relevance scoring
   - Tag-based categorization

3. **Intelligent Storage** 💾
   - Automatic meal data synchronization
   - Vector embeddings for semantic search
   - Metadata enrichment
   - Personalized data isolation

## 🔧 How It Works

### Data Flow
1. **Meal Creation**: When you add a meal, it's stored in Supabase
2. **Smart Sync**: Meal data is automatically synced to SmartBuckets
3. **AI Analysis**: LiquidMetal AI analyzes patterns and generates insights
4. **Smart Search**: Use natural language to find specific meals

### Key Components

#### `LiquidMetalService` (`src/integrations/liquidmetal/client.ts`)
- Handles all API communication with LiquidMetal AI
- Manages SmartBucket creation and data storage
- Provides semantic search and insight generation

#### `useLiquidMetal` Hook (`src/hooks/use-liquidmetal.ts`)
- React hook for managing LiquidMetal state
- Handles loading states and error management
- Provides easy-to-use methods for all operations

#### `NutritionInsights` Component (`src/components/NutritionInsights.tsx`)
- Displays AI-powered nutrition analysis
- Shows patterns, recommendations, and alerts
- Interactive tabs for different insight types

#### `MealSearch` Component (`src/components/MealSearch.tsx`)
- Advanced meal search interface
- Natural language query support
- Multiple filter options

## 🎯 Usage Examples

### Getting Nutrition Insights
```typescript
import { useLiquidMetal } from '@/hooks/use-liquidmetal';

const { generateInsights, insights, isLoading } = useLiquidMetal();

// Generate insights for the past week
await generateInsights(userId, 'week');

// Insights will include:
// - Meal timing patterns
// - Food preferences
// - Calorie trends
// - Macro balance
// - Personalized recommendations
```

### Searching Meals
```typescript
const { searchMeals, searchResults } = useLiquidMetal();

// Natural language search
await searchMeals({
  query: "high protein breakfast under 400 calories",
  filters: {
    mealType: "breakfast",
    calorieRange: { min: 0, max: 400 }
  }
});
```

### Storing Meal Data
```typescript
const { storeMealData } = useLiquidMetal();

await storeMealData(userId, {
  id: "meal-123",
  name: "Grilled Chicken Salad",
  type: "lunch",
  calories: 350,
  protein: 30,
  carbs: 15,
  fats: 20,
  date: "2024-01-15"
});
```

## 🛠️ Configuration Options

### Timeframe Options
- `'week'` - Last 7 days of data
- `'month'` - Last 30 days of data  
- `'quarter'` - Last 90 days of data

### Health Goals
Common health goals for recommendations:
- `'weight_loss'`
- `'muscle_gain'`
- `'balanced_nutrition'`
- `'low_carb'`
- `'high_protein'`

### Meal Types
- `'breakfast'`
- `'lunch'`
- `'dinner'`
- `'snack'`

## 🔒 Security & Privacy

- Each user gets their own isolated SmartBucket
- API keys are stored securely in environment variables
- All data transmission uses HTTPS
- Meal data is enriched with metadata but remains private

## 🐛 Troubleshooting

### Common Issues

#### "LiquidMetal client not initialized"
- Check that your API key is correctly set in `.env`
- Ensure the `@liquidmetal-ai/client` package is installed
- Restart your development server after changing environment variables

#### "Failed to create SmartBucket"
- Verify your API key has the necessary permissions
- Check your internet connection
- Ensure you're not exceeding API rate limits

#### "No search results found"
- Try broader search terms
- Check that meals have been synced to SmartBuckets
- Verify date range filters are correct

### Debug Mode
Add this to your `.env` to enable detailed logging:
```env
VITE_DEBUG_LIQUIDMETAL=true
```

## 📊 Monitoring Usage

Monitor your LiquidMetal AI usage in your dashboard:
- API calls per month
- Storage usage
- Vector search operations
- Insight generation requests

## 🚀 Next Steps

1. **Test the Integration**: Add some meals and try generating insights
2. **Explore Search**: Use natural language to find specific meals
3. **Customize Goals**: Adjust health goals for better recommendations
4. **Monitor Usage**: Keep track of your API usage in the dashboard

## 📚 Additional Resources

- [LiquidMetal AI Documentation](https://docs.liquidmetal.ai)
- [SmartBuckets API Reference](https://docs.liquidmetal.ai/smart-buckets)
- [Support Discord](https://discord.gg/wh8Q6Zx8pu)

## 🤝 Support

If you run into any issues:
1. Check this troubleshooting guide
2. Visit the [LiquidMetal AI documentation](https://docs.liquidmetal.ai)
3. Join the [Discord community](https://discord.gg/wh8Q6Zx8pu)
4. Contact LiquidMetal AI support directly

---

Happy tracking! 🥗📊