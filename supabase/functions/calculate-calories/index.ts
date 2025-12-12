import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculationRequest {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  healthGoal: string;
  bodyFat?: number; // Optional for Katch-McArdle formula
  formula?: string; // Optional: user can choose formula
}

interface FormulaResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  explanation: string;
  formulaName: string;
  accuracy?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weight, height, age, gender, activityLevel, healthGoal, bodyFat, formula } = await req.json() as CalculationRequest;
    
    console.log("Calculating calories for:", { weight, height, age, gender, activityLevel, healthGoal, bodyFat, formula });

    // Enhanced activity multipliers based on multiple health sources (Calculator.net, Mayo Clinic, etc.)
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,        // Little or no exercise, desk job
      light: 1.375,          // Light exercise 1-3 days/week
      moderate: 1.55,        // Moderate exercise 3-5 days/week
      active: 1.725,         // Hard exercise 6-7 days/week
      very_active: 1.9,      // Very hard exercise daily, physical job
      extra_active: 2.0      // Extra active: very intense exercise + physical job
    };

    const multiplier = activityMultipliers[activityLevel] || 1.55;

    // Calculate BMR using multiple formulas
    const results: FormulaResult[] = [];

    // 1. Mifflin-St Jeor Equation (most accurate for modern populations)
    let bmrMifflin: number;
    if (gender === 'male') {
      bmrMifflin = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmrMifflin = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    results.push({
      bmr: bmrMifflin,
      tdee: bmrMifflin * multiplier,
      targetCalories: calculateTargetCalories(bmrMifflin * multiplier, healthGoal, gender),
      explanation: `Mifflin-St Jeor: Most accurate for modern populations. ${getFormulaExplanation('mifflin', gender, weight, height, age)}`,
      formulaName: "Mifflin-St Jeor",
      accuracy: "High - Recommended by most health professionals"
    });

    // 2. Revised Harris-Benedict Equation (classic but still widely used)
    let bmrHarris: number;
    if (gender === 'male') {
      bmrHarris = (13.397 * weight) + (4.799 * height) - (5.677 * age) + 88.362;
    } else {
      bmrHarris = (9.247 * weight) + (3.098 * height) - (4.330 * age) + 447.593;
    }
    
    results.push({
      bmr: bmrHarris,
      tdee: bmrHarris * multiplier,
      targetCalories: calculateTargetCalories(bmrHarris * multiplier, healthGoal, gender),
      explanation: `Revised Harris-Benedict: Classic formula, good for older populations. ${getFormulaExplanation('harris', gender, weight, height, age)}`,
      formulaName: "Revised Harris-Benedict",
      accuracy: "Medium - Still accurate for some populations"
    });

    // 3. Katch-McArdle Formula (if body fat percentage is provided)
    if (bodyFat && bodyFat > 0 && bodyFat < 100) {
      const leanBodyMass = weight * (1 - bodyFat / 100);
      const bmrKatch = 370 + (21.6 * leanBodyMass);
      
      results.push({
        bmr: bmrKatch,
        tdee: bmrKatch * multiplier,
        targetCalories: calculateTargetCalories(bmrKatch * multiplier, healthGoal, gender),
        explanation: `Katch-McArdle: Accounts for lean body mass. Most accurate for athletic individuals. Formula: 370 + (21.6 × ${leanBodyMass.toFixed(1)}kg LBM)`,
        formulaName: "Katch-McArdle",
        accuracy: "Very High - Best for people who know their body fat %"
      });
    }

    // Select the best result based on user preference or default to Mifflin-St Jeor
    let selectedResult: FormulaResult;
    if (formula && formula === 'harris') {
      selectedResult = results[1];
    } else if (formula === 'katch' && bodyFat) {
      selectedResult = results[results.length - 1];
    } else {
      selectedResult = results[0]; // Default to Mifflin-St Jeor
    }

    // Add zigzag calorie cycling options
    const zigzagOptions = generateZigzagOptions(selectedResult.tdee, healthGoal);

    // Add macronutrient suggestions based on goals
    const macroSuggestions = getMacroSuggestions(healthGoal, selectedResult.targetCalories);

    // Generate comprehensive explanation
    const detailedExplanation = generateDetailedExplanation(selectedResult, healthGoal, activityLevel, gender);

    console.log("Calculated:", { 
      bmr: Math.round(selectedResult.bmr), 
      tdee: Math.round(selectedResult.tdee), 
      targetCalories: selectedResult.targetCalories 
    });

    return new Response(JSON.stringify({
      targetCalories: selectedResult.targetCalories,
      bmr: Math.round(selectedResult.bmr),
      tdee: Math.round(selectedResult.tdee),
      explanation: detailedExplanation,
      formula: selectedResult.formulaName,
      accuracy: selectedResult.accuracy,
      allResults: results,
      zigzagOptions,
      macroSuggestions,
      healthInsights: getHealthInsights(selectedResult, age, weight, height)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    console.error("Error calculating calories:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function calculateTargetCalories(tdee: number, healthGoal: string, gender: string): number {
  let targetCalories: number;
  
  switch (healthGoal) {
    case 'lose_weight':
      // More sophisticated weight loss calculations
      const deficit = Math.min(750, Math.max(300, tdee * 0.2)); // 15-20% deficit, max 750
      targetCalories = Math.round(tdee - deficit);
      break;
    case 'gain_muscle':
      // Gradual surplus for lean muscle gain
      const surplus = Math.min(500, Math.max(250, tdee * 0.15)); // 10-15% surplus, max 500
      targetCalories = Math.round(tdee + surplus);
      break;
    case 'aggressive_loss':
      // For significant weight loss (under supervision)
      targetCalories = Math.round(tdee - Math.min(1000, tdee * 0.25));
      break;
    case 'maintain':
    default:
      targetCalories = Math.round(tdee);
      break;
  }

  // Ensure minimum safe calorie intake
  const minCalories = gender === 'male' ? 1500 : 1200;
  return Math.max(targetCalories, minCalories);
}

function getFormulaExplanation(formula: string, gender: string, weight: number, height: number, age: number): string {
  switch (formula) {
    case 'mifflin':
      if (gender === 'male') {
        return `Formula: (10 × ${weight}kg) + (6.25 × ${height}cm) − (5 × ${age}y) + 5`;
      } else {
        return `Formula: (10 × ${weight}kg) + (6.25 × ${height}cm) − (5 × ${age}y) − 161`;
      }
    case 'harris':
      if (gender === 'male') {
        return `Formula: (13.397 × ${weight}kg) + (4.799 × ${height}cm) − (5.677 × ${age}y) + 88.362`;
      } else {
        return `Formula: (9.247 × ${weight}kg) + (3.098 × ${height}cm) − (4.330 × ${age}y) + 447.593`;
      }
    default:
      return "";
  }
}

function generateZigzagOptions(tdee: number, healthGoal: string): any {
  const weeklyTarget = tdee * 7;
  
  if (healthGoal === 'maintain') {
    return {
      plan1: {
        name: "Weekend Higher",
        description: "Higher calories on weekends, lower on weekdays",
        weekdays: Math.round(tdee - 150),
        weekends: Math.round(tdee + 250)
      },
      plan2: {
        name: "Gradual Variation",
        description: "Gradual increase and decrease throughout the week",
        monday: Math.round(tdee - 100),
        tuesday: Math.round(tdee - 50),
        wednesday: Math.round(tdee),
        thursday: Math.round(tdee + 50),
        friday: Math.round(tdee + 100),
        saturday: Math.round(tdee + 150),
        sunday: Math.round(tdee - 50)
      }
    };
  } else {
    // Zigzag for weight loss or gain
    const adjustment = healthGoal === 'lose_weight' ? -250 : 200;
    return {
      plan1: {
        name: "3 High, 4 Low Days",
        description: "Three days at maintenance, four days at target",
        highDays: Math.round(tdee),
        lowDays: Math.round(tdee + adjustment)
      },
      plan2: {
        name: "Alternating Pattern",
        description: "Alternate between high and low calorie days",
        dayPattern: [Math.round(tdee), Math.round(tdee + adjustment), Math.round(tdee), Math.round(tdee + adjustment)]
      }
    };
  }
}

function getMacroSuggestions(goal: string, calories: number): any {
  const proteinPerKg = goal === 'gain_muscle' ? 2.2 : goal === 'lose_weight' ? 2.0 : 1.6;
  
  const macroRatios = {
    lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.30 },
    gain_muscle: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 }
  };

  const ratios = macroRatios[goal as keyof typeof macroRatios] || macroRatios.maintain;

  return {
    calories: calories,
    protein: {
      grams: Math.round((calories * ratios.protein) / 4),
      percentage: Math.round(ratios.protein * 100)
    },
    carbs: {
      grams: Math.round((calories * ratios.carbs) / 4),
      percentage: Math.round(ratios.carbs * 100)
    },
    fat: {
      grams: Math.round((calories * ratios.fat) / 9),
      percentage: Math.round(ratios.fat * 100)
    },
    recommendation: `Target ${proteinPerKg}g protein per kg body weight for ${goal === 'gain_muscle' ? 'optimal muscle growth' : goal === 'lose_weight' ? 'muscle preservation during weight loss' : 'general health'}`
  };
}

function generateDetailedExplanation(result: FormulaResult, healthGoal: string, activityLevel: string, gender: string): string {
  const goalDescriptions = {
    lose_weight: "Weight Loss: ~0.5kg per week with 15-20% calorie deficit",
    gain_muscle: "Muscle Gain: Lean bulking with 10-15% calorie surplus",
    maintain: "Maintenance: Balancing calories with energy expenditure"
  };

  const activityDescriptions = {
    sedentary: "Little or no exercise, desk job",
    light: "Light exercise 1-3 days/week",
    moderate: "Moderate exercise 3-5 days/week",
    active: "Hard exercise 6-7 days/week",
    very_active: "Very hard exercise daily, physical job"
  };

  let explanation = `**${result.formulaName} Formula Used**\n\n`;
  explanation += `**Basal Metabolic Rate (BMR):** ${Math.round(result.bmr)} calories/day\n`;
  explanation += `**Total Daily Energy Expenditure (TDEE):** ${Math.round(result.tdee)} calories/day\n`;
  explanation += `**Activity Level:** ${activityDescriptions[activityLevel as keyof typeof activityDescriptions] || 'Moderate activity'}\n`;
  explanation += `**Goal:** ${goalDescriptions[healthGoal as keyof typeof goalDescriptions] || 'General health'}\n\n`;
  
  explanation += `**Recommended Daily Target:** ${result.targetCalories} calories\n\n`;
  explanation += `**Safety Notes:**\n`;
  explanation += `• Minimum safe intake: ${gender === 'male' ? '1,500' : '1,200'} calories/day\n`;
  explanation += `• Safe weight loss: 0.5-1kg per week (250-750 calorie deficit)\n`;
  explanation += `• Muscle gain: 200-500 calorie surplus recommended\n`;
  explanation += `• Consult healthcare provider for extreme diets`;

  return explanation;
}

function getHealthInsights(result: FormulaResult, age: number, weight: number, height: number): string[] {
  const insights: string[] = [];
  
  // BMI-based insights
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) {
    insights.push("Your BMI suggests you're underweight. Focus on nutrient-dense foods.");
  } else if (bmi > 30) {
    insights.push("Your BMI suggests obesity. Gradual weight loss is recommended for health benefits.");
  } else if (bmi >= 25) {
    insights.push("Your BMI suggests overweight. Moderate calorie deficit advised.");
  }

  // Age-based insights
  if (age > 65) {
    insights.push("As you age, ensure adequate protein intake to preserve muscle mass.");
  } else if (age < 25) {
    insights.push("Young adults have higher metabolic rates - this is optimal for building habits.");
  }

  // Goal-specific insights
  if (result.targetCalories < result.bmr) {
    insights.push("Warning: Target calories below BMR. This is not sustainable long-term.");
  }

  return insights;
}
