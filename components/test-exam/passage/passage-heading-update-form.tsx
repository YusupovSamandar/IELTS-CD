'use client';

import { useEffect, useTransition } from 'react';
import { updatePassageHeading } from '@/actions/test-exam/passage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import { PassageMultiHeadingSchema } from '@/lib/validations/text-exam';
import { Dialog, DialogContentWithScrollArea } from '@/components/ui/dialog';
import { AutosizeTextarea } from '../../ui/autosize-text-area';
import { Button } from '../../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../ui/form';
import { Input } from '../../ui/input';

export function PassageHeadingUpdateForm() {
  const [isPending, startTransition] = useTransition();
  const { data, type, isOpen, onClose } = useEditHook();
  const isModalOpen = isOpen && type === 'editPassageMultiHeading';
  const passageHeading = data?.passageHeading;

  const form = useForm<z.infer<typeof PassageMultiHeadingSchema>>({
    resolver: zodResolver(PassageMultiHeadingSchema),
    defaultValues: {
      title: '',
      content: ''
    }
  });

  useEffect(() => {
    if (passageHeading) {
      form.setValue('title', passageHeading.title);
      form.setValue('content', passageHeading.content);
    }
  }, [passageHeading, form]);

  // Early return if not the right modal type or not open
  if (!isModalOpen) {
    return null;
  }

  // Second check for passageHeading data
  if (!passageHeading) {
    return null;
  }

  const onSubmit = (values: z.infer<typeof PassageMultiHeadingSchema>) => {
    startTransition(async () => {
      try {
        await updatePassageHeading({
          formData: values,
          id: passageHeading.id
        });

        toast.success('Passage heading updated successfully');
        onClose();
      } catch (err) {
        catchError(err);
      }
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContentWithScrollArea>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Enter heading title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading Content</FormLabel>
                    <FormControl>
                      <AutosizeTextarea
                        {...field}
                        disabled={isPending}
                        placeholder="Type the content for this heading..."
                        className="h-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button disabled={isPending} variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContentWithScrollArea>
    </Dialog>
  );
}
