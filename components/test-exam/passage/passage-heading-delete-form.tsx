'use client';

import { useState } from 'react';
import { deletePassageHeading } from '@/actions/test-exam/passage';
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

export function PassageHeadingDeleteForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { data, type, isOpen, onClose } = useEditHook();
  const isModalOpen = isOpen && type === 'deletePassageHeading';
  const passageHeading = data?.passageHeading;

  if (!isModalOpen || !passageHeading) {
    return null;
  }

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePassageHeading(passageHeading.id);
      toast.success('Paragraph deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting passage heading:', error);
      toast.error('Failed to delete paragraph');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Paragraph</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this paragraph? This action cannot
            be undone.
            <br />
            <br />
            <strong>Paragraph:</strong> {passageHeading.title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
