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
  placeholder = 'Enter a letter (A-Z)'
}: LetterAnswerProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow letters and automatically capitalize
    const letterOnly = input.replace(/[^a-zA-Z]/g, '').toUpperCase();

    // Limit to single character
    const singleLetter = letterOnly.slice(0, 1);

    setInputValue(singleLetter);
    onChange?.(singleLetter);
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

    // Ensure that it is a letter and stop if not
    if (
      (e.keyCode < 65 || e.keyCode > 90) &&
      (e.keyCode < 97 || e.keyCode > 122)
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`letter-${questionId}`} className="text-sm font-medium">
        Answer (Single Letter)
      </Label>
      <Input
        id={`letter-${questionId}`}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-16 h-16 text-center text-2xl font-bold uppercase"
        maxLength={1}
        autoComplete="off"
      />
      <p className="text-xs text-muted-foreground">
        Enter a single letter (A-Z)
      </p>
    </div>
  );
}
