import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FormulaComparisonProps {
  results: Array<{
    formulaName: string;
    bmr: number;
    tdee: number;
    targetCalories: number;
    accuracy: string;
  }>;
  selectedFormula: string;
}

const FormulaComparison = ({ results, selectedFormula }: FormulaComparisonProps) => {
  const getAccuracyColor = (accuracy: string) => {
    if (accuracy.includes("Very High")) return "bg-green-100 text-green-800";
    if (accuracy.includes("High")) return "bg-blue-100 text-blue-800";
    if (accuracy.includes("Medium")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📈 Formula Comparison</CardTitle>
        <CardDescription>
          See how different formulas calculate your daily needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.formulaName === selectedFormula
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{result.formulaName}</h4>
                <Badge className={`text-xs ${getAccuracyColor(result.accuracy)}`}>
                  {result.accuracy}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">BMR</div>
                  <div className="font-medium">{result.bmr}</div>
                </div>
                <div>
                  <div className="text-gray-500">TDEE</div>
                  <div className="font-medium">{result.tdee}</div>
                </div>
                <div>
                  <div className="text-gray-500">Target</div>
                  <div className="font-medium">{result.targetCalories}</div>
                </div>
              </div>
              
              {result.formulaName === selectedFormula && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  ✓ Selected for use
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>Why multiple formulas?</strong> Each equation has strengths for different populations. 
            We use the most appropriate formula based on your characteristics, or default to Mifflin-St Jeor 
            which research shows is most accurate for modern populations.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormulaComparison;