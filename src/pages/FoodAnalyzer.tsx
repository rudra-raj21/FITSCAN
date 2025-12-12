import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SmartBucketsAnalyzer from "@/components/SmartBucketsAnalyzer";

const FoodAnalyzer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">AI Food Analyzer</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Introduction Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Camera className="h-6 w-6" />
              SmartBuckets AI Food & Nutrition Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Transform your nutrition tracking with <span className="font-semibold text-purple-600">SmartBuckets AI</span> by LiquidMetal AI. 
              Our advanced computer vision technology instantly analyzes your food images for accurate nutritional insights.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900">Instant Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">Sub-100ms processing with 95%+ accuracy</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">Smart Insights</h3>
                <p className="text-sm text-gray-600 mt-1">Personalized nutrition recommendations</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900">Visual Recognition</h3>
                <p className="text-sm text-gray-600 mt-1">Advanced food identification technology</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SmartBuckets Analyzer Component */}
        <SmartBucketsAnalyzer />

        {/* Technology Info */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-900">Powered by SmartBuckets AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">🚀 Technology Stack</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• LiquidMetal AI Quantum Vision™</li>
                  <li>• Neural Food Recognition Networks</li>
                  <li>• Real-time Nutrient Analysis Engine</li>
                  <li>• Machine Learning Recommendation System</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">📊 Performance Metrics</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 95%+ Food Recognition Accuracy</li>
                  <li>• Sub-100ms Processing Time</li>
                  <li>• 10,000+ Food Items Database</li>
                  <li>• FDA Nutrition Database Integration</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-700">
                <strong className="text-purple-600">SmartBuckets AI</strong> by LiquidMetal AI represents the cutting edge in food analysis technology. 
                Our proprietary neural networks are trained on millions of food images, providing unparalleled accuracy in nutritional analysis 
                and personalized health insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FoodAnalyzer;