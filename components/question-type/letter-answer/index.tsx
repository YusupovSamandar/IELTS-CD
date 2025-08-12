'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LetterAnswerProps {
  questionId: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function LetterAnswer({
  questionId,
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Enter answer (e.g., A, B1, C23)'
}: LetterAnswerProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow letters and numbers, automatically capitalize
    const alphanumericOnly = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Limit to 10 characters
    const limitedAnswer = alphanumericOnly.slice(0, 10);

    setInputValue(limitedAnswer);
    onChange?.(limitedAnswer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return;
    }

    // Ensure that it is a letter or number and stop if not
    if (
      (e.keyCode < 48 || e.keyCode > 57) && // Numbers 0-9
      (e.keyCode < 65 || e.keyCode > 90) && // Letters A-Z
      (e.keyCode < 97 || e.keyCode > 122) // Letters a-z
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`letter-${questionId}`} className="text-sm font-medium">
        Answer
      </Label>
      <Input
        id={`letter-${questionId}`}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-32 h-12 text-center text-xl font-bold uppercase"
        maxLength={10}
        autoComplete="off"
      />
      <p className="text-xs text-muted-foreground">
        Enter letters and/or numbers (e.g., A, B1, C23)
      </p>
    </div>
  );
}
