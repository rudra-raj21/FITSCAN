import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Meal {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
  image_url: string | null;
}

const RecentMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentMeals();
  }, []);

  const fetchRecentMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-warning/10 text-warning border-warning/20",
      morning_snack: "bg-accent/10 text-accent border-accent/20",
      lunch: "bg-primary/10 text-primary border-primary/20",
      snack: "bg-secondary text-secondary-foreground",
      dinner: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const formatMealType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Meals</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (meals.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Meals</h2>
        <p className="text-muted-foreground text-center py-8">
          No meals logged yet. Add your first meal!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Meals</h2>
      <div className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {meal.image_url ? (
                <img
                  src={meal.image_url}
                  alt={meal.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{meal.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getMealTypeColor(meal.meal_type)}>
                    {formatMealType(meal.meal_type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(meal.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{meal.calories} kcal</div>
              <div className="text-xs text-muted-foreground">
                P: {Math.round(meal.protein)}g · C: {Math.round(meal.carbs)}g · F: {Math.round(meal.fats)}g
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentMeals;
