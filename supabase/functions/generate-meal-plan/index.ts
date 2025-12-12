import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetCalories, dietType, restrictions, cuisinePreference, healthGoal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating meal plan for:", { targetCalories, dietType, restrictions, cuisinePreference, healthGoal });

    const systemPrompt = `You are a professional nutritionist and meal planner. Generate a detailed daily meal plan based on the user's requirements with accurate nutritional information and health insights.

IMPORTANT: You must respond by calling the create_meal_plan function with the complete meal plan data. Ensure all nutritional values are realistic and mathematically consistent.`;

    const userPrompt = `Create a meal plan with the following requirements:
- Target calories: ${targetCalories} kcal
- Diet type: ${dietType}
${restrictions ? `- Dietary restrictions: ${restrictions}` : ''}
${cuisinePreference ? `- Cuisine preference: ${cuisinePreference}` : ''}
${healthGoal ? `- Health goal: ${healthGoal}` : ''}

Include breakfast, lunch, dinner, and 1-2 healthy snacks. For each meal, provide:
- A descriptive, appetizing name
- Brief description highlighting nutritional benefits
- Accurate calorie count (realistic for the portion size)
- Precise macronutrients (protein, carbs, fats in grams)
- Key ingredients with specific quantities

CRITICAL REQUIREMENTS:
1. Ensure total calories are within 100 kcal of target (${targetCalories})
2. Macronutrients must be mathematically consistent (protein: 4 kcal/g, carbs: 4 kcal/g, fats: 9 kcal/g)
3. Focus on whole, nutrient-dense foods
4. Include a variety of food groups throughout the day
5. Consider meal timing and digestion patterns
6. Provide adequate protein based on health goals
7. Balance micronutrients through colorful vegetables and fruits

GOAL-SPECIFIC OPTIMIZATIONS:
${healthGoal === 'gain_muscle' ? '- Prioritize higher protein (25-35% of calories)\n- Include complex carbs for energy\n- Add healthy fats for hormone production' : ''}
${healthGoal === 'lose_weight' ? '- Focus on high protein (30%+) for satiety\n- Include fiber-rich vegetables\n- Moderate healthy fats for satisfaction' : ''}
${healthGoal === 'maintain' ? '- Balanced macronutrients\n- Include diverse food groups\n- Focus on nutritional completeness' : ''}

Make the meals appealing, practical to prepare, and nutritionally optimized for the user's specific goals.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_meal_plan",
              description: "Create a structured meal plan with all meals and nutritional information",
              parameters: {
                type: "object",
                properties: {
                  breakfast: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fats: { type: "number" },
                      ingredients: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "description", "calories", "protein", "carbs", "fats", "ingredients"]
                  },
                  lunch: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fats: { type: "number" },
                      ingredients: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "description", "calories", "protein", "carbs", "fats", "ingredients"]
                  },
                  dinner: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fats: { type: "number" },
                      ingredients: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "description", "calories", "protein", "carbs", "fats", "ingredients"]
                  },
                  snacks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        calories: { type: "number" },
                        protein: { type: "number" },
                        carbs: { type: "number" },
                        fats: { type: "number" },
                        ingredients: { type: "array", items: { type: "string" } }
                      },
                      required: ["name", "description", "calories", "protein", "carbs", "fats", "ingredients"]
                    }
                  }
                },
                required: ["breakfast", "lunch", "dinner", "snacks"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_meal_plan" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function.name === "create_meal_plan") {
      const mealPlan = JSON.parse(toolCall.function.arguments);
      
      // Calculate totals
      const allMeals = [mealPlan.breakfast, mealPlan.lunch, mealPlan.dinner, ...mealPlan.snacks];
      const totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
      const totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
      const totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);
      const totalFats = allMeals.reduce((sum, m) => sum + m.fats, 0);

      return new Response(JSON.stringify({
        ...mealPlan,
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFats: Math.round(totalFats),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid AI response format");

  } catch (error: unknown) {
    console.error("Error generating meal plan:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
