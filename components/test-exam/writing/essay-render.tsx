'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { removeEssayImage } from '@/actions/test-exam/essay-image-removal';
import { uploadEssayImage } from '@/actions/test-exam/essay-image-upload';
import { EssayPart } from '@prisma/client';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExamContext } from '@/global/exam-context';
import { ActionButton } from '@/components/test-exam/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface WritingEssayRenderProps {
  essayPart: EssayPart & { image?: string | null };
  mode?: 'edit' | 'exam' | 'practice';
  value?: string;
  onChange?: (value: string) => void;
}

const WritingEssayRender = ({
  essayPart,
  mode = 'exam',
  value = '',
  onChange
}: WritingEssayRenderProps) => {
  const [wordCount, setWordCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Count words in the text
  useEffect(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('essayPartId', essayPart.id);

    try {
      await uploadEssayImage(formData);
      toast.success('Image uploaded successfully');
      // Use router refresh instead of window.location.reload()
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeEssayImage(essayPart.id);
      toast.success('Image removed successfully');
      // Use router refresh instead of window.location.reload()
      router.refresh();
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove image');
    }
  };

  if (mode === 'edit') {
    return (
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{essayPart.title}</CardTitle>
            <Badge variant="outline">{essayPart.topic}</Badge>
          </div>
          <ActionButton
            actionType="update"
            editType="editEssayPart"
            data={{ essayPart }}
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {essayPart.description}
          </p>
          <p className="text-sm font-medium mb-4">
            Minimum words: {essayPart.maxWords}
          </p>

          {/* Image upload for Task 1 only */}
          {essayPart.partNumber === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Task Image</h4>
                {essayPart.image && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                )}
              </div>

              {!essayPart.image ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Upload an image for Task 1
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={essayPart.image}
                    alt={`Image for ${essayPart.title}`}
                    width={400}
                    height={300}
                    className="rounded-lg border border-border"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left side - Task/Part content */}
      <div className="w-1/2 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">{essayPart.title}</h2>
            <Badge variant="outline">{essayPart.topic}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {essayPart.description}
          </p>
          <p className="text-sm font-medium">
            Write at least {essayPart.maxWords} words.
          </p>
        </div>

        {/* Task content area */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Show image for Task 1 only */}
          {essayPart.partNumber === 1 && essayPart.image && (
            <div className="mb-4">
              <Image
                src={essayPart.image}
                alt={`Image for ${essayPart.title}`}
                width={500}
                height={400}
                className="rounded-lg border border-border max-w-full h-auto"
              />
            </div>
          )}

          {/* Additional task content can go here */}
          <div className="text-sm text-muted-foreground">
            {essayPart.partNumber === 1 ? (
              <p>Study the image above and write a descriptive report.</p>
            ) : (
              <p>Write an essay on the given topic.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Text area */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Word count: {wordCount}</span>
            <span
              className={
                wordCount > essayPart.maxWords ? 'text-destructive' : ''
              }
            >
              Minimum: {essayPart.maxWords} words
            </span>
          </div>
        </div>

        <div className="flex-1 p-4">
          <Textarea
            value={value}
            onChange={handleTextChange}
            placeholder={`Start writing your ${essayPart.title.toLowerCase()}...`}
            className="h-full resize-none font-mono leading-relaxed text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  );
};

export default WritingEssayRender;
