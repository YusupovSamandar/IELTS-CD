'use client';

import React, { useContext } from 'react';
import { Delete, Edit, Plus, XCircle } from 'lucide-react';
import { EditData, EditType } from '@/global/edit-context';
import { ExamContext } from '@/global/exam-context';
import { useEditHook } from '@/global/use-edit-hook';
import { Button } from '../ui/button';

export const ActionButton = ({
  actionType,
  editType,
  data,
  children
}: {
  actionType: 'create' | 'update' | 'delete' | 'close';
  editType: EditType;
  data?: EditData;
  children?: React.ReactNode;
}) => {
  const { onOpen, onClose } = useEditHook();
  const { mode } = useContext(ExamContext);

  const renderIcon = () => {
    switch (actionType) {
      case 'create':
        return children || <Plus />;
      case 'update':
        return children || <Edit />;
      case 'delete':
        return children || <Delete />;
      case 'close':
        return children || <XCircle />;
      default:
        return null;
    }
  };

  // Only show action buttons in edit mode, except for createAssessment which should always be visible
  if (mode !== 'edit' && editType !== 'createAssessment') {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() =>
        actionType === 'close' ? onClose() : onOpen({ type: editType, data })
      }
    >
      {renderIcon()}
    </Button>
  );
};
