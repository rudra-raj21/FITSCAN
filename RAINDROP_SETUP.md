# Raindrop SmartBuckets Integration Setup

This guide will help you integrate SmartBuckets from Raindrop (LiquidMetal AI) into your diet tracking application using the **actual** Raindrop framework.

## 🚀 What is Raindrop?

Raindrop is an AI-native runtime for backend APIs that includes:
- **SmartBuckets** - Intelligent storage with automatic vector embeddings
- **SmartMemory** - AI agent memory systems
- **SmartSQL** - Natural language database queries
- **SmartInference** - Unified AI model interface

## 📋 Prerequisites

1. **Raindrop Account**: Sign up at [raindrop.run](https://raindrop.run)
2. **Raindrop CLI**: Install following the [official documentation](https://docs.liquidmetal.ai/reference/getting-started/)
3. **Organization ID**: Get this from your Raindrop dashboard

## 🛠️ Setup Instructions

### 1. Install Raindrop Framework

The integration uses the actual Raindrop framework:

```bash
npm install @liquidmetal-ai/raindrop-framework
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Add your Raindrop configuration:

```env
# Raindrop Configuration
VITE_RAINDROP_ORG_ID=your_actual_org_id_here
VITE_RAINDROP_NUTRITION_URL=https://nutrition-insights.your-org-id.lmapp.run
VITE_RAINDROP_SEARCH_URL=https://meal-search.your-org-id.lmapp.run
```

### 3. Configure Your Raindrop Manifest

Edit `raindrop.manifest` and replace `<YOUR ORG ID>` with your actual organization ID:

```hcl
application "fitscan-diet" {
  service "nutrition-insights" {
    visibility = "public"
    domain {
      fqdn = "nutrition-insights.YOUR_ORG_ID.lmapp.run"
    }
  }
  
  // ... other services
}
```

### 4. Deploy to Raindrop

```bash
# Build your services
raindrop build branch

# Deploy to Raindrop
raindrop build deploy
```

### 5. Update Your Application URLs

After deployment, update your environment variables with the actual URLs:

```env
VITE_RAINDROP_NUTRITION_URL=https://nutrition-insights.YOUR_ORG_ID.lmapp.run
VITE_RAINDROP_SEARCH_URL=https://meal-search.YOUR_ORG_ID.lmapp.run
```

## 🎯 How It Works

### SmartBuckets Integration

The integration creates two SmartBuckets:

1. **nutrition-data** - Stores aggregated nutrition data for insights
2. **meal-history** - Stores complete meal history with semantic search

### Key Features

#### 1. Automatic Vector Embeddings
```typescript
// Meals are automatically embedded for semantic search
await this.env.AI.smartBuckets.store('meal-history', {
  content: "Meal: Grilled Chicken Salad - 350 calories, high protein",
  metadata: { mealType: "lunch", calories: 350 }
});
```

#### 2. AI-Powered Insights
```typescript
// Natural language queries to generate insights
const insights = await this.env.AI.smartBuckets.query('nutrition-data', {
  query: "Analyze eating patterns and provide recommendations",
  userId: "user123",
  timeframe: "week"
});
```

#### 3. Semantic Search
```typescript
// Natural language meal search
const results = await this.env.AI.smartBuckets.search('meal-history', {
  query: "high protein breakfast under 400 calories",
  userId: "user123",
  filters: { mealType: "breakfast" }
});
```

## 📁 File Structure

```
fitscan-diet-main/
├── raindrop.manifest              # Raindrop configuration
├── src/
│   ├── services/
│   │   ├── nutrition-insights/    # AI insights service
│   │   └── meal-search/          # Semantic search service
│   └── integrations/
│       └── raindrop/
│           └── client.ts         # Frontend client
└── package.json                  # Updated with raindrop-framework
```

## 🔧 Available Services

### Nutrition Insights Service
- **URL**: `https://nutrition-insights.{org-id}.lmapp.run`
- **Endpoints**:
  - `POST /insights` - Generate nutrition insights
  - `POST /meals` - Store meal data
  - `POST /recommendations` - Get personalized recommendations

### Meal Search Service  
- **URL**: `https://meal-search.{org-id}.lmapp.run`
- **Endpoints**:
  - `POST /` - Semantic meal search

## 📊 Usage Examples

### Storing Meal Data
```typescript
import { raindropClient } from '@/integrations/raindrop/client';

await raindropClient.storeMealData({
  userId: 'user123',
  mealId: 'meal-456',
  name: 'Grilled Chicken Salad',
  type: 'lunch',
  calories: 350,
  protein: 30,
  carbs: 15,
  fats: 20,
  date: '2024-01-15',
  timestamp: new Date().toISOString()
});
```

### Generating Insights
```typescript
const insights = await raindropClient.generateNutritionInsights({
  userId: 'user123',
  timeframe: 'week',
  healthGoals: ['weight_loss', 'muscle_gain']
});

// Returns patterns, recommendations, warnings, achievements
```

### Searching Meals
```typescript
const results = await raindropClient.searchMeals({
  query: 'high protein breakfast',
  userId: 'user123',
  filters: {
    mealType: 'breakfast',
    calorieRange: { min: 0, max: 500 }
  }
});

// Returns semantically similar meals with relevance scores
```

## 🌟 Benefits Over Traditional Storage

1. **Automatic Embeddings**: No manual vector database setup
2. **Natural Language Queries**: Search with plain English
3. **Built-in AI**: Direct access to AI-powered insights
4. **Serverless**: No infrastructure management
5. **Scalable**: Auto-scaling with global distribution

## 🔍 Monitoring & Debugging

### Check Service Health
```bash
curl https://nutrition-insights.YOUR_ORG_ID.lmapp.run
curl https://meal-search.YOUR_ORG_ID.lmapp.run
```

### View Logs
Use the Raindrop dashboard at `https://raindrop.run` to monitor:
- Service logs
- API usage
- SmartBuckets storage
- Performance metrics

## 🛠️ Local Development

For local development, you can use the Raindrop CLI:

```bash
# Local development server
raindrop dev

# Test your services locally
curl http://localhost:8787/insights
```

## 📚 Additional Resources

- [Raindrop Documentation](https://docs.liquidmetal.ai)
- [SmartBuckets Reference](https://docs.liquidmetal.ai/smart-buckets)
- [Raindrop CLI Guide](https://docs.liquidmetal.ai/reference/getting-started/)
- [Community Discord](https://discord.gg/wh8Q6Zx8pu)

## 🆘 Troubleshooting

### Common Issues

#### "Service Not Found"
- Check that your services are deployed: `raindrop build list`
- Verify your organization ID in the manifest
- Ensure DNS propagation (can take up to 5 minutes)

#### "Authentication Error"
- Verify your API keys in the Raindrop dashboard
- Check that your services have proper visibility settings

#### "SmartBuckets Not Accessible"
- Ensure SmartBuckets are defined in your manifest
- Check bucket permissions and visibility
- Verify data schema matches metadata definitions

### Getting Help

1. Check the [Raindrop Documentation](https://docs.liquidmetal.ai)
2. Join the [Discord Community](https://discord.gg/wh8Q6Zx8pu)
3. Review service logs in the Raindrop dashboard
4. Contact Raindrop support through your dashboard

---

**🎉 Congratulations!** You now have SmartBuckets integrated with real AI-powered nutrition insights and semantic search capabilities.