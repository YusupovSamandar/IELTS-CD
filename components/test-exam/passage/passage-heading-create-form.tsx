'use client';

import { useState } from 'react';
import { createPassageHeading } from '@/actions/test-exam/passage';
import { toast } from 'sonner';
import { useEditHook } from '@/global/use-edit-hook';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export function PassageHeadingCreateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { data, type, isOpen, onClose } = useEditHook();
  const isModalOpen = isOpen && type === 'createPassageHeading';
  const passage = data?.passage;

  if (!isModalOpen || !passage) {
    return null;
  }

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createPassageHeading(passage.id);
      toast.success('New paragraph added successfully');
      onClose();
    } catch (error) {
      console.error('Error creating passage heading:', error);
      toast.error('Failed to add new paragraph');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Paragraph</DialogTitle>
          <DialogDescription>
            This will add a new paragraph to the passage. You can edit the
            content after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Paragraph'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
