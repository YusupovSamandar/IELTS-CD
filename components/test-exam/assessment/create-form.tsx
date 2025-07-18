'use client';

import { useEffect, useState, useTransition } from 'react';
import { createAssessment } from '@/actions/test-exam/assessment';
import { zodResolver } from '@hookform/resolvers/zod';
import { SectionType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import { AssessmentSchema } from '@/lib/validations/text-exam';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

export function CreateAssessmentForm() {
  const [isPending, startTransition] = useTransition();
  const [existingTypes, setExistingTypes] = useState<SectionType[]>([]);
  const { type, isOpen, onClose } = useEditHook();
  const user = useCurrentUser();
  const isModalOpen = isOpen && type === 'createAssessment';

  const form = useForm<z.infer<typeof AssessmentSchema>>({
    resolver: zodResolver(AssessmentSchema),
    defaultValues: {
      name: '',
      sectionType: SectionType.READING
    }
  });

  // Fetch existing assessment types when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchExistingTypes = async () => {
        try {
          const response = await fetch('/api/assessments/existing-types');
          const data = await response.json();
          setExistingTypes(data.existingTypes || []);
        } catch (error) {
          console.error('Failed to fetch existing types:', error);
          setExistingTypes([]);
        }
      };
      fetchExistingTypes();
    }
  }, [isModalOpen]);

  // Admin-only protection - must be after all hooks
  if (user?.role !== 'ADMIN') {
    return null;
  }

  // Get available section types (exclude existing ones)
  const availableSectionTypes = Object.values(SectionType).filter(
    (sectionType) => !existingTypes.includes(sectionType)
  );

  const onSubmit = async (values: z.infer<typeof AssessmentSchema>) => {
    startTransition(async () => {
      try {
        await createAssessment({
          formData: values
        });
        toast.success('Created');
        onClose();
      } catch (err) {
        catchError(err);
      }
    });
  };
  if (!isModalOpen) {
    return null;
  }
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Cambridge Academy 16"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Type</FormLabel>
                    {availableSectionTypes.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground border rounded-md">
                        All assessment types have been created. No more types
                        available.
                      </div>
                    ) : (
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSectionTypes.map((sectionType) => (
                            <SelectItem key={sectionType} value={sectionType}>
                              {sectionType.charAt(0) +
                                sectionType.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={isPending} type="submit" className="w-full">
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
