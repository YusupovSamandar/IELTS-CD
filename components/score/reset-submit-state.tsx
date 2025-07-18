'use client';

import { useContext, useEffect } from 'react';
import { ExamContext } from '@/global/exam-context';

export default function ResetSubmitState() {
  const { setIsSubmit } = useContext(ExamContext);

  useEffect(() => {
    // Reset the submit state when the score page loads
    setIsSubmit(false);
  }, [setIsSubmit]);

  return null; // This component doesn't render anything
}
