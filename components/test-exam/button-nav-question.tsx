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
    <div className="fixed bottom-20 right-4 h-20 z-50 flex gap-2">
      <Button
        onClick={() => handlePrevQuestion()}
        disabled={!isHasPrevQuestion}
        size="xl"
        className="shadow-lg"
      >
        <ArrowLeft />
      </Button>
      <Button
        onClick={() => handleNextQuestion()}
        disabled={!isHasNextQuestion}
        size="xl"
        className="shadow-lg"
      >
        <ArrowRight />
      </Button>
    </div>
  );
}

export default ButtonNavigationQuestion;
