'use client';

import { useEffect, useTransition } from 'react';
import { updateMultiMore } from '@/actions/question-type/multiple-choice/multi-more';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import { MultiMoreUpdateSchema } from '@/lib/validations/question-type';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

export function MultiMoreUpdateForm() {
  const [isPending, startTransition] = useTransition();
  const { onClose, isOpen, type, data } = useEditHook();
  const isModalOpen = isOpen && type === 'editMultiMore';
  const multiMore = data?.multiMore;

  const form = useForm<z.infer<typeof MultiMoreUpdateSchema>>({
    resolver: zodResolver(MultiMoreUpdateSchema),
    defaultValues: {
      title: '',
      choices: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choices'
  });

  useEffect(() => {
    if (multiMore) {
      form.setValue('title', multiMore.title);
      form.setValue(
        'choices',
        multiMore.choices.map((choice) => ({
          id: choice.id,
          content: choice.content,
          isCorrect: choice.isCorrect
        }))
      );
    }
  }, [form, multiMore]);

  if (!multiMore || !isModalOpen) {
    return null;
  }

  const onSubmit = (values: z.infer<typeof MultiMoreUpdateSchema>) => {
    startTransition(async () => {
      try {
        await updateMultiMore({
          formData: values,
          id: multiMore.id
        });

        toast.success('Updated');
        onClose();
      } catch (err) {
        catchError(err);
      }
    });
  };

  const addChoice = () => {
    append({
      content: '',
      isCorrect: false
    });
  };

  const removeChoice = (index: number) => {
    if (fields.length > 3) {
      remove(index);
    }
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
                  Select exactly 2 choices as correct answers. This question
                  type requires exactly 2 correct options.
                </FormDescription>

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
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
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
