import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Flame, Beef, Wheat, Droplets, TrendingUp, TrendingDown } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface MealData {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
  created_at: string;
}

const Summary = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyData, setWeeklyData] = useState<DailySummary[]>([]);
  const [dayMeals, setDayMeals] = useState<MealData[]>([]);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDayData();
      fetchWeeklyData();
    }
  }, [selectedDate]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
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
  };

  const fetchDayData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    const { data: meals } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", `${dateStr}T00:00:00`)
      .lt("created_at", `${dateStr}T23:59:59`)
      .order("created_at", { ascending: true });

    setDayMeals(meals || []);
    setLoading(false);
  };

  const fetchWeeklyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

    const days: DailySummary[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = subDays(weekEnd, 6 - i);
      const dateStr = format(day, "yyyy-MM-dd");
      
      const { data: meals } = await supabase
        .from("meals")
        .select("calories, protein, carbs, fats")
        .eq("user_id", user.id)
        .gte("created_at", `${dateStr}T00:00:00`)
        .lt("created_at", `${dateStr}T23:59:59`);

      const totals = (meals || []).reduce(
        (acc, meal) => ({
          total_calories: acc.total_calories + (meal.calories || 0),
          total_protein: acc.total_protein + Number(meal.protein || 0),
          total_carbs: acc.total_carbs + Number(meal.carbs || 0),
          total_fats: acc.total_fats + Number(meal.fats || 0),
        }),
        { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0 }
      );

      days.push({ date: dateStr, ...totals });
    }

    setWeeklyData(days);
  };

  const getDayTotals = () => {
    return dayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + Number(meal.protein),
        carbs: acc.carbs + Number(meal.carbs),
        fats: acc.fats + Number(meal.fats),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const getWeeklyAverage = () => {
    if (weeklyData.length === 0) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    const totals = weeklyData.reduce(
      (acc, day) => ({
        calories: acc.calories + day.total_calories,
        protein: acc.protein + day.total_protein,
        carbs: acc.carbs + day.total_carbs,
        fats: acc.fats + day.total_fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const daysWithData = weeklyData.filter(d => d.total_calories > 0).length || 1;
    
    return {
      calories: Math.round(totals.calories / daysWithData),
      protein: Math.round(totals.protein / daysWithData),
      carbs: Math.round(totals.carbs / daysWithData),
      fats: Math.round(totals.fats / daysWithData),
    };
  };

  const dayTotals = getDayTotals();
  const weeklyAvg = getWeeklyAverage();
  const caloriesDiff = dayTotals.calories - targetCalories;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Daily Summary</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Date Picker */}
        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full max-w-xs justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Day Summary Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Day Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-foreground">{dayTotals.calories}</p>
              <p className="text-muted-foreground">of {targetCalories} kcal</p>
              <div className={cn(
                "flex items-center justify-center gap-1 mt-1 text-sm",
                caloriesDiff > 0 ? "text-destructive" : "text-primary"
              )}>
                {caloriesDiff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(caloriesDiff)} {caloriesDiff > 0 ? "over" : "under"}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Beef className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">{dayTotals.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div>
                <Wheat className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">{dayTotals.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div>
                <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">{dayTotals.fats}g</p>
                <p className="text-xs text-muted-foreground">Fats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : dayMeals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No meals logged for this day</p>
            ) : (
              <div className="space-y-3">
                {dayMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{meal.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{meal.meal_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{meal.calories} kcal</p>
                      <p className="text-xs text-muted-foreground">
                        P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeklyData.map((day) => (
                <div
                  key={day.date}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-colors",
                    day.date === format(selectedDate, "yyyy-MM-dd")
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-muted/30"
                  )}
                >
                  <span className="text-sm font-medium">
                    {format(new Date(day.date), "EEE, MMM d")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          day.total_calories > targetCalories ? "bg-destructive" : "bg-primary"
                        )}
                        style={{ width: `${Math.min((day.total_calories / targetCalories) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {day.total_calories} kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Weekly Average</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-muted/50 p-2 rounded-lg">
                  <p className="font-semibold text-foreground">{weeklyAvg.calories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-lg">
                  <p className="font-semibold text-foreground">{weeklyAvg.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-lg">
                  <p className="font-semibold text-foreground">{weeklyAvg.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-lg">
                  <p className="font-semibold text-foreground">{weeklyAvg.fats}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Summary;
