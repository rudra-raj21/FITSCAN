import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Shield, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Zap,
  Moon,
  Droplets
} from "lucide-react";

interface NutritionalInsight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionable?: boolean;
}

interface NutritionalInsightsProps {
  mealPlan: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    targetCalories?: number;
  };
  healthGoal?: string;
  dietType?: string;
}

const NutritionalInsights = ({ mealPlan, healthGoal, dietType }: NutritionalInsightsProps) => {
  const targetCalories = mealPlan.targetCalories || 2000;
  const calorieAccuracy = Math.abs((mealPlan.totalCalories - targetCalories) / targetCalories * 100);
  
  // Generate insights based on meal plan analysis
  const insights: NutritionalInsight[] = [];

  // Calorie accuracy insight
  if (calorieAccuracy < 5) {
    insights.push({
      type: 'success',
      title: 'Perfect Calorie Match',
      description: `Your meal plan hits your target of ${targetCalories} calories perfectly!`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      actionable: false
    });
  } else if (calorieAccuracy < 10) {
    insights.push({
      type: 'info',
      title: 'Close to Target',
      description: `Your meal plan is within ${calorieAccuracy.toFixed(1)}% of your target calories. Good job!`,
      icon: <Heart className="h-4 w-4 text-blue-500" />,
      actionable: false
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Calorie Adjustment Needed',
      description: `Your plan is ${mealPlan.totalCalories > targetCalories ? 'over' : 'under'} by ${Math.abs(mealPlan.totalCalories - targetCalories)} calories.`,
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      actionable: true
    });
  }

  // Protein analysis
  const proteinPerKg = mealPlan.totalProtein / 70; // Assuming 70kg average weight
  if (proteinPerKg >= 1.6 && proteinPerKg <= 2.2) {
    insights.push({
      type: 'success',
      title: 'Optimal Protein Intake',
      description: `${mealPlan.totalProtein}g protein supports muscle maintenance and overall health.`,
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      actionable: false
    });
  } else if (proteinPerKg < 1.6) {
    insights.push({
      type: 'tip',
      title: 'Increase Protein',
      description: `Consider adding ${Math.round((1.6 * 70) - mealPlan.totalProtein)}g more protein for optimal muscle health.`,
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      actionable: true
    });
  }

  // Macronutrient balance
  const proteinCals = mealPlan.totalProtein * 4;
  const carbCals = mealPlan.totalCarbs * 4;
  const fatCals = mealPlan.totalFats * 9;
  
  const proteinPercent = (proteinCals / mealPlan.totalCalories) * 100;
  const carbPercent = (carbCals / mealPlan.totalCalories) * 100;
  const fatPercent = (fatCals / mealPlan.totalCalories) * 100;

  // Goal-specific insights
  if (healthGoal === 'gain_muscle') {
    if (proteinPercent >= 25 && proteinPercent <= 35) {
      insights.push({
        type: 'success',
        title: 'Muscle-Building Ratio',
        description: `${proteinPercent.toFixed(1)}% protein is ideal for muscle growth.`,
        icon: <Activity className="h-4 w-4 text-green-500" />,
        actionable: false
      });
    }
  } else if (healthGoal === 'lose_weight') {
    if (proteinPercent >= 30) {
      insights.push({
        type: 'success',
        title: 'Weight Loss Support',
        description: 'High protein intake helps preserve muscle during weight loss.',
        icon: <Shield className="h-4 w-4 text-green-500" />,
        actionable: false
      });
    }
  }

  // Diet-specific insights
  if (dietType === 'keto') {
    if (fatPercent >= 70) {
      insights.push({
        type: 'success',
        title: 'Ketogenic Optimized',
        description: `${fatPercent.toFixed(1)}% fat supports ketosis effectively.`,
        icon: <Zap className="h-4 w-4 text-green-500" />,
        actionable: false
      });
    }
  } else if (dietType === 'low_carb') {
    if (carbPercent <= 30) {
      insights.push({
        type: 'success',
        title: 'Low Carb Achieved',
        description: `${carbPercent.toFixed(1)}% carbs aligns with low-carb goals.`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        actionable: false
      });
    }
  }

  // Hydration reminder
  insights.push({
    type: 'tip',
    title: 'Stay Hydrated',
    description: 'Drink 8-10 glasses of water throughout the day for optimal digestion and nutrient absorption.',
    icon: <Droplets className="h-4 w-4 text-blue-500" />,
    actionable: true
  });

  // Meal timing tip
  insights.push({
    type: 'tip',
    title: 'Optimal Timing',
    description: 'Try to eat within 2 hours of waking to kickstart metabolism. Space meals 3-4 hours apart.',
    icon: <Moon className="h-4 w-4 text-purple-500" />,
    actionable: true
  });

  const getInsightColor = (type: NutritionalInsight['type']) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'tip': return 'border-purple-200 bg-purple-50';
    }
  };

  const getBadgeColor = (type: NutritionalInsight['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'tip': return 'bg-purple-100 text-purple-800';
    }
  };

  const getInsightLabel = (type: NutritionalInsight['type']) => {
    switch (type) {
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      case 'tip': return 'Tip';
    }
  };

  return (
    <div className="space-y-4">
      {/* Macronutrient Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Macronutrient Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-red-600">Protein</span>
                <span>{proteinPercent.toFixed(1)}% ({mealPlan.totalProtein}g)</span>
              </div>
              <Progress value={proteinPercent} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-amber-600">Carbohydrates</span>
                <span>{carbPercent.toFixed(1)}% ({mealPlan.totalCarbs}g)</span>
              </div>
              <Progress value={carbPercent} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-blue-600">Fats</span>
                <span>{fatPercent.toFixed(1)}% ({mealPlan.totalFats}g)</span>
              </div>
              <Progress value={fatPercent} className="h-2" />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Protein: 4 calories per gram</p>
            <p>• Carbohydrates: 4 calories per gram</p>
            <p>• Fats: 9 calories per gram</p>
          </div>
        </CardContent>
      </Card>

      {/* Nutritional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Nutritional Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {insight.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge className={`text-xs ${getBadgeColor(insight.type)}`}>
                      {getInsightLabel(insight.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                  {insight.actionable && (
                    <p className="text-xs font-medium text-blue-600 mt-1">✓ Actionable advice</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health Goal Alignment */}
      {healthGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Goal Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded">
                <Heart className="h-6 w-6 mx-auto mb-1 text-red-500" />
                <div className="font-medium">Heart Health</div>
                <div className="text-xs text-gray-500">
                  {fatPercent <= 30 ? 'Excellent' : fatPercent <= 35 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded">
                <Activity className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <div className="font-medium">Energy Levels</div>
                <div className="text-xs text-gray-500">
                  {carbPercent >= 40 && carbPercent <= 60 ? 'Balanced' : 'Could Optimize'}
                </div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded">
                <Brain className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                <div className="font-medium">Mental Clarity</div>
                <div className="text-xs text-gray-500">
                  {proteinPercent >= 20 && fatPercent >= 25 ? 'Well Supported' : 'Could Improve'}
                </div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded">
                <Shield className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <div className="font-medium">Immunity</div>
                <div className="text-xs text-gray-500">
                  {proteinPercent >= 15 ? 'Strong Support' : 'Needs More Protein'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NutritionalInsights;