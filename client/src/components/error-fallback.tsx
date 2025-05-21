import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Send, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { reportUserFeedback } from "@/utils/error-tracking";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ErrorFallbackProps {
  error?: Error;
  errorId?: string;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, errorId, resetErrorBoundary }: ErrorFallbackProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleFeedbackSubmit = () => {
    if (feedback.trim() && errorId) {
      reportUserFeedback(errorId, feedback);
      setFeedbackSubmitted(true);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback. It helps us improve the application.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          
          <p className="text-gray-600 mb-4">
            We're sorry, but we encountered an unexpected error. Please try again or return to the home page.
          </p>
          
          {errorId && (
            <div className="text-xs text-gray-500 mb-2">
              Error ID: {errorId}
            </div>
          )}
          
          {error && (
            <Collapsible 
              className="w-full mb-4" 
              open={showDetails} 
              onOpenChange={setShowDetails}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-xs text-gray-500"
                >
                  {showDetails ? "Hide details" : "Show details"}
                  {showDetails ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 bg-gray-100 rounded-md w-full mt-2 text-left">
                  <p className="text-sm font-medium text-gray-900">Error details:</p>
                  <p className="text-xs text-gray-700 break-words">{error.message}</p>
                  {process.env.NODE_ENV === 'development' && error.stack && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-900">Stack trace (development only):</p>
                      <pre className="text-xs text-gray-700 overflow-auto max-h-40 p-2 bg-gray-200 rounded mt-1">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Feedback section */}
          {!feedbackSubmitted ? (
            <>
              {showFeedbackForm ? (
                <div className="w-full mt-2">
                  <Textarea
                    placeholder="Please describe what happened..."
                    className="resize-none mb-2"
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowFeedbackForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleFeedbackSubmit}
                      disabled={!feedback.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Submit
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mb-4"
                  onClick={() => setShowFeedbackForm(true)}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Report this issue
                </Button>
              )}
            </>
          ) : (
            <div className="text-sm text-green-600 mb-4">
              Thank you for your feedback!
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-3 pb-6">
          {resetErrorBoundary && (
            <Button onClick={resetErrorBoundary} variant="outline" className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button asChild className="gap-1">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}