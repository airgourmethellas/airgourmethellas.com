import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderAnnotation } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Trash2, Edit, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface OrderAnnotationsProps {
  orderId: number;
}

export default function OrderAnnotations({ orderId }: OrderAnnotationsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<OrderAnnotation | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editIsInternal, setEditIsInternal] = useState(false);

  // Fetch annotations
  const { data: annotations, isLoading } = useQuery<OrderAnnotation[]>({
    queryKey: [`/api/orders/${orderId}/annotations`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/orders/${orderId}/annotations`);
      return res.json();
    }
  });

  // Create annotation
  const createAnnotationMutation = useMutation({
    mutationFn: async ({ content, isInternal }: { content: string, isInternal: boolean }) => {
      const res = await apiRequest('POST', `/api/orders/${orderId}/annotations`, {
        content,
        isInternal
      });
      return res.json();
    },
    onSuccess: () => {
      setNewAnnotation('');
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}/annotations`] });
      toast({
        title: t('Annotation added'),
        description: t('Your annotation has been added to this order'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('Error'),
        description: error.message || t('Failed to add annotation'),
        variant: 'destructive',
      });
    }
  });

  // Update annotation
  const updateAnnotationMutation = useMutation({
    mutationFn: async ({ id, content, isInternal }: { id: number, content: string, isInternal: boolean }) => {
      const res = await apiRequest('PATCH', `/api/orders/${orderId}/annotations/${id}`, {
        content,
        isInternal
      });
      return res.json();
    },
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditingAnnotation(null);
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}/annotations`] });
      toast({
        title: t('Annotation updated'),
        description: t('Your annotation has been updated'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('Error'),
        description: error.message || t('Failed to update annotation'),
        variant: 'destructive',
      });
    }
  });

  // Delete annotation
  const deleteAnnotationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/orders/${orderId}/annotations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}/annotations`] });
      toast({
        title: t('Annotation deleted'),
        description: t('The annotation has been removed'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('Error'),
        description: error.message || t('Failed to delete annotation'),
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;

    createAnnotationMutation.mutate({
      content: newAnnotation,
      isInternal: isInternal
    });
  };

  const handleEdit = (annotation: OrderAnnotation) => {
    setEditingAnnotation(annotation);
    setEditContent(annotation.content);
    setEditIsInternal(annotation.isInternal);
    setEditDialogOpen(true);
  };

  const handleUpdateAnnotation = () => {
    if (!editingAnnotation || !editContent.trim()) return;

    updateAnnotationMutation.mutate({
      id: editingAnnotation.id,
      content: editContent,
      isInternal: editIsInternal
    });
  };

  const handleDeleteAnnotation = (id: number) => {
    if (confirm(t('Are you sure you want to delete this annotation?'))) {
      deleteAnnotationMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const isAdminOrKitchen = user?.role === 'admin' || user?.role === 'kitchen';

  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">{t('Loading annotations...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-3 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          {t('Add Annotation')}
        </h3>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder={t('Enter your comment or instruction about this order...')}
            className="mb-2"
          />
          
          {isAdminOrKitchen && (
            <div className="flex items-center mb-3">
              <Checkbox 
                id="internal-annotation" 
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked as boolean)}
              />
              <Label htmlFor="internal-annotation" className="ml-2">
                {t('Internal note (only visible to staff)')}
              </Label>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={!newAnnotation.trim() || createAnnotationMutation.isPending}
            className="w-full sm:w-auto"
          >
            {createAnnotationMutation.isPending ? t('Adding...') : t('Add Annotation')}
          </Button>
        </form>
      </div>
      
      {annotations && annotations.length > 0 ? (
        <div className="space-y-3">
          {annotations.map((annotation) => (
            <Card key={annotation.id} className={annotation.isInternal ? 'border-amber-200 bg-amber-50' : ''}>
              <CardHeader className="py-3 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium flex items-center">
                    {annotation.isInternal && (
                      <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs mr-2">
                        {t('INTERNAL')}
                      </span>
                    )}
                    {annotation.userId === user?.id ? t('You') : t('Staff')}
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {formatDate(annotation.created.toString())}
                  </p>
                </div>
                
                {annotation.userId === user?.id || user?.role === 'admin' ? (
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(annotation)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('Edit')}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteAnnotation(annotation.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('Delete')}</span>
                    </Button>
                  </div>
                ) : null}
              </CardHeader>
              
              <CardContent className="py-3">
                <p className="text-sm whitespace-pre-wrap">{annotation.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>{t('No annotations yet')}</p>
          <p className="text-sm">{t('Add the first annotation to collaborate on this order')}</p>
        </div>
      )}
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Edit Annotation')}</DialogTitle>
            <DialogDescription>
              {t('Update your comment or note about this order')}
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder={t('Enter your comment...')}
            className="mb-2"
          />
          
          {isAdminOrKitchen && (
            <div className="flex items-center mb-3">
              <Checkbox 
                id="edit-internal-annotation" 
                checked={editIsInternal}
                onCheckedChange={(checked) => setEditIsInternal(checked as boolean)}
              />
              <Label htmlFor="edit-internal-annotation" className="ml-2">
                {t('Internal note (only visible to staff)')}
              </Label>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button 
              onClick={handleUpdateAnnotation}
              disabled={!editContent.trim() || updateAnnotationMutation.isPending}
            >
              {updateAnnotationMutation.isPending ? t('Updating...') : t('Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}