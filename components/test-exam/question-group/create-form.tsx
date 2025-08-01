'use client';

import { useContext, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createQuestionGroup } from '@/actions/test-exam/question-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { QuestionType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ExamContext } from '@/global/exam-context';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import {
  QuestionGroupSchema,
  QuestionGroupSchemaType
} from '@/lib/validations/question-group';
import { AutosizeTextarea } from '@/components/ui/autosize-text-area';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function CreateQuestionGroupForm() {
  const [isPending, startTransition] = useTransition();
  const { isOpen, type, onClose } = useEditHook();
  const { selectedPart, selectedAssessment } = useContext(ExamContext);

  const isModalOpen = isOpen && type === 'createQuestionGroup';

  const form = useForm<QuestionGroupSchemaType>({
    resolver: zodResolver(QuestionGroupSchema),
    defaultValues: {
      title: '',
      startQuestionNumber: 1,
      endQuestionNumber: 4,
      description: '',
      additionalLetterOptions: ''
    }
  });

  if (!selectedAssessment || !selectedPart || !isModalOpen) {
    return null;
  }

  const onSubmit = async (values: QuestionGroupSchemaType) => {
    startTransition(async () => {
      try {
        await createQuestionGroup({
          formData: values,
          partId: selectedPart.id
        });

        toast.success('Created');
        form.reset();
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Group Title</FormLabel>
                    <FormControl>
                      <AutosizeTextarea
                        {...field}
                        disabled={isPending}
                        placeholder="Hello"
                        className="h-full"
                      />
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
                    <FormLabel>Question Group Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="write a number in here"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Group Type</FormLabel>
                    <Select disabled={isPending} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type for question" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="">
                        {Object.values(QuestionType)
                          .filter((type) => {
                            // Remove IDENTIFYING_INFORMATION from LISTENING assessments
                            if (
                              selectedAssessment?.sectionType === 'LISTENING' &&
                              type === 'IDENTIFYING_INFORMATION'
                            ) {
                              return false;
                            }
                            // Remove YES_NO_NOT_GIVEN from LISTENING assessments (reading only)
                            if (
                              selectedAssessment?.sectionType === 'LISTENING' &&
                              type === 'YES_NO_NOT_GIVEN'
                            ) {
                              return false;
                            }
                            return true;
                          })
                          .map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/_/g, ' ')}{' '}
                              {/* Convert underscores to spaces */}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Additional form fields for Table Completion */}
              {form.getValues().type === QuestionType.TABLE_COMPLETION && (
                <>
                  <FormField
                    control={form.control}
                    name="numberColumns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Columns</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter number of columns"
                            type="number"
                            min="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberRows"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Rows</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter number of rows"
                            type="number"
                            min="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {/* Additional form field for Letter Answer */}
              {form.getValues().type === QuestionType.LETTER_ANSWER && (
                <FormField
                  control={form.control}
                  name="additionalLetterOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Letter Answer Options (Required)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="A,B,C,D,E,F,G,H,I,J,K,L"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Configure ALL letter options to show in dropdowns (e.g.,
                        A,B,C,D,E,F,G,H,I,J). Only these letters will be
                        available for selection.
                      </p>
                    </FormItem>
                  )}
                />
              )}
              <div className="flex">
                <FormField
                  control={form.control}
                  name="startQuestionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Question</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="write a number in here"
                          type="number"
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endQuestionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Question</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="write a number in here"
                          type="number"
                          min="2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button disabled={isPending} type="submit" className="w-full">
              Create
            </Button>
          </form>
        </Form>
      </DialogContentWithScrollArea>
    </Dialog>
  );
}
