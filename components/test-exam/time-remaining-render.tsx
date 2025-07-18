import { useContext } from 'react';
import { ExamContext } from '@/global/exam-context';
import { formatTime } from '@/lib/utils';

const TimeRemainingRender = () => {
  const { timeRemaining } = useContext(ExamContext);
  return <p>{formatTime(timeRemaining)}</p>;
};

export default TimeRemainingRender;
