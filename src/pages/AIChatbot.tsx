import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp,
  Heart,
  Activity,
  Brain,
  Loader2,
  Lightbulb,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'analysis';
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

const AIChatbot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userMeals, setUserMeals] = useState<MealData[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    fetchUserData();
    
    // Welcome message
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `👋 Hi! I'm your AI nutrition assistant. I can help you with:

🥗 **Diet & Nutrition** questions
💪 **Exercise** guidance  
📊 **Meal history analysis**
🎯 **Personalized recommendations**

Try asking me anything like:
• "What should I eat for muscle gain?"
• "Am I getting enough protein?"
• "Analyze my recent meals"
• "Create a workout plan"

What can I help you with today?`,
        type: 'text'
      });
    }, 500);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      setUserProfile(profile);
    }

    // Fetch recent meals (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: meals } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (meals) {
      setUserMeals(meals);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMessage = userMessage.toLowerCase();
    
    // Check for meal history analysis
    if (lowerMessage.includes('analyze') || lowerMessage.includes('history') || 
        lowerMessage.includes('recent meals') || lowerMessage.includes('past meals')) {
      return analyzeMealHistory();
    }
    
    // Check for nutrition questions
    if (lowerMessage.includes('protein') || lowerMessage.includes('macro') || 
        lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
      return generateNutritionResponse(lowerMessage);
    }
    
    // Check for exercise questions
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || 
        lowerMessage.includes('fitness') || lowerMessage.includes('training')) {
      return generateExerciseResponse(lowerMessage);
    }
    
    // Check for recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
        lowerMessage.includes('what should')) {
      return generateRecommendationResponse(lowerMessage);
    }
    
    // Default helpful response
    return generateGeneralResponse(lowerMessage);
  };

  const analyzeMealHistory = (): string => {
    if (userMeals.length === 0) {
      return `📊 **Meal Analysis**

I don't see any meals logged in the past 7 days. Start logging your meals to get personalized analysis and recommendations!

Try adding some meals first, then ask me to analyze your eating patterns. 🍽️`;
    }

    const totalCalories = userMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalProtein = userMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = userMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFats = userMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
    
    const avgCalories = totalCalories / userMeals.length;
    const avgProtein = totalProtein / userMeals.length;
    
    const proteinPerKg = userProfile?.weight ? avgProtein / userProfile.weight : 0;
    
    let analysis = `📊 **Your Meal Analysis (Past 7 Days)**

📈 **Summary:**
• **Meals logged:** ${userMeals.length}
• **Average calories per meal:** ${Math.round(avgCalories)} kcal
• **Average protein per meal:** ${Math.round(avgProtein)}g

🎯 **Nutrition Breakdown:**
• **Total Protein:** ${Math.round(totalProtein)}g
• **Total Carbs:** ${Math.round(totalCarbs)}g  
• **Total Fats:** ${Math.round(totalFats)}g

`;

    // Add insights based on data
    if (proteinPerKg >= 1.6) {
      analysis += `✅ **Great protein intake!** You're getting ${proteinPerKg.toFixed(1)}g per kg body weight.\n\n`;
    } else if (proteinPerKg > 0) {
      analysis += `⚠️ **Consider more protein:** Aim for 1.6-2.2g per kg body weight (you're at ${proteinPerKg.toFixed(1)}g/kg).\n\n`;
    }

    if (userProfile?.target_calories) {
      const projectedDaily = avgCalories * 3; // Assuming 3 meals/day
      if (Math.abs(projectedDaily - userProfile.target_calories) < 200) {
        analysis += `✅ **On track with calories!** Your daily average (${Math.round(projectedDaily)} kcal) aligns with your target (${userProfile.target_calories} kcal).\n\n`;
      } else {
        analysis += `📊 **Calorie adjustment needed:** Daily average (${Math.round(projectedDaily)} kcal) differs from target (${userProfile.target_calories} kcal).\n\n`;
      }
    }

    // Identify what they're missing
    analysis += `🔍 **What you might be missing:**\n`;
    
    if (avgProtein < 25) {
      analysis += `• **More protein-rich foods** (chicken, fish, eggs, legumes)\n`;
    }
    
    const fiberEstimate = totalCarbs * 0.1; // Rough fiber estimate
    if (fiberEstimate < 100) {
      analysis += `• **More fiber** (vegetables, whole grains, fruits)\n`;
    }
    
    if (totalFats / userMeals.length < 10) {
      analysis += `• **Healthy fats** (avocado, nuts, olive oil)\n`;
    }

    analysis += `\n💡 **Recommendation:** ${generateRecommendation(userProfile?.health_goal)}`;

    return analysis;
  };

  const generateNutritionResponse = (message: string): string => {
    if (message.includes('protein')) {
      return `💪 **Protein Guidelines**

🎯 **Daily protein needs:**
• **Sedentary:** 0.8g per kg body weight
• **Active:** 1.2-1.6g per kg body weight  
• **Building muscle:** 1.6-2.2g per kg body weight

🥗 **Best protein sources:**
• **Complete proteins:** Meat, fish, eggs, dairy
• **Plant-based:** Quinoa, buckwheat, chia seeds
• **Combining:** Rice + beans, hummus + pita

💡 **Timing tip:** Spread protein intake throughout the day for optimal muscle synthesis!`;
    }

    if (message.includes('macro') || message.includes('macronutrient')) {
      return `⚖️ **Macronutrient Balance**

🎯 **General guidelines:**
• **Protein:** 10-35% of calories (4 kcal/g)
• **Carbs:** 45-65% of calories (4 kcal/g)  
• **Fats:** 20-35% of calories (9 kcal/g)

🏋️ **For your goal (${userProfile?.health_goal || 'maintenance'}):**`;
    }

    return `🥗 **Nutrition Advice**

Based on your profile, here are some key nutrition tips:

${generateRecommendation(userProfile?.health_goal)}

Would you like me to analyze your recent meals for personalized insights? 📊`;
  };

  const generateExerciseResponse = (message: string): string => {
    if (message.includes('muscle') || message.includes('build')) {
      return `💪 **Building Muscle**

🎯 **Training Principles:**
• **Progressive overload:** Gradually increase weight/reps
• **Compound movements:** Squats, deadlifts, bench press
• **Frequency:** 3-4 days per week per muscle group
• **Rest:** 48-72 hours between same muscle workouts

🥗 **Nutrition support:**
• **Calorie surplus:** +300-500 calories daily
• **Protein timing:** 20-30g within 2 hours post-workout
• **Carbs:** Fuel workouts and recovery

💡 **Protein focus:** ${userProfile?.weight ? Math.round(userProfile.weight * 2) : '150'}g daily for optimal growth`;
    }

    return `🏃 **Exercise Guidance**

🎯 **For your goal (${userProfile?.health_goal || 'general fitness'}):**

${generateWorkoutPlan(userProfile?.health_goal)}

Remember to pair exercise with proper nutrition for best results! 🥗💪`;
  };

  const generateRecommendationResponse = (message: string): string => {
    return `🎯 **Personalized Recommendations**

${generateRecommendation(userProfile?.health_goal)}

📊 **Based on your profile:**
• **Target calories:** ${userProfile?.target_calories || '2000'} kcal/day
• **Health goal:** ${userProfile?.health_goal || 'maintain weight'}

💡 **Want more specific advice?** Ask me about:
• Meal timing strategies
• Supplement guidance
• Workout routines
• Recovery tips

What would you like to explore? 🤔`;
  };

  const generateGeneralResponse = (message: string): string => {
    return `🤖 **AI Nutrition Assistant**

I'm here to help with your health and fitness journey! Here's what I can do:

🥗 **Nutrition & Diet:**
• Custom meal plans
• Macro calculations
• Supplement advice
• Recipe ideas

💪 **Fitness & Exercise:**
• Workout routines
• Training plans
• Recovery guidance
• Exercise form tips

📊 **Personal Analysis:**
• Meal history review
• Nutrient deficiency checks
• Progress tracking
• Goal optimization

🎯 **Try asking:**
• "What should I eat today?"
• "Analyze my protein intake"
• "Create a workout plan"
• "Am I missing any nutrients?"

What specific area would you like help with? 💡`;
  };

  const generateRecommendation = (healthGoal?: string): string => {
    switch (healthGoal) {
      case 'lose_weight':
        return `• **Calorie deficit:** 500 calories below maintenance
• **High protein:** 30% of calories for satiety
• **Fiber-rich foods:** Vegetables, fruits, whole grains
• **Hydration:** 8-10 glasses water daily
• **Meal timing:** 3 main meals + 2 small snacks`;
      
      case 'gain_muscle':
        return `• **Calorie surplus:** +300-500 calories
• **Protein focus:** 25-35% of calories
• **Complex carbs:** Pre and post-workout
• **Healthy fats:** For hormone production
• **Meal frequency:** Every 3-4 hours`;
      
      case 'aggressive_loss':
        return `• **Moderate deficit:** 750-1000 calories below
• **Very high protein:** Preserve muscle mass
• **Volume eating:** Low-calorie, high-volume foods
• **Strength training:** Prevent muscle loss
• **Progress tracking:** Weekly check-ins`;
      
      default:
        return `• **Balanced approach:** 40% carbs, 30% protein, 30% fats
• **Whole foods:** Minimize processed items
• **Variety:** Different food groups daily
• **Consistency:** Regular meal times
• **Hydration:** 2-3 liters water daily`;
    }
  };

  const generateWorkoutPlan = (healthGoal?: string): string => {
    switch (healthGoal) {
      case 'lose_weight':
        return `• **Cardio:** 4-5 days/week, 30-45 minutes
• **Strength:** 3 days/week, full body
• **HIIT:** 2 days/week, 20 minutes
• **Active recovery:** Walking, stretching`;
      
      case 'gain_muscle':
        return `• **Strength:** 4-5 days/week, split routines
• **Progressive overload:** Key principle
• **Rest days:** 2-3 days for recovery
• **Compound lifts:** Focus on big movements`;
      
      default:
        return `• **Cardio:** 3 days/week, 30 minutes
• **Strength:** 2-3 days/week, full body
• **Flexibility:** Daily stretching
• **Active lifestyle:** Daily walks`;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userMessage);
      
      addMessage({
        role: 'assistant',
        content: aiResponse,
        type: userMessage.toLowerCase().includes('analyze') ? 'analysis' : 'text'
      });
    } catch (error) {
      console.error('AI Response Error:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (role: string) => {
    return role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />;
  };

  const getMessageColor = (type?: string) => {
    switch (type) {
      case 'analysis': return 'border-blue-200 bg-blue-50';
      case 'insight': return 'border-green-200 bg-green-50';
      case 'recommendation': return 'border-purple-200 bg-purple-50';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">AI Nutrition Assistant</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </header>

      <main className="flex flex-col h-[calc(100vh-73px)]">
        {/* Quick Stats */}
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3">
              <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
              <div className="text-sm font-medium">Diet</div>
              <div className="text-xs text-gray-600">Personalized</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
              <Activity className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <div className="text-sm font-medium">Exercise</div>
              <div className="text-xs text-gray-600">Goal-based</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3">
              <Brain className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <div className="text-sm font-medium">Analysis</div>
              <div className="text-xs text-gray-600">{userMeals.length} meals</div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                  {getMessageIcon(message.role)}
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : `bg-card border ${getMessageColor(message.type)}`
                }`}
              >
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                  {getMessageIcon(message.role)}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about diet, exercise, or nutrition..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Analyze my recent meals")}
              disabled={isLoading}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Analyze Meals
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("What should I eat today?")}
              disabled={isLoading}
            >
              <Target className="h-3 w-3 mr-1" />
              Meal Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Am I getting enough protein?")}
              disabled={isLoading}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Protein Check
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChatbot;