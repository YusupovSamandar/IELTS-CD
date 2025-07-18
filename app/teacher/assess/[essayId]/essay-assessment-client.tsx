'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { assessEssay, getNextEssayForTeacher } from '@/actions/test-exam/user-essay';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, User, FileText, Send, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type EssayData = {
  id: string;
  part1Result: string | null;
  part2Result: string | null;
  score: number | null;
  isAssessed: boolean;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
  assessment: {
    name: string;
    sectionType: string;
  };
};

interface EssayAssessmentClientProps {
  essay: EssayData;
  currentEssayId: string;
}

export function EssayAssessmentClient({ essay, currentEssayId }: EssayAssessmentClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState<number>(essay.score || 5);

  const handleSubmitAssessment = () => {
    startTransition(async () => {
      try {
        await assessEssay({ essayId: essay.id, score });
        toast.success('Essay assessed successfully');
        router.push('/teacher');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to assess essay');
      }
    });
  };

  const handleNextEssay = () => {
    startTransition(async () => {
      try {
        const nextEssay = await getNextEssayForTeacher(currentEssayId);
        if (nextEssay) {
          router.push(`/teacher/assess/${nextEssay.id}`);
        } else {
          toast.info('No more essays to assess');
          router.push('/teacher');
        }
      } catch (error) {
        toast.error('Failed to find next essay');
      }
    });
  };

  const countWords = (text: string | null) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBand = (score: number) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Competent';
    if (score >= 5) return 'Modest';
    if (score >= 4) return 'Limited';
    return 'Extremely Limited';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/teacher')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Essay Assessment</h1>
          <p className="text-muted-foreground">Review and score the student&apos;s writing</p>
        </div>
      </div>

      {/* Student and Assessment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p>{essay.user.name || 'Anonymous'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-muted-foreground">{essay.user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Submitted</Label>
              <p className="text-muted-foreground">
                {formatDistanceToNow(new Date(essay.createdAt), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Assessment</Label>
              <p>{essay.assessment.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Section</Label>
              <Badge variant="outline">{essay.assessment.sectionType}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={essay.isAssessed ? 'default' : 'secondary'}>
                {essay.isAssessed ? 'Assessed' : 'Not Assessed'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Essays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Part 1 */}
        <Card>
          <CardHeader>
            <CardTitle>Writing Task 1</CardTitle>
            <CardDescription>
              Report Writing (Target: ~150 words)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Word count: {countWords(essay.part1Result)}</span>
                <span className={countWords(essay.part1Result) >= 150 ? 'text-green-600' : 'text-orange-600'}>
                  {countWords(essay.part1Result) >= 150 ? 'Target met' : 'Below target'}
                </span>
              </div>
              <Textarea
                value={essay.part1Result || 'No submission for Part 1'}
                readOnly
                className="min-h-[300px] resize-none"
                placeholder="No submission for Part 1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Part 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Writing Task 2</CardTitle>
            <CardDescription>
              Essay Writing (Target: ~250 words)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Word count: {countWords(essay.part2Result)}</span>
                <span className={countWords(essay.part2Result) >= 250 ? 'text-green-600' : 'text-orange-600'}>
                  {countWords(essay.part2Result) >= 250 ? 'Target met' : 'Below target'}
                </span>
              </div>
              <Textarea
                value={essay.part2Result || 'No submission for Part 2'}
                readOnly
                className="min-h-[300px] resize-none"
                placeholder="No submission for Part 2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Assessment Score
          </CardTitle>
          <CardDescription>
            Provide an overall band score from 1 to 9 for the writing performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Band Score</Label>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)}
                </span>
                <Badge variant="outline" className={getScoreColor(score)}>
                  {getScoreBand(score)}
                </Badge>
              </div>
            </div>
            
            <div className="px-3">
              <Slider
                value={[score]}
                onValueChange={(value) => setScore(value[0])}
                max={9}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1.0</span>
                <span>5.0</span>
                <span>9.0</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Scoring Guidelines:</strong></p>
              <p>• 9.0: Expert user - Perfect command of language</p>
              <p>• 7.0-8.0: Good user - Operational command with occasional inaccuracies</p>
              <p>• 5.0-6.0: Modest/Competent user - Partial command with frequent problems</p>
              <p>• 1.0-4.0: Limited user - Basic competence in familiar situations only</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/teacher')}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleNextEssay}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Next Essay
            </Button>
            <Button 
              onClick={handleSubmitAssessment}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {essay.isAssessed ? 'Update Assessment' : 'Submit Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
