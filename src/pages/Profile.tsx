import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Save, Calculator, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormulaComparison from "@/components/FormulaComparison";

interface ProfileData {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  activity_level: string | null;
  health_goal: string | null;
  target_calories: number | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    activity_level: "",
    health_goal: "",
    target_calories: "",
    bodyfat: "",
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

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      return;
    }

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        weight: data.weight?.toString() || "",
        height: data.height?.toString() || "",
        activity_level: data.activity_level || "",
        health_goal: data.health_goal || "",
        target_calories: data.target_calories?.toString() || "",
        bodyfat: "",
      });
    }
    setLoading(false);
  };

  const calculateCalories = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender || !formData.activity_level || !formData.health_goal) {
      toast({ title: "Missing Data", description: "Please fill all required fields before calculating", variant: "destructive" });
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
        healthGoal: formData.health_goal,
      };

      // Add body fat if provided
      if (formData.bodyfat) {
        requestBody.bodyFat = parseFloat(formData.bodyfat);
      }

      const response = await supabase.functions.invoke("calculate-calories", {
        body: requestBody,
      });

      if (response.error) throw response.error;

      const data = response.data;
      setFormData({ ...formData, target_calories: data.targetCalories.toString() });
      setCalculationResults(data);
      setShowDetailedResults(true);
      
      toast({ 
        title: "Calculated!", 
        description: `Recommended: ${data.targetCalories} calories/day (${data.formula})` 
      });
    } catch (error) {
      console.error("Error calculating calories:", error);
      toast({ title: "Error", description: "Failed to calculate calories", variant: "destructive" });
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        activity_level: formData.activity_level || null,
        health_goal: formData.health_goal || null,
        target_calories: formData.target_calories ? parseInt(formData.target_calories) : null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: "Your profile has been updated" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{formData.name || "Your Profile"}</h2>
          <p className="text-muted-foreground">Manage your fitness details</p>
        </div>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
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
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="175"
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
          </CardContent>
        </Card>

        {/* Fitness Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fitness Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select value={formData.activity_level} onValueChange={(v) => setFormData({ ...formData, activity_level: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise, desk job)</SelectItem>
                  <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (intense exercise daily, physical job)</SelectItem>
                  <SelectItem value="extra_active">Extra Active (very intense exercise + physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Health Goal</Label>
              <Select value={formData.health_goal} onValueChange={(v) => setFormData({ ...formData, health_goal: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
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
              <Label htmlFor="calories">Daily Calorie Target</Label>
              <div className="flex gap-2">
                <Input
                  id="calories"
                  type="number"
                  value={formData.target_calories}
                  onChange={(e) => setFormData({ ...formData, target_calories: e.target.value })}
                  placeholder="2000"
                />
                <Button variant="outline" onClick={calculateCalories} disabled={calculating}>
                  <Calculator className="h-4 w-4 mr-2" />
                  {calculating ? "..." : "Calculate"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Uses advanced multi-formula calculation with safety safeguards
              </p>
            </div>
          </CardContent>
        </Card>

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

        {/* Save Button */}
        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </main>
    </div>
  );
};

export default Profile;
