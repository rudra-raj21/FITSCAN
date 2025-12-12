import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Utensils, Plus, Loader2, TrendingUp, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NutritionalInsights from "@/components/NutritionalInsights";

interface MealPlan {
  breakfast: MealSuggestion;
  lunch: MealSuggestion;
  dinner: MealSuggestion;
  snacks: MealSuggestion[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
}

const MealPlanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("meal-planner");
  const [showInsights, setShowInsights] = useState(false);
  const [showPastMealInsights, setShowPastMealInsights] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [pastMealInsights, setPastMealInsights] = useState<any>(null);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [healthGoal, setHealthGoal] = useState("");
  const [preferences, setPreferences] = useState({
    dietType: "balanced",
    restrictions: "",
    cuisinePreference: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_calories, health_goal")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.target_calories) {
      setTargetCalories(profile.target_calories);
    }
    if (profile?.health_goal) {
      setHealthGoal(profile.health_goal);
    }
  };

  const analyzePastMeals = async () => {
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch past 7 days of meals
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: meals, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!meals || meals.length === 0) {
        toast({
          title: "No Data Available",
          description: "Start logging meals to get personalized insights!",
          variant: "destructive"
        });
        return;
      }

      // Mock AI analysis of past meals
      await new Promise(resolve => setTimeout(resolve, 2000));

      const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
      const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
      const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
      const avgDailyCalories = totalCalories / 7;

      const insights = generatePastMealInsights(meals, avgDailyCalories, targetCalories, healthGoal);

      setPastMealInsights({
        period: "Last 7 days",
        totalMeals: meals.length,
        avgDailyCalories: Math.round(avgDailyCalories),
        totalNutrition: {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fats: Math.round(totalFats)
        },
        mealFrequency: analyzeMealFrequency(meals),
        nutritionTrends: analyzeNutritionTrends(meals),
        insights: insights,
        recommendations: generateRecommendations(insights, healthGoal)
      });

      setShowPastMealInsights(true);
      toast({
        title: "Analysis Complete!",
        description: `Analyzed ${meals.length} meals from the past week`
      });

    } catch (error) {
      console.error("Error analyzing past meals:", error);
      toast({
        title: "Error",
        description: "Failed to analyze past meals",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generatePastMealInsights = (meals: any[], avgCalories: number, targetCalories: number, healthGoal: string) => {
    const insights = [];

    // Calorie consistency insight
    if (Math.abs(avgCalories - targetCalories) < 100) {
      insights.push({
        type: 'success',
        title: 'Excellent Calorie Consistency',
        description: `You're consistently hitting your target of ${targetCalories} calories daily. Great job!`
      });
    } else if (avgCalories > targetCalories + 200) {
      insights.push({
        type: 'warning',
        title: 'Consistent Calorie Surplus',
        description: `You're averaging ${Math.round(avgCalories - targetCalories)} calories over your target. Consider portion control.`
      });
    } else if (avgCalories < targetCalories - 200) {
      insights.push({
        type: 'info',
        title: 'Consistent Calorie Deficit',
        description: `You're averaging ${Math.round(targetCalories - avgCalories)} calories under your target. Ensure adequate nutrition.`
      });
    }

    // Protein intake analysis
    const avgProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0) / meals.length;
    if (avgProtein >= 25) {
      insights.push({
        type: 'success',
        title: 'Strong Protein Intake',
        description: `Excellent protein averaging ${Math.round(avgProtein)}g per meal. Supports muscle health and satiety.`
      });
    } else if (avgProtein < 15) {
      insights.push({
        type: 'tip',
        title: 'Increase Protein Focus',
        description: `Consider adding more protein-rich foods. Average of ${Math.round(avgProtein)}g per meal could be improved.`
      });
    }

    // Meal regularity insight
    const mealsPerDay = meals.length / 7;
    if (mealsPerDay >= 3) {
      insights.push({
        type: 'success',
        title: 'Consistent Meal Logging',
        description: `Great consistency! You're logging ${mealsPerDay.toFixed(1)} meals per day on average.`
      });
    } else if (mealsPerDay < 2) {
      insights.push({
        type: 'tip',
        title: 'Improve Logging Consistency',
        description: `Try to log at least 2-3 meals daily for better insights and tracking accuracy.`
      });
    }

    return insights;
  };

  const analyzeMealFrequency = (meals: any[]) => {
    const frequency = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    meals.forEach(meal => {
      const type = meal.meal_type?.toLowerCase();
      if (frequency.hasOwnProperty(type)) {
        frequency[type as keyof typeof frequency]++;
      }
    });
    return frequency;
  };

  const analyzeNutritionTrends = (meals: any[]) => {
    // Simple trend analysis
    const recentMeals = meals.slice(0, 3);
    const olderMeals = meals.slice(3, 6);

    const recentAvg = recentMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / recentMeals.length;
    const olderAvg = olderMeals.length > 0 ? 
      olderMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / olderMeals.length : recentAvg;

    return {
      direction: recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable',
      change: Math.abs(recentAvg - olderAvg)
    };
  };

  const generateRecommendations = (insights: any[], healthGoal: string) => {
    const recommendations = [];

    // Goal-specific recommendations
    if (healthGoal === 'lose_weight') {
      recommendations.push({
        category: 'Weight Loss Strategy',
        suggestion: 'Focus on high-protein, fiber-rich meals to enhance satiety and support your calorie deficit.',
        impact: 'high'
      });
      recommendations.push({
        category: 'Meal Timing',
        suggestion: 'Consider spreading calories across 4-5 smaller meals to maintain energy levels.',
        impact: 'medium'
      });
    } else if (healthGoal === 'gain_muscle') {
      recommendations.push({
        category: 'Muscle Building',
        suggestion: 'Ensure each meal contains 25-35g protein to optimize muscle protein synthesis.',
        impact: 'high'
      });
      recommendations.push({
        category: 'Nutrient Timing',
        suggestion: 'Consider post-workout meals with carbs and protein within 2 hours of exercise.',
        impact: 'medium'
      });
    }

    // General recommendations based on insights
    insights.forEach(insight => {
      if (insight.type === 'warning') {
        recommendations.push({
          category: 'Improvement Area',
          suggestion: 'Focus on portion control and mindful eating to better align with your goals.',
          impact: 'medium'
        });
      }
    });

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          targetCalories,
          dietType: preferences.dietType,
          restrictions: preferences.restrictions,
          cuisinePreference: preferences.cuisinePreference,
          healthGoal,
        },
      });

      if (response.error) throw response.error;

      setMealPlan(response.data);
      setShowInsights(true);
      toast({ 
        title: "Meal Plan Generated!", 
        description: "Your personalized meal plan with nutritional insights is ready" 
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({ title: "Error", description: "Failed to generate meal plan. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addMealToLog = async (meal: MealSuggestion, mealType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("meals").insert({
      user_id: user.id,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      meal_type: mealType,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add meal", variant: "destructive" });
    } else {
      toast({ title: "Added!", description: `${meal.name} added to your log` });
    }
  };

  const MealCard = ({ meal, type }: { meal: MealSuggestion; type: string }) => (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-foreground">{meal.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{type}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => addMealToLog(meal, type)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-primary/10 rounded p-1">
            <p className="font-semibold text-primary">{meal.calories}</p>
            <p className="text-muted-foreground">kcal</p>
          </div>
          <div className="bg-red-500/10 rounded p-1">
            <p className="font-semibold text-red-500">{meal.protein}g</p>
            <p className="text-muted-foreground">Protein</p>
          </div>
          <div className="bg-amber-500/10 rounded p-1">
            <p className="font-semibold text-amber-500">{meal.carbs}g</p>
            <p className="text-muted-foreground">Carbs</p>
          </div>
          <div className="bg-blue-500/10 rounded p-1">
            <p className="font-semibold text-blue-500">{meal.fats}g</p>
            <p className="text-muted-foreground">Fats</p>
          </div>
        </div>
        {meal.ingredients.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Ingredients:</span> {meal.ingredients.join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Nutrition</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="meal-planner" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  AI Meal Planner
                </TabsTrigger>
                <TabsTrigger value="past-analyzer" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Past Meals Analyzer
                </TabsTrigger>
              </TabsList>

              {/* AI Meal Planner Tab */}
              <TabsContent value="meal-planner" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Meal Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Target Calories</Label>
                      <Input
                        type="number"
                        value={targetCalories}
                        onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                        placeholder="2000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Diet Type</Label>
                      <Select value={preferences.dietType} onValueChange={(v) => setPreferences({ ...preferences, dietType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="high_protein">High Protein</SelectItem>
                          <SelectItem value="low_carb">Low Carb</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cuisine Preference (optional)</Label>
                      <Input
                        value={preferences.cuisinePreference}
                        onChange={(e) => setPreferences({ ...preferences, cuisinePreference: e.target.value })}
                        placeholder="e.g., Indian, Mediterranean, Asian"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dietary Restrictions (optional)</Label>
                      <Textarea
                        value={preferences.restrictions}
                        onChange={(e) => setPreferences({ ...preferences, restrictions: e.target.value })}
                        placeholder="e.g., No nuts, lactose-free, gluten-free"
                        rows={2}
                      />
                    </div>

                    <Button className="w-full" onClick={generateMealPlan} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Utensils className="h-4 w-4 mr-2" />
                          Generate Meal Plan
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Past Meals Analyzer Tab */}
              <TabsContent value="past-analyzer" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Past Meals Analysis
                    </CardTitle>
                    <CardDescription>
                      Analyze your eating patterns from the past 7 days to get personalized insights and recommendations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-blue-900">7-Day Analysis</h4>
                          <p className="text-sm text-blue-700">
                            We'll analyze your meal history to identify patterns and provide personalized recommendations.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={analyzePastMeals} 
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analyze Past Meals
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Make sure you've logged meals in the past week for the best insights
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Meal Plan Results */}
        {mealPlan && (
          <div className="space-y-4">
            {/* Enhanced Summary */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">Daily Totals</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInsights(!showInsights)}
                    className="text-primary"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {showInsights ? 'Hide' : 'Show'} Insights
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold text-primary">{mealPlan.totalCalories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-red-500">{mealPlan.totalProtein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-500">{mealPlan.totalCarbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-500">{mealPlan.totalFats}g</p>
                    <p className="text-xs text-muted-foreground">Fats</p>
                  </div>
                </div>
                {targetCalories && (
                  <div className="mt-2 text-center">
                    <span className={`text-xs font-medium ${
                      Math.abs(mealPlan.totalCalories - targetCalories) <= 100 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {Math.abs(mealPlan.totalCalories - targetCalories) <= 100 
                        ? '✓ On target' 
                        : `${Math.abs(mealPlan.totalCalories - targetCalories)}cal from target`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutritional Insights */}
            {showInsights && (
              <NutritionalInsights 
                mealPlan={{ ...mealPlan, targetCalories }}
                healthGoal={healthGoal}
                dietType={preferences.dietType}
              />
            )}

            {/* Meals */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Your Meals
              </h3>
              <MealCard meal={mealPlan.breakfast} type="breakfast" />
              <MealCard meal={mealPlan.lunch} type="lunch" />
              <MealCard meal={mealPlan.dinner} type="dinner" />
              {mealPlan.snacks.map((snack, index) => (
                <MealCard key={index} meal={snack} type="snack" />
              ))}
            </div>
          </div>
        )}

        {/* Past Meal Insights */}
        {showPastMealInsights && pastMealInsights && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Past Meal Analysis ({pastMealInsights.period})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">{pastMealInsights.totalMeals}</p>
                    <p className="text-sm text-gray-600">Meals Logged</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-600">{pastMealInsights.avgDailyCalories}</p>
                    <p className="text-sm text-gray-600">Avg Daily Calories</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="font-bold text-red-600">{pastMealInsights.totalNutrition.protein}g</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="font-bold text-amber-600">{pastMealInsights.totalNutrition.carbs}g</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="font-bold text-blue-600">{pastMealInsights.totalNutrition.fats}g</p>
                    <p className="text-xs text-gray-500">Fats</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="font-bold text-green-600">{pastMealInsights.totalNutrition.calories}</p>
                    <p className="text-xs text-gray-500">Total Cals</p>
                  </div>
                </div>

                {/* Meal Frequency */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Meal Frequency</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="font-bold text-blue-700">{pastMealInsights.mealFrequency.breakfast}</p>
                      <p className="text-xs text-gray-500">Breakfast</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="font-bold text-green-700">{pastMealInsights.mealFrequency.lunch}</p>
                      <p className="text-xs text-gray-500">Lunch</p>
                    </div>
                    <div className="bg-orange-50 rounded p-2">
                      <p className="font-bold text-orange-700">{pastMealInsights.mealFrequency.dinner}</p>
                      <p className="text-xs text-gray-500">Dinner</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <p className="font-bold text-purple-700">{pastMealInsights.mealFrequency.snack}</p>
                      <p className="text-xs text-gray-500">Snacks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastMealInsights.insights.map((insight: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.type === 'success' ? 'bg-green-50 border-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      insight.type === 'info' ? 'bg-blue-50 border-blue-500' :
                      'bg-purple-50 border-purple-500'
                    }`}
                  >
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Personalized Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastMealInsights.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-blue-600 mb-1">{rec.category}</div>
                      <p className="text-sm">{rec.suggestion}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                      rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.impact} impact
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              onClick={() => setShowPastMealInsights(false)}
              className="w-full"
            >
              Hide Analysis
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MealPlanner;
