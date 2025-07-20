'use client';

import { useEffect, useMemo, useTransition } from 'react';
import { updateLetterAnswerAnswers } from '@/actions/question-type/letter-answer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContentWithScrollArea } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const LetterAnswerSchema = z.object({
  letterAnswers: z.array(
    z.object({
      id: z.string(),
      correctLetter: z
        .string()
        .min(1, 'Letter is required')
        .max(1, 'Must be a single letter')
        .regex(/^[A-Z]$/, 'Must be a capital letter A-Z')
    })
  )
});

export function LetterAnswerUpdateForm() {
  const [isPending, startTransition] = useTransition();
  const { onClose, isOpen, type, data } = useEditHook();
  const isModalOpen = isOpen && type === 'editLetterAnswerAnswer';
  const questionGroup = data?.questionGroup;
  const letterAnswers = useMemo(
    () => questionGroup?.letterAnswers || [],
    [questionGroup?.letterAnswers]
  );

  const form = useForm<z.infer<typeof LetterAnswerSchema>>({
    resolver: zodResolver(LetterAnswerSchema),
    defaultValues: {
      letterAnswers: [{ id: '', correctLetter: '' }]
    }
  });

  useEffect(() => {
    if (letterAnswers.length > 0) {
      form.setValue(
        'letterAnswers',
        letterAnswers.map((letterAnswer) => ({
          id: letterAnswer.id,
          correctLetter: letterAnswer.correctLetter
        }))
      );
    }
  }, [form, letterAnswers]);

  if (!questionGroup || !isModalOpen) {
    return null;
  }

  const onSubmit = (values: z.infer<typeof LetterAnswerSchema>) => {
    startTransition(async () => {
      try {
        await updateLetterAnswerAnswers({
          letterAnswers: values.letterAnswers
        });
        form.reset();
        onClose();
        toast.success('Letter answers updated successfully');
      } catch (error) {
        catchError(error);
      }
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContentWithScrollArea className="max-w-2xl">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-bold mb-4">Update Letter Answers</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Update the titles and correct letters for each answer.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6">
            <div className="space-y-4">
              {letterAnswers.map((letterAnswer, index) => (
                <div key={letterAnswer.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">
                    Question {letterAnswer.question.questionNumber}
                  </h3>

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name={`letterAnswers.${index}.correctLetter`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correct Letter</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="A"
                              maxLength={1}
                              className="w-20"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                if (/^[A-Z]?$/.test(value)) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Answers'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContentWithScrollArea>
    </Dialog>
  );
}

export default LetterAnswerUpdateForm;
