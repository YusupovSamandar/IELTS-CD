'use client';

import { useMemo, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const LetterAnswerSchema = z.object({
  letterAnswers: z.array(
    z.object({
      id: z.string(),
      correctLetter: z
        .string()
        .min(1, 'Answer is required')
        .regex(/^[A-Z0-9]+$/, 'Answer must contain only letters and numbers')
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

  // Get available options from question group's additionalLetterOptions
  const availableOptions = useMemo(() => {
    if (!questionGroup?.additionalLetterOptions) {
      return ['A', 'B', 'C', 'D', 'E', 'F']; // Default options
    }

    return questionGroup.additionalLetterOptions
      .split(',')
      .map((option) => option.trim().toUpperCase())
      .filter((option) => option.length > 0 && /^[A-Z0-9]+$/.test(option))
      .sort();
  }, [questionGroup?.additionalLetterOptions]);

  const defaultValues = useMemo(
    () => ({
      letterAnswers: letterAnswers.map((letterAnswer) => ({
        id: letterAnswer.id,
        correctLetter: letterAnswer.correctLetter || ''
      }))
    }),
    [letterAnswers]
  );

  const form = useForm<z.infer<typeof LetterAnswerSchema>>({
    resolver: zodResolver(LetterAnswerSchema),
    values: defaultValues // Use the actual data, not hardcoded values
  });

  // Form is initialized with reactive values that update when letterAnswers change

  // Don't render until we have actual data
  if (!questionGroup || !isModalOpen || letterAnswers.length === 0) {
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
            Select the correct answers from the available options for each
            question.
          </p>
        </div>

        <Form {...form}>
          <form
            key={questionGroup?.id}
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 pb-6"
          >
            <div className="space-y-4">
              {letterAnswers.map((letterAnswer, index) => (
                <div key={letterAnswer.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">
                    Question {letterAnswer.question.questionNumber}
                  </h3>

                  <div className="space-y-3">
                    <FormField
                      key={`${letterAnswer.id}-${letterAnswer.correctLetter}`}
                      control={form.control}
                      name={`letterAnswers.${index}.correctLetter`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correct Answer</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? letterAnswer.correctLetter}
                              onValueChange={field.onChange}
                              disabled={isPending}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            DB: &quot;{letterAnswer.correctLetter}&quot; | Form:
                            &quot;{field.value}&quot; | Options:{' '}
                            {availableOptions.join(', ')}
                          </p>
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
