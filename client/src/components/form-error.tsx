import { AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackError } from "@/utils/error-tracking";

interface FormErrorProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * A specialized error component for form validation errors
 * Shows user-friendly validation messages with field-specific errors
 */
export function FormError({
  title,
  message,
  type = 'error',
  className = '',
  fieldErrors
}: FormErrorProps) {
  // Automatically track the form error for analytics
  if (type === 'error') {
    trackError(new Error(message), 'FormError');
  }
  
  // Choose icon based on error type
  const Icon = type === 'error' 
    ? AlertCircle 
    : type === 'warning' 
      ? AlertTriangle 
      : HelpCircle;
  
  // Determine alert variant based on type  
  const variant = type === 'error' 
    ? 'destructive' 
    : 'default'; // Use default for both warning and info since Alert only supports 'default' or 'destructive'
  
  // Default title if not provided  
  const defaultTitle = type === 'error' 
    ? 'Error' 
    : type === 'warning' 
      ? 'Warning' 
      : 'Information';
      
  // The Alert component only accepts 'default' or 'destructive' variants
  const alertVariant = type === 'error' ? 'destructive' : 'default';
  
  return (
    <Alert variant={alertVariant} className={`my-4 ${className}`}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || defaultTitle}</AlertTitle>
      <AlertDescription>
        {message}
        
        {/* If field errors are provided, show them in a list */}
        {fieldErrors && Object.keys(fieldErrors).length > 0 && (
          <div className="mt-2 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(fieldErrors).map(([field, errors]) => (
                <li key={field}>
                  <span className="font-medium">{field}:</span>{' '}
                  {errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}