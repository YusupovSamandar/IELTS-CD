import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useExamHandler } from '@/global/use-exam-handler';
import { Button } from '@/components/ui/button';

function ButtonNavigationQuestion() {
  const {
    handleNextQuestion,
    handlePrevQuestion,
    isHasNextQuestion,
    isHasPrevQuestion
  } = useExamHandler();

  return (
    <div className="fixed top-2 right-2 z-50 flex gap-1">
      <Button
        onClick={() => handlePrevQuestion()}
        disabled={!isHasPrevQuestion}
        size="lg"
        className="shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Button
        onClick={() => handleNextQuestion()}
        disabled={!isHasNextQuestion}
        size="lg"
        className="shadow-lg"
      >
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default ButtonNavigationQuestion;
