import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, Utensils, LogOut, User as UserIcon, ChefHat, Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import TodaySummary from "@/components/TodaySummary";
import RecentMeals from "@/components/RecentMeals";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkProfile(session.user.id), 0);
      } else {
        navigate("/auth");
      }
    });
    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);
    checkProfile(user.id);
  };

  const checkProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    if (!data) { navigate("/profile-setup"); } else { setProfile(data); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl"><Utensils className="h-6 w-6" /></div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FitScan</h1>
              <p className="text-muted-foreground text-sm">Welcome, {profile.name}!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")}><UserIcon className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/add-meal"><Card className="p-6 hover:shadow-lg transition-all hover:border-primary border-2"><div className="flex items-center gap-4"><div className="bg-primary text-primary-foreground p-3 rounded-xl"><PlusCircle className="h-6 w-6" /></div><div><h3 className="font-semibold">Add Meal</h3><p className="text-sm text-muted-foreground">Photo or manual entry</p></div></div></Card></Link>
          <Link to="/meal-planner"><Card className="p-6 hover:shadow-lg transition-all hover:border-success border-2"><div className="flex items-center gap-4"><div className="bg-success text-success-foreground p-3 rounded-xl"><ChefHat className="h-6 w-6" /></div><div><h3 className="font-semibold">Nutrition</h3><p className="text-sm text-muted-foreground">AI meal plans & analysis</p></div></div></Card></Link>
          <Link to="/ai-chatbot"><Card className="p-6 hover:shadow-lg transition-all hover:border-purple-500 border-2 bg-gradient-to-br from-purple-50 to-blue-50"><div className="flex items-center gap-4"><div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl"><Bot className="h-6 w-6" /></div><div><h3 className="font-semibold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">AI Assistant</h3><p className="text-sm text-muted-foreground">Diet & exercise help</p></div></div></Card></Link>
          <Link to="/summary"><Card className="p-6 hover:shadow-lg transition-all hover:border-accent border-2"><div className="flex items-center gap-4"><div className="bg-accent text-accent-foreground p-3 rounded-xl"><BarChart3 className="h-6 w-6" /></div><div><h3 className="font-semibold">Daily Summary</h3><p className="text-sm text-muted-foreground">View your stats</p></div></div></Card></Link>
        </div>

        <TodaySummary />
        <RecentMeals />
      </div>
    </div>
  );
};

export default Index;
