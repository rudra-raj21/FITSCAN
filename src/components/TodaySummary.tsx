import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Beef, Sandwich, Droplets } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const TodaySummary = () => {
  const [summary, setSummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const [loading, setLoading] = useState(true);
  const [targetCalories, setTargetCalories] = useState(2000);

  const goals = {
    calories: targetCalories,
    protein: 150,
    carbs: 250,
    fats: 65
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("target_calories")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.target_calories) {
        setTargetCalories(profile.target_calories);
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase
        .from('meals')
        .select('calories, protein, carbs, fats')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (meals && meals.length > 0) {
        const totals = meals.reduce((acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (Number(meal.protein) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fats: acc.fats + (Number(meal.fats) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        setSummary(totals);
      }
    } catch (error) {
      console.error('Error fetching today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 50) return "bg-warning";
    if (percentage < 80) return "bg-primary";
    if (percentage <= 100) return "bg-success";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Calories",
      value: summary.calories,
      goal: goals.calories,
      unit: "kcal",
      icon: Flame,
      color: "text-warning"
    },
    {
      label: "Protein",
      value: Math.round(summary.protein),
      goal: goals.protein,
      unit: "g",
      icon: Beef,
      color: "text-destructive"
    },
    {
      label: "Carbs",
      value: Math.round(summary.carbs),
      goal: goals.carbs,
      unit: "g",
      icon: Sandwich,
      color: "text-primary"
    },
    {
      label: "Fats",
      value: Math.round(summary.fats),
      goal: goals.fats,
      unit: "g",
      icon: Droplets,
      color: "text-accent"
    }
  ];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ {stat.goal}{stat.unit}</span>
              </div>
              <Progress 
                value={getProgress(stat.value, stat.goal)} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySummary;
