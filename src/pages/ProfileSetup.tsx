import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import FormulaComparison from "@/components/FormulaComparison";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    height: "",
    age: "",
    gender: "",
    activity_level: "",
    health_goal: "",
    target_calories: "",
    bodyfat: ""
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      navigate("/");
    }
  };

  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState<any>(null);

  const calculateIdealCalories = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender || !formData.activity_level || !formData.health_goal) {
      toast.error("Please fill in all fields to calculate ideal calories");
      return;
    }

    setCalculating(true);
    try {
      const requestBody: any = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activity_level,
        healthGoal: formData.health_goal
      };

      // Add body fat if provided
      if (formData.bodyfat) {
        requestBody.bodyFat = parseFloat(formData.bodyfat);
      }

      const { data, error } = await supabase.functions.invoke('calculate-calories', {
        body: requestBody
      });

      if (error) throw error;

      if (data?.targetCalories) {
        setFormData(prev => ({ ...prev, target_calories: data.targetCalories.toString() }));
        setCalculationResults(data);
        setShowDetailedResults(true);
        
        const resultMessage = `Recommended: ${data.targetCalories} calories/day (${data.formula})`;
        toast.success(resultMessage);
      }
    } catch (error) {
      console.error('Error calculating calories:', error);
      // Enhanced fallback calculation
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);
      
      // Use Mifflin-St Jeor for fallback
      let bmr;
      if (formData.gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
        extra_active: 2.0
      };

      const tdee = bmr * (activityMultipliers[formData.activity_level] || 1.55);

      let targetCalories;
      if (formData.health_goal === 'lose_weight') {
        const deficit = Math.min(750, Math.max(300, tdee * 0.2));
        targetCalories = Math.round(tdee - deficit);
      } else if (formData.health_goal === 'gain_muscle') {
        const surplus = Math.min(500, Math.max(250, tdee * 0.15));
        targetCalories = Math.round(tdee + surplus);
      } else {
        targetCalories = Math.round(tdee);
      }

      const minCalories = formData.gender === 'male' ? 1500 : 1200;
      targetCalories = Math.max(targetCalories, minCalories);

      setFormData(prev => ({ ...prev, target_calories: targetCalories.toString() }));
      toast.success(`Recommended: ${targetCalories} calories/day (Mifflin-St Jeor)`);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.gender || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      activity_level: formData.activity_level || null,
      health_goal: formData.health_goal || null,
      target_calories: formData.target_calories ? parseInt(formData.target_calories) : 2000
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile created successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Help us personalize your nutrition goals</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyfat">Body Fat % (Optional - for more accurate calculation)</Label>
              <Input
                id="bodyfat"
                type="number"
                step="0.1"
                min="1"
                max="50"
                placeholder="15"
                value={formData.bodyfat || ""}
                onChange={(e) => setFormData({ ...formData, bodyfat: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                If you know your body fat percentage, we'll use the Katch-McArdle formula for maximum accuracy
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select value={formData.activity_level} onValueChange={(value) => setFormData({ ...formData, activity_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (hard exercise daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Health Goal</Label>
              <Select value={formData.health_goal} onValueChange={(value) => setFormData({ ...formData, health_goal: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight (0.5kg/week)</SelectItem>
                  <SelectItem value="aggressive_loss">Aggressive Weight Loss (1kg/week)</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain Muscle (Lean Bulk)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="calories">Daily Calorie Target</Label>
                <Button type="button" variant="outline" size="sm" onClick={calculateIdealCalories} disabled={calculating}>
                  {calculating ? "Calculating..." : "Calculate for me"}
                </Button>
              </div>
              <Input
                id="calories"
                type="number"
                placeholder="2000"
                value={formData.target_calories}
                onChange={(e) => setFormData({ ...formData, target_calories: e.target.value })}
              />
            </div>

            {showDetailedResults && calculationResults && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-900">📊 Calculation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Formula Used:</span>
                      <p className="text-gray-700">{calculationResults.formula}</p>
                      <p className="text-xs text-gray-500 italic">{calculationResults.accuracy}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">BMR:</span>
                      <p className="text-gray-700">{calculationResults.bmr} calories/day</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">TDEE:</span>
                      <p className="text-gray-700">{calculationResults.tdee} calories/day</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Target:</span>
                      <p className="text-gray-700">{calculationResults.targetCalories} calories/day</p>
                    </div>
                  </div>

                  {calculationResults.macroSuggestions && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">🍽️ Macronutrient Suggestions</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-blue-600">Protein</div>
                          <div>{calculationResults.macroSuggestions.protein.g}g</div>
                          <div className="text-gray-500">{calculationResults.macroSuggestions.protein.percentage}%</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-green-600">Carbs</div>
                          <div>{calculationResults.macroSuggestions.carbs.g}g</div>
                          <div className="text-gray-500">{calculationResults.macroSuggestions.carbs.percentage}%</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-yellow-600">Fat</div>
                          <div>{calculationResults.macroSuggestions.fat.g}g</div>
                          <div className="text-gray-500">{calculationResults.macroSuggestions.fat.percentage}%</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{calculationResults.macroSuggestions.recommendation}</p>
                    </div>
                  )}

                  {calculationResults.allResults && calculationResults.allResults.length > 1 && (
                    <FormulaComparison 
                      results={calculationResults.allResults}
                      selectedFormula={calculationResults.formula}
                    />
                  )}

                  {calculationResults.healthInsights && calculationResults.healthInsights.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">💡 Health Insights</h4>
                      <ul className="text-xs space-y-1">
                        {calculationResults.healthInsights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-1">•</span>
                            <span className="text-gray-600">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDetailedResults(false)}
                    className="w-full"
                  >
                    Hide Details
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
