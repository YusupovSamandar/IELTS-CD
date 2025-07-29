'use client';

import { useEffect, useTransition } from 'react';
import { updateMultiOne } from '@/actions/question-type/multiple-choice/multi-one';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import { MultiOneUpdateSchema } from '@/lib/validations/question-type';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContentWithScrollArea } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function MultiOneUpdateForm() {
  const [isPending, startTransition] = useTransition();
  const { onClose, isOpen, type, data } = useEditHook();
  const isModalOpen = isOpen && type === 'editMultiOne';
  const multiOne = data?.multiOne;

  const form = useForm<z.infer<typeof MultiOneUpdateSchema>>({
    resolver: zodResolver(MultiOneUpdateSchema),
    defaultValues: {
      title: '',
      choices: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choices'
  });

  // ✨ FIX 1: Use form.reset() to safely populate the form.
  useEffect(() => {
    if (multiOne) {
      form.reset({
        title: multiOne.title,
        choices: multiOne.choices.map((choice) => ({
          id: choice.id,
          content: choice.content,
          isCorrect: choice.isCorrect
        }))
      });
    }
  }, [multiOne, form]); // form object is stable

  // ✨ FIX 2: Watch the 'choices' field to get the current correct index.
  const choices = form.watch('choices');
  const correctChoiceIndex =
    choices?.findIndex((choice) => choice.isCorrect) ?? -1;

  if (!multiOne || !isModalOpen) {
    return null;
  }

  const onSubmit = (values: z.infer<typeof MultiOneUpdateSchema>) => {
    startTransition(async () => {
      try {
        await updateMultiOne({
          formData: values,
          id: multiOne.id
        });

        toast.success('Updated');
        onClose();
      } catch (err) {
        catchError(err);
      }
    });
  };

  const addChoice = () => {
    append({ content: '', isCorrect: false });
  };

  const removeChoice = (index: number) => {
    if (fields.length > 3) {
      remove(index);
    }
  };

  const handleCorrectChoiceChange = (selectedIndex: number) => {
    // This logic is fine, it updates the form state correctly.
    fields.forEach((_, index) => {
      form.setValue(`choices.${index}.isCorrect`, index === selectedIndex, {
        shouldDirty: true
      });
    });
  };

  return (
    <Dialog onOpenChange={onClose} open={isModalOpen}>
      <DialogContentWithScrollArea>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multiple Choice Title</FormLabel>
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

              <div>
                <div className="flex items-center justify-between mb-4">
                  <FormLabel className="text-base">Answer Choices</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChoice}
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Choice
                  </Button>
                </div>
                <FormDescription className="mb-4">
                  Select exactly 1 choice as the correct answer. Only one choice
                  can be correct.
                </FormDescription>

                {/* ✨ FIX 3: Use the controlled `value` prop here. */}
                <RadioGroup
                  value={
                    correctChoiceIndex > -1 ? correctChoiceIndex.toString() : ''
                  }
                  onValueChange={(value) => {
                    handleCorrectChoiceChange(parseInt(value, 10));
                  }}
                  className="space-y-2"
                >
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-2 p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name={`choices.${index}.content`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={`Choice ${index + 1}`}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`choices.${index}.isCorrect`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem
                                  value={index.toString()}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Correct
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeChoice(index)}
                          disabled={isPending || fields.length <= 3}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <Button disabled={isPending} type="submit" className="w-full">
              Update Multiple Choice
            </Button>
          </form>
        </Form>
      </DialogContentWithScrollArea>
    </Dialog>
  );
}
