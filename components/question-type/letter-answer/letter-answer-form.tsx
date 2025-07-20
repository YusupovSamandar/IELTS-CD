'use client';

import { useState, useTransition } from 'react';
import {
  createLetterAnswer,
  updateLetterAnswer
} from '@/actions/question-type/letter-answer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const letterAnswerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  correctLetter: z
    .string()
    .min(1, 'Letter is required')
    .max(1, 'Must be a single letter')
    .regex(/^[A-Z]$/, 'Must be a capital letter A-Z')
});

type LetterAnswerFormData = z.infer<typeof letterAnswerSchema>;

interface LetterAnswerFormProps {
  questionGroupId: string;
  questionId: string;
  initialData?: {
    id: string;
    title: string;
    correctLetter: string;
  };
  onSuccess?: () => void;
}

export function LetterAnswerForm({
  questionGroupId,
  questionId,
  initialData,
  onSuccess
}: LetterAnswerFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<LetterAnswerFormData>({
    resolver: zodResolver(letterAnswerSchema),
    defaultValues: {
      title: initialData?.title || '',
      correctLetter: initialData?.correctLetter || ''
    }
  });

  const onSubmit = (data: LetterAnswerFormData) => {
    startTransition(async () => {
      try {
        let result;
        if (isEditing) {
          result = await updateLetterAnswer(initialData.id, data);
        } else {
          result = await createLetterAnswer({
            ...data,
            questionGroupId,
            questionId
          });
        }

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.success);
          form.reset();
          onSuccess?.();
        }
      } catch (error) {
        toast.error('Something went wrong');
      }
    });
  };

  const handleLetterChange = (value: string) => {
    // Only allow letters and automatically capitalize
    const letterOnly = value.replace(/[^a-zA-Z]/g, '').toUpperCase();

    // Limit to single character
    const singleLetter = letterOnly.slice(0, 1);

    form.setValue('correctLetter', singleLetter);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Enter question title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correctLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer (Single Letter)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="A"
                  maxLength={1}
                  className="w-16 h-16 text-center text-2xl font-bold uppercase"
                  onChange={(e) => handleLetterChange(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow backspace, delete, tab, escape, enter
                    if (
                      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true)
                    ) {
                      return;
                    }

                    // Ensure that it is a letter and stop if not
                    if (
                      (e.keyCode < 65 || e.keyCode > 90) &&
                      (e.keyCode < 97 || e.keyCode > 122)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Enter a single letter (A-Z)
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
          {onSuccess && (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
