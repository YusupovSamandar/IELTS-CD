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
    .min(1, 'Answer is required')
    .max(10, 'Must be 10 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Must contain only capital letters and numbers')
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

  const handleAnswerChange = (value: string) => {
    // Only allow letters and numbers, automatically capitalize
    const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Limit to 10 characters
    const limitedAnswer = alphanumericOnly.slice(0, 10);

    form.setValue('correctLetter', limitedAnswer);
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
              <FormLabel>Correct Answer</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="A1"
                  maxLength={10}
                  className="w-32 h-12 text-center text-xl font-bold uppercase"
                  onChange={(e) => handleAnswerChange(e.target.value)}
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

                    // Ensure that it is a letter or number and stop if not
                    if (
                      (e.keyCode < 48 || e.keyCode > 57) && // Numbers 0-9
                      (e.keyCode < 65 || e.keyCode > 90) && // Letters A-Z
                      (e.keyCode < 97 || e.keyCode > 122) // Letters a-z
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Enter letters and/or numbers (e.g., A, B1, C23)
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
