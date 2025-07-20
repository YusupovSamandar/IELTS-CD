'use client';

import { useTransition } from 'react';
import { deletePassage } from '@/actions/test-exam/passage';
import { toast } from 'sonner';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export function PassageDeleteForm() {
  const [isPending, startTransition] = useTransition();
  const { onClose, isOpen, type, data } = useEditHook();
  const isModalOpen = isOpen && type === 'deletePassage';
  const passage = data?.passage;

  if (!passage || !isModalOpen) {
    return null;
  }

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await deletePassage(passage.id);
        toast.success('Passage deleted successfully');
        onClose();
      } catch (err) {
        catchError(err);
      }
    });
  };

  return (
    <Dialog onOpenChange={onClose} open={isModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Passage</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the passage &quot;{passage.title}
            &quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Passage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
