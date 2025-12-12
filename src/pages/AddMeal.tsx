import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Edit3, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

const AddMeal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    meal_type: "lunch",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAnalyzing(true);
    try {
      const base64 = await convertToBase64(file);

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64: base64.split(',')[1] }
      });

      if (error) {
        throw error;
      }

      if (data) {
        setFormData({
          name: data.name || "",
          meal_type: formData.meal_type,
          calories: data.calories?.toString() || "",
          protein: data.protein?.toString() || "",
          carbs: data.carbs?.toString() || "",
          fat: data.fat?.toString() || "",
        });
        toast.success("Food analyzed successfully!");
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast.error("Failed to analyze food. Please enter details manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("meals").insert({
      user_id: user.id,
      name: formData.name,
      meal_type: formData.meal_type,
      calories: parseInt(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fat) || 0,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Meal added successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Add Meal</h1>

          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo">
              <div className="space-y-6">
                {/* SmartBuckets Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Powered by SmartBuckets AI</div>
                    <div className="text-xs text-blue-100">Advanced image processing for increased accuracy</div>
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Food preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      {analyzing && (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing food...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Take a photo of your meal for AI analysis (powered by SmartBuckets AI)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>{imagePreview ? "Take Another Photo" : "Take Photo"}</span>
                    </Button>
                  </label>
                </div>

                {formData.name && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meal Type</Label>
                      <Select
                        value={formData.meal_type}
                        onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="morning_snack">Morning Snack</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Calories</Label>
                        <Input
                          type="number"
                          value={formData.calories}
                          onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Protein (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.protein}
                          onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Carbs (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.carbs}
                          onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fat (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.fat}
                          onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Adding..." : "Add Meal"}
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Meal Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Grilled Chicken Salad"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meal Type</Label>
                  <Select
                    value={formData.meal_type}
                    onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="morning_snack">Morning Snack</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories">Calories *</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="e.g., 450"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      placeholder="30"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      placeholder="45"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      placeholder="15"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Meal"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AddMeal;
