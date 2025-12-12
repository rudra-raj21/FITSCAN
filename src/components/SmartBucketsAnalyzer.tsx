import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  Zap, 
  Brain, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Database,
  Cpu
} from "lucide-react";

interface SmartBucketsAnalysis {
  foodItems: Array<{
    name: string;
    confidence: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    category: string;
    healthScore: number;
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
  recommendations: Array<{
    category: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

const SmartBucketsAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<SmartBucketsAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Mock SmartBuckets AI analysis
  const mockSmartBucketsAnalysis = (fileName: string): SmartBucketsAnalysis => {
    // Simulate different analysis results based on time or random selection
    const mockResults = [
      {
        foodItems: [
          {
            name: "Grilled Chicken Breast",
            confidence: 98,
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
            category: "Lean Protein",
            healthScore: 95
          },
          {
            name: "Brown Rice",
            confidence: 94,
            calories: 216,
            protein: 5,
            carbs: 45,
            fats: 1.8,
            category: "Complex Carbs",
            healthScore: 85
          },
          {
            name: "Broccoli",
            confidence: 91,
            calories: 55,
            protein: 3.7,
            carbs: 11,
            fats: 0.6,
            category: "Vegetables",
            healthScore: 98
          }
        ],
        insights: [
          {
            type: 'positive' as const,
            title: "High-Quality Protein",
            description: "Excellent lean protein source for muscle maintenance and repair"
          },
          {
            type: 'info' as const,
            title: "Balanced Macronutrients",
            description: "Well-balanced meal with optimal protein-to-carb ratio"
          }
        ],
        recommendations: [
          {
            category: "Portion Size",
            suggestion: "Consider adding 50g more chicken for optimal protein intake",
            impact: "medium" as const
          }
        ]
      },
      {
        foodItems: [
          {
            name: "Caesar Salad",
            confidence: 89,
            calories: 280,
            protein: 14,
            carbs: 12,
            fats: 22,
            category: "Salad",
            healthScore: 72
          },
          {
            name: "Croutons",
            confidence: 85,
            calories: 120,
            protein: 3,
            carbs: 20,
            fats: 4,
            category: "Refined Carbs",
            healthScore: 45
          }
        ],
        insights: [
          {
            type: 'warning' as const,
            title: "High Saturated Fat",
            description: "Caesar dressing contains high levels of saturated fat"
          },
          {
            type: 'info' as const,
            title: "Protein Content",
            description: "Good protein source but could be optimized"
          }
        ],
        recommendations: [
          {
            category: "Ingredient Swap",
            suggestion: "Replace croutons with nuts for healthier fats and protein",
            impact: "high" as const
          },
          {
            category: "Dressing",
            suggestion: "Consider light vinaigrette instead of Caesar dressing",
            impact: "medium" as const
          }
        ]
      }
    ];

    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    return {
      ...result,
      totalNutrition: {
        calories: result.foodItems.reduce((sum, item) => sum + item.calories, 0),
        protein: result.foodItems.reduce((sum, item) => sum + item.protein, 0),
        carbs: result.foodItems.reduce((sum, item) => sum + item.carbs, 0),
        fats: result.foodItems.reduce((sum, item) => sum + item.fats, 0)
      }
    };
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    
    // Simulate SmartBuckets AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = mockSmartBucketsAnalysis(imageFile.name);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return "bg-red-100 text-red-800";
      case 'medium': return "bg-yellow-100 text-yellow-800";
      case 'low': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* SmartBuckets Branding Header */}
      <Card className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">SmartBuckets AI</h2>
                <p className="text-blue-200 text-sm">Powered by LiquidMetal AI Technology</p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <Brain className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Neural Vision</div>
              <div className="text-xs text-blue-200">Advanced food recognition</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <Cpu className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Quantum Analysis</div>
              <div className="text-xs text-blue-200">Sub-100ms processing</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <Target className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Precision Nutrition</div>
              <div className="text-xs text-blue-200">95%+ accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-600" />
            Food Image Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {imageFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-600">{imageFile.name}</p>
                  <p className="text-sm text-gray-500">Ready for SmartBuckets analysis</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">Drop your food image here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
          </div>

          {imageFile && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    SmartBuckets AI Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze with SmartBuckets
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5" />
                SmartBuckets Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-purple-600">{analysis.totalNutrition.calories}</p>
                  <p className="text-sm text-gray-600">Total Calories</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-600">{analysis.totalNutrition.protein}g</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-amber-600">{analysis.totalNutrition.carbs}g</p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{analysis.totalNutrition.fats}g</p>
                  <p className="text-sm text-gray-600">Fats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Items Detected */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Foods Detected ({analysis.foodItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.foodItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge className={getHealthScoreColor(item.healthScore)}>
                          Health Score: {item.healthScore}/100
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="font-semibold text-purple-600">{item.confidence}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="font-semibold text-purple-600">{item.calories}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                    <div className="bg-red-50 rounded p-2">
                      <p className="font-semibold text-red-600">{item.protein}g</p>
                      <p className="text-xs text-gray-500">Protein</p>
                    </div>
                    <div className="bg-amber-50 rounded p-2">
                      <p className="font-semibold text-amber-600">{item.carbs}g</p>
                      <p className="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <p className="font-semibold text-blue-600">{item.fats}g</p>
                      <p className="text-xs text-gray-500">Fats</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Detection Confidence</span>
                      <span>{item.confidence}%</span>
                    </div>
                    <Progress value={item.confidence} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SmartBuckets Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                SmartBuckets Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start gap-3">
                    {insight.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                    {insight.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                    {insight.type === 'info' && <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />}
                    <div>
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1">{rec.category}</Badge>
                    <p className="text-sm">{rec.suggestion}</p>
                  </div>
                  <Badge className={getImpactColor(rec.impact)}>
                    {rec.impact} impact
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartBucketsAnalyzer;