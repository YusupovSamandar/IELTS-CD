'use client';

import { useContext } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ExamContext } from '@/global/exam-context';
import { Dialog, DialogContent } from '../ui/dialog';

function SubmitModal() {
  const { isSubmit, submitProgress } = useContext(ExamContext);

  if (!isSubmit) {
    return null;
  }

  return (
    <Dialog open={isSubmit}>
      <DialogContent className="sm:max-w-md z-[100]">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Submitting Your Exam</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your answers and calculate your
              score...
            </p>
          </div>

          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${submitProgress}%` }}
            ></div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-medium">Processing: {submitProgress}%</p>
            <p className="text-xs text-muted-foreground font-medium">
              Do not close this window
            </p>
            <p className="text-xs text-muted-foreground">
              You will be redirected to your results shortly
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitModal;
