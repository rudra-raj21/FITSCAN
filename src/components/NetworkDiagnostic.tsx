import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { testSupabaseConnection } from "@/integrations/supabase/client";

const NetworkDiagnostic = ({ showOnLoad = false }: { showOnLoad?: boolean }) => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  const runTest = async () => {
    setStatus('checking');
    setErrorDetails('');
    
    try {
      const success = await testSupabaseConnection();
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorDetails('Connection test failed - check console for details');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorDetails(error.message);
    }
  };

  useEffect(() => {
    if (showOnLoad) {
      runTest();
    }
  }, [showOnLoad]);

  if (status === 'checking') {
    return (
      <Alert>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Supabase Connection...</AlertTitle>
        <AlertDescription>
          Testing network connectivity to your Supabase project.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'success') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Supabase Connected</AlertTitle>
        <AlertDescription>
          Your Supabase project is accessible and configured correctly.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Network Error Detected</AlertTitle>
        <AlertDescription>
          {errorDetails}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2"
          >
            {showDetails ? 'Hide' : 'Show'} Fixes
          </Button>
        </AlertDescription>
        {showDetails && (
          <div className="mt-3 p-3 bg-white rounded border border-red-200">
            <h4 className="font-semibold text-sm mb-2">Common Fixes:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Check Supabase project is active (not paused)</li>
              <li>• Verify VITE_SUPABASE_URL is correct</li>
              <li>• Ensure VITE_SUPABASE_ANON_KEY is valid</li>
              <li>• Check if your network blocks Supabase</li>
              <li>• Try restarting your dev server</li>
            </ul>
            <Button 
              onClick={runTest} 
              size="sm" 
              variant="outline"
              className="mt-2"
            >
              Test Again
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  return (
    <Button onClick={runTest} variant="outline" size="sm">
      Test Connection
    </Button>
  );
};

export default NetworkDiagnostic;