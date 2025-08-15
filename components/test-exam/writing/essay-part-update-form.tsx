'use client';

import { useEffect } from 'react';
import { updateEssayPart } from '@/actions/test-exam/essay-part';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEditHook } from '@/global/use-edit-hook';
import { EssayPartSchema } from '@/lib/validations/text-exam';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type EssayPartFormValues = z.infer<typeof EssayPartSchema>;

export function EssayPartUpdateForm() {
  const { isOpen, onClose, type, data } = useEditHook();
  const isModalOpen = isOpen && type === 'editEssayPart';

  const form = useForm<EssayPartFormValues>({
    resolver: zodResolver(EssayPartSchema),
    defaultValues: {
      topic: '',
      title: '',
      description: '',
      maxWords: 250
    }
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isModalOpen && data?.essayPart) {
      form.reset({
        topic: data.essayPart.topic,
        title: data.essayPart.title,
        description: data.essayPart.description,
        maxWords: data.essayPart.maxWords
      });
    }
  }, [isModalOpen, data?.essayPart, form]);

  const onSubmit = async (values: EssayPartFormValues) => {
    try {
      if (!data?.essayPart?.id) {
        throw new Error('Essay part ID is required');
      }

      await updateEssayPart({
        formData: values,
        id: data.essayPart.id
      });

      toast.success('Essay part updated successfully');

      // Emit a custom event to notify other components of the update
      window.dispatchEvent(
        new CustomEvent('essayPartUpdated', {
          detail: { essayPartId: data.essayPart.id }
        })
      );

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update essay part'
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Essay Part</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Writing Task 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Report Writing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a detailed description for this writing task..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxWords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Words</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={50}
                      max={500}
                      placeholder="250"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Updating...'
                  : 'Update Essay Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
