import { useCallback, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getChoiceById } from '@/actions/question-type/multiple-choice/choice';
import { isChoiceCorrect } from '@/actions/question-type/multiple-choice/multi-one';
import { createOrUpdateListeningResult } from '@/actions/test-exam/listening-result';
import {
  getCorrectAnswerByQuestionId,
  getIdentifyInfoByQuestionId,
  getQuestion,
  getYesNoNotGivenAnswerByQuestionId
} from '@/actions/test-exam/question';
import { createOrUpdateResult } from '@/actions/test-exam/result';
import { number } from 'zod';
import { CHOICE_OPTIONS } from '@/config/constants';
import { AnswerType, ExamContext } from './exam-context';

export const useExamHandler = () => {
  const router = useRouter();
  const {
    userAnswers,
    questionRefs,
    setCurrentRef,
    currentRef,
    setActiveTab,
    selectedAssessment,
    setUserAnswers,
    selectedPart,
    timeRemaining,
    setMode,
    setIsSubmit,
    setSubmitProgress,
    triggerAutoSubmit,
    setTriggerAutoSubmit,
    essayValues
  } = useContext(ExamContext);

  const handleSubmit = useCallback(async () => {
    if (!selectedAssessment) {
      return null;
    }

    setIsSubmit(true);
    setSubmitProgress(0);

    // Handle writing assessments differently
    if (selectedAssessment.sectionType === 'WRITING') {
      console.log('Submitting writing essay:', essayValues);
      try {
        // Import the submit function dynamically
        const { submitWritingEssay } = await import(
          '@/actions/test-exam/user-essay'
        );

        const result = await submitWritingEssay({
          assessmentId: selectedAssessment.id,
          part1Result: essayValues[1] || '',
          part2Result: essayValues[2] || ''
        });

        setSubmitProgress(100);
        console.log('Writing essay submitted successfully');

        // Navigate immediately and keep modal open
        setMode(null);
        window.location.href = '/'; // Redirect to home page
        return;
      } catch (error) {
        console.error('Error submitting writing essay:', error);
        setIsSubmit(false);
        return;
      }
    }

    // Handle reading assessments (existing logic)
    console.log('User Answers:', userAnswers);
    let totalCorrectAnswers = 0;

    // Process answers sequentially to show progress
    for (let i = 0; i < userAnswers.length; i++) {
      const userAnswer = userAnswers[i];
      const question = await getQuestion({
        assessmentId: selectedAssessment.id,
        questionNumber: userAnswer.questionNumber
      });

      switch (userAnswer.type) {
        case 'MULTIPLE_CHOICE_ONE_ANSWER':
          const choice = await getChoiceById(userAnswer.choiceId);
          if (choice.isCorrect === true) {
            totalCorrectAnswers++;
          }
          break;

        case 'MULTI_MORE':
          let correctChoicesSelected = 0;
          let incorrectChoicesSelected = 0;

          for (const choiceId of userAnswer.choiceIdList) {
            const choiceCorrect = await isChoiceCorrect(choiceId);
            if (choiceCorrect) {
              correctChoicesSelected++;
            } else {
              incorrectChoicesSelected++;
            }
          }

          // Score based on correct answers only (no penalty for wrong choices)
          // If user selects both correct answers = 2 points
          // If user selects 1 correct answer = 1 point
          // If user selects 0 correct answers = 0 points
          if (incorrectChoicesSelected === 0) {
            totalCorrectAnswers += correctChoicesSelected; // 0, 1, or 2 points
          } else {
            // If any incorrect choice is selected, only count correct ones
            totalCorrectAnswers += correctChoicesSelected;
          }
          break;

        case 'IDENTIFY_INFO':
          const identifyCorrectAnswer = await getIdentifyInfoByQuestionId(
            question.id
          );
          if (identifyCorrectAnswer === userAnswer.content) {
            totalCorrectAnswers++;
          }
          break;
        case 'YES_NO_NOT_GIVEN':
          const yesNoNotGivenAnswer = await getYesNoNotGivenAnswerByQuestionId(
            question.id
          );
          if (yesNoNotGivenAnswer === userAnswer.content) {
            totalCorrectAnswers++;
          }
          break;

        case 'COMPLETION':
          if (question.correctAnswer === userAnswer.content) {
            totalCorrectAnswers++;
          }
          break;

        default:
          break;
      }

      // Update progress based on processed questions
      const progressPercentage = Math.round(
        ((i + 1) / selectedAssessment.totalQuestions) * 100
      );
      setSubmitProgress(progressPercentage);
    }
    const timeSpent = selectedAssessment.duration - timeRemaining;
    const score = 0.25 * totalCorrectAnswers;

    // Use appropriate result action based on section type
    let result;
    if (selectedAssessment.sectionType === 'LISTENING') {
      result = await createOrUpdateListeningResult({
        score,
        timeSpent,
        totalCorrectAnswers,
        assessmentId: selectedAssessment.id
      });
    } else {
      result = await createOrUpdateResult({
        score,
        timeSpent,
        totalCorrectAnswers,
        assessmentId: selectedAssessment.id
      });
    }

    // Navigate immediately and keep modal open
    setMode(null);
    window.location.href = '/'; // Redirect to home page

    console.log('🚀 ~ handleSubmit ~ score:', score);
  }, [
    selectedAssessment,
    userAnswers,
    setIsSubmit,
    setSubmitProgress,
    timeRemaining,
    essayValues,
    setMode
  ]);
  function handleQuestionSelected(questionNumber: number) {
    setCurrentRef(questionNumber - 1);
  }
  function handleAnswerChange(props: AnswerType) {
    const { questionNumber, type } = props;

    // Update or add the answer based on the type
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      const existingAnswerIndex = updatedAnswers.findIndex(
        (prev) => prev.questionNumber === questionNumber
      );

      // Create a new answer object based on the type
      const newAnswer = (() => {
        switch (type) {
          case 'MULTIPLE_CHOICE_ONE_ANSWER':
            return { questionNumber, type, choiceId: props.choiceId };
          case 'MULTI_MORE':
            return { questionNumber, type, choiceIdList: props.choiceIdList };
          case 'IDENTIFY_INFO':
            return { questionNumber, type, content: props.content };
          case 'YES_NO_NOT_GIVEN':
            return { questionNumber, type, content: props.content };
          case 'COMPLETION':
            return { questionNumber, type, content: props.content };
          default:
            throw new Error(`Unsupported answer type: ${type}`);
        }
      })();

      if (existingAnswerIndex !== -1) {
        updatedAnswers[existingAnswerIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }
      return updatedAnswers;
    });
  }
  function handleNextQuestion() {
    if (!selectedAssessment || !selectedPart) return null;

    // Handle writing assessments differently since they don't have questionGroups
    if (selectedAssessment.sectionType === 'WRITING') {
      const nextPart = selectedAssessment.parts.find(
        (part: any) => part.order === selectedPart.order + 1
      );
      if (nextPart) {
        setActiveTab(nextPart.id);
      } else {
        setActiveTab('delivering');
      }
      return;
    }

    // Handle reading assessments with questionGroups
    if (selectedPart.questionGroups && selectedPart.questionGroups.length > 0) {
      const lastQuestionNumber =
        selectedPart.questionGroups[selectedPart.questionGroups.length - 1]
          ?.endQuestionNumber;

      if (lastQuestionNumber && currentRef + 1 < lastQuestionNumber) {
        setCurrentRef(currentRef + 1);
        const ref = questionRefs[currentRef + 1]?.current;
        if (ref) {
          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ref.focus();
        }
      } else {
        const nextPart = selectedAssessment.parts.find(
          (part: any) => part.order === selectedPart.order + 1
        );
        if (nextPart) {
          setCurrentRef(
            nextPart.questionGroups?.[0]?.startQuestionNumber - 1 || 0
          );
          setActiveTab(nextPart.id);
        } else {
          setActiveTab('delivering');
        }
      }
    } else {
      // No question groups, move to next part or delivering
      const nextPart = selectedAssessment.parts.find(
        (part: any) => part.order === selectedPart.order + 1
      );
      if (nextPart) {
        setActiveTab(nextPart.id);
      } else {
        setActiveTab('delivering');
      }
    }
  }

  function handlePrevQuestion() {
    if (!selectedAssessment || !selectedPart) return null;

    // Handle writing assessments differently since they don't have questionGroups
    if (selectedAssessment.sectionType === 'WRITING') {
      const prevPart = selectedAssessment.parts.find(
        (part: any) => part.order === selectedPart.order - 1
      );
      if (prevPart) {
        setActiveTab(prevPart.id);
      }
      return;
    }

    // Handle reading assessments with questionGroups
    if (selectedPart.questionGroups && selectedPart.questionGroups.length > 0) {
      const startQuestionNumber =
        selectedPart.questionGroups[0]?.startQuestionNumber;

      if (startQuestionNumber && currentRef >= startQuestionNumber) {
        setCurrentRef(currentRef - 1);
        const ref = questionRefs[currentRef - 1]?.current;
        if (ref) {
          ref.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          ref.focus();
        }
      } else {
        const prevPart = selectedAssessment.parts.find(
          (part: any) => part.order === selectedPart.order - 1
        );
        if (prevPart) {
          setActiveTab(prevPart.id);
        }
      }
    } else {
      // No question groups, move to previous part
      const prevPart = selectedAssessment.parts.find(
        (part: any) => part.order === selectedPart.order - 1
      );
      if (prevPart) {
        setActiveTab(prevPart.id);
      }
    }
  }

  // Watch for auto-submit trigger
  useEffect(() => {
    if (triggerAutoSubmit) {
      handleSubmit();
      setTriggerAutoSubmit(false);
    }
  }, [triggerAutoSubmit, setTriggerAutoSubmit, handleSubmit]);

  const isHasNextQuestion = currentRef < questionRefs.length - 1;
  const isHasPrevQuestion = currentRef > 0;
  return {
    handleAnswerChange,
    handleSubmit,
    handleNextQuestion,
    handlePrevQuestion,
    handleQuestionSelected,
    isHasNextQuestion,
    isHasPrevQuestion
  };
};
