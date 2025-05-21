import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber?: string;
  orderId?: number;
}

interface SlackStatus {
  available: boolean;
  message: string;
}

export function ChatDialog({ open, onOpenChange, orderNumber, orderId }: ChatDialogProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Query to check if Slack integration is available
  const { data: slackStatus, isLoading: checkingSlack } = useQuery<SlackStatus>({
    queryKey: ['/api/chat/status'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/chat/status');
        if (!response.ok) {
          return { available: false, message: t('chat.slackUnavailable') };
        }
        const data = await response.json();
        return data;
      } catch (error) {
        return { available: false, message: t('chat.slackUnavailable') };
      }
    },
    enabled: open, // Only run this query when the dialog is open
    staleTime: 60000, // Cache the result for 1 minute
    retry: 1
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMessage('');
      setLoading(false);
      setSuccess(false);
      setSlackEnabled(true);
      setError(null);
    }
  }, [open]);

  // Update slackEnabled state based on the status query
  useEffect(() => {
    if (slackStatus) {
      setSlackEnabled(slackStatus.available);
    }
  }, [slackStatus]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: t('common.error'),
        description: t('chat.emptyMessage'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/chat/support', {
        message,
        orderNumber,
        orderId,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        
        // Check if the message was sent to Slack or just recorded
        const slackEnabled = result.slackEnabled;
        
        toast({
          title: t('chat.messageSentTitle'),
          description: slackEnabled 
            ? t('chat.messageSentToOperations')
            : t('chat.messageRecordedNoSlack'),
        });
        
        // Close dialog after a delay
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else {
        throw new Error(result.message || t('chat.errorSending'));
      }
    } catch (error: any) {
      setError(error.message || t('chat.errorSending'));
      
      toast({
        title: t('common.error'),
        description: error.message || t('chat.errorSending'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('chat.chatWithOperations')}
          </DialogTitle>
          <DialogDescription>
            {orderNumber 
              ? t('chat.sendMessageForOrder').replace('{orderNumber}', orderNumber)
              : t('chat.sendMessageGeneral')}
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading state while checking Slack status */}
        {checkingSlack && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">{t('chat.checkingConnection')}</p>
          </div>
        )}
        
        {/* Slack unavailable warning */}
        {!checkingSlack && slackStatus && !slackStatus.available && !success && (
          <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('chat.slackUnavailableTitle')}</AlertTitle>
            <AlertDescription>
              {slackStatus.message || t('chat.slackUnavailableMessage')}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Success message */}
        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-medium">{t('chat.messageSentTitle')}</p>
            {slackEnabled ? (
              <p className="text-sm text-muted-foreground">{t('chat.operationsWillReply')}</p>
            ) : (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{t('chat.messageRecordedNoSlack')}</p>
                <Alert className="mt-2 border-amber-500 bg-amber-50 text-amber-900">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('chat.slackDisabledButRecorded')}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        ) : (
          /* Message form */
          !checkingSlack && (
            <>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder={t('chat.messagePlaceholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  disabled={loading || (slackStatus && !slackStatus.available)}
                />
                
                {error && (
                  <div className="text-sm text-red-500 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSendMessage}
                  disabled={loading || (slackStatus && !slackStatus.available)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('chat.sending')}
                    </>
                  ) : t('chat.send')}
                </Button>
              </DialogFooter>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}