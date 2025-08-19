'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Highlighter } from 'lucide-react';
import { PassageExtended } from '@/types/test-exam';
import { ActionButton } from '../action-button';

interface HighlightRange {
  id: string;
  text: string;
  elementId: string;
  startOffset: number;
  endOffset: number;
}

function PassageRenderWithHighlightComponent({
  passage
}: {
  passage: PassageExtended;
}) {
  const [highlights, setHighlights] = useState<Map<string, HighlightRange[]>>(
    new Map()
  );
  const [showHighlightButton, setShowHighlightButton] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedElementId, setSelectedElementId] = useState('');
  const [tempRange, setTempRange] = useState<{
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<{
    elementId: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    // Don't use setTimeout - check selection immediately
    const selection = window.getSelection();
    if (
      selection &&
      selection.toString().trim() !== '' &&
      selection.rangeCount > 0
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Find which content element contains the selection
      const container = range.commonAncestorContainer;
      const element =
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : (container as Element);
      const contentElement = element?.closest(
        '[data-highlightable]'
      ) as HTMLElement;

      if (contentElement) {
        const selectedTextValue = selection.toString().trim();
        const elementId = contentElement.dataset.highlightableId || '';

        // Get text offsets relative to the content element
        const beforeRange = document.createRange();
        beforeRange.selectNodeContents(contentElement);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = beforeRange.toString().length;
        const endOffset = startOffset + selectedTextValue.length;

        console.log(
          'Text selected:',
          selectedTextValue,
          'Element ID:',
          elementId,
          'Offsets:',
          startOffset,
          endOffset
        );

        setSelectedText(selectedTextValue);
        setSelectedElementId(elementId);
        setTempRange({ startOffset, endOffset });
        setPendingHighlight({ elementId, startOffset, endOffset });
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowHighlightButton(true);

        // Keep the selection visible - don't clear it!
        // The selection will stay blue until the user clicks elsewhere or highlights
      }
    } else {
      console.log('No text selected or empty selection');
      // Only hide button if no text is selected
      setShowHighlightButton(false);
      setSelectedText('');
      setSelectedElementId('');
      setTempRange(null);
      setPendingHighlight(null);
    }
  };

  const handleHighlight = () => {
    if (selectedText && selectedElementId && tempRange) {
      const highlightId = `highlight-${Date.now()}-${Math.random()}`;
      const { startOffset, endOffset } = tempRange;

      const newHighlight: HighlightRange = {
        id: highlightId,
        text: selectedText,
        elementId: selectedElementId,
        startOffset,
        endOffset
      };

      setHighlights((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(selectedElementId) || [];
        newMap.set(selectedElementId, [...existing, newHighlight]);
        return newMap;
      });

      // Clear selection and hide button
      window.getSelection()?.removeAllRanges();
      setShowHighlightButton(false);
      setSelectedText('');
      setSelectedElementId('');
      setTempRange(null);
      setPendingHighlight(null);
    }
  };

  const renderHighlightedText = (content: string, elementId: string) => {
    const elementHighlights = highlights.get(elementId) || [];

    // Check if there's a pending highlight for this element
    const hasPendingHighlight =
      pendingHighlight && pendingHighlight.elementId === elementId;

    if (elementHighlights.length === 0 && !hasPendingHighlight) {
      return content;
    }

    // Combine actual highlights with pending highlight
    let allHighlights = [...elementHighlights];
    if (hasPendingHighlight) {
      allHighlights.push({
        id: 'pending',
        text: selectedText,
        elementId: elementId,
        startOffset: pendingHighlight.startOffset,
        endOffset: pendingHighlight.endOffset
      });
    }

    // Sort highlights by start position to avoid overlap issues
    const sortedHighlights = allHighlights.sort(
      (a, b) => a.startOffset - b.startOffset
    );

    let result = '';
    let lastIndex = 0;

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      result += content.slice(lastIndex, highlight.startOffset);

      // Different styling for pending vs actual highlights
      if (highlight.id === 'pending') {
        // Blue background like text selection
        result += `<span 
          class="pending-highlight" 
          style="background-color: #3b82f6; color: white; padding: 1px 2px;"
        >${content.slice(highlight.startOffset, highlight.endOffset)}</span>`;
      } else {
        // Yellow background for actual highlights
        result += `<mark 
          class="highlight-mark" 
          data-highlight-id="${highlight.id}" 
          data-element-id="${elementId}"
          style="background-color: yellow; padding: 1px 2px; position: relative; cursor: pointer;"
          onmouseenter="this.style.backgroundColor='orange'"
          onmouseleave="this.style.backgroundColor='yellow'"
          title="Click to remove highlight"
        >${content.slice(highlight.startOffset, highlight.endOffset)}</mark>`;
      }

      lastIndex = highlight.endOffset;
    });

    // Add remaining text
    result += content.slice(lastIndex);

    return result;
  };

  const handleRemoveHighlight = (highlightId: string, elementId: string) => {
    setHighlights((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(elementId) || [];
      const filtered = existing.filter((h) => h.id !== highlightId);
      if (filtered.length === 0) {
        newMap.delete(elementId);
      } else {
        newMap.set(elementId, filtered);
      }
      return newMap;
    });
  };

  // Add click handler for removing highlights
  useEffect(() => {
    const handleHighlightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('highlight-mark')) {
        const highlightId = target.dataset.highlightId;
        const elementId = target.dataset.elementId;
        if (highlightId && elementId) {
          handleRemoveHighlight(highlightId, elementId);
        }
      }
    };

    document.addEventListener('click', handleHighlightClick);
    return () => document.removeEventListener('click', handleHighlightClick);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only clear selection and hide button if:
      // 1. Not clicking on the highlight button
      // 2. Not clicking on existing highlights
      // 3. Actually clicking outside (not just losing selection)
      if (
        !target.closest('.highlight-button') &&
        !target.classList.contains('highlight-mark')
      ) {
        // Check if there's still a selection after the click
        setTimeout(() => {
          const selection = window.getSelection();
          if (!selection || selection.toString().trim() === '') {
            setShowHighlightButton(false);
            setSelectedText('');
            setSelectedElementId('');
            setTempRange(null);
            setPendingHighlight(null);
          }
        }, 10);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between">
        <div>
          <p className="font-bold">{passage.title}</p>
          <p className="italic font-light">{passage.description}</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            actionType="update"
            editType="editPassage"
            data={{ passage }}
          />
          <ActionButton
            actionType="delete"
            editType="deletePassage"
            data={{ passage }}
          />
        </div>
      </div>

      {/* Floating Highlight Button */}
      {showHighlightButton && (
        <div
          className="highlight-button fixed z-50 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md shadow-lg cursor-pointer transition-colors"
          style={{
            left: selectionPosition.x - 50,
            top: selectionPosition.y - 40
          }}
          onClick={handleHighlight}
        >
          <div className="flex items-center gap-1 text-sm font-medium">
            <Highlighter className="h-3 w-3" />
            Highlight
          </div>
        </div>
      )}

      <div
        ref={contentRef}
        onMouseUp={handleTextSelection}
        onSelect={handleTextSelection}
        className="select-text"
      >
        {passage.type === 'PASSAGE_SIMPLE' && (
          <div
            className="whitespace-pre-line"
            data-highlightable
            data-highlightable-id="simple-content"
            dangerouslySetInnerHTML={{
              __html: renderHighlightedText(
                passage.content || '',
                'simple-content'
              )
            }}
          />
        )}

        {passage.type === 'PASSAGE_MULTI_HEADING' && (
          <>
            {passage.passageHeadingList.map((passageHeading) => {
              const elementId = `heading-${passageHeading.id}`;
              return (
                <div key={passageHeading.id}>
                  <div className="flex justify-between">
                    <p className="font-bold">{passageHeading.title}</p>
                    <div className="flex gap-1">
                      <ActionButton
                        actionType="update"
                        editType="editPassageMultiHeading"
                        data={{ passageHeading }}
                      />
                      <ActionButton
                        actionType="delete"
                        editType="deletePassageHeading"
                        data={{ passageHeading }}
                      />
                    </div>
                  </div>
                  <div
                    className="whitespace-pre-line"
                    data-highlightable
                    data-highlightable-id={elementId}
                    dangerouslySetInnerHTML={{
                      __html: renderHighlightedText(
                        passageHeading.content || '',
                        elementId
                      )
                    }}
                  />
                </div>
              );
            })}
            <div className="flex justify-center mt-4">
              <ActionButton
                actionType="create"
                editType="createPassageHeading"
                data={{ passage }}
              >
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                  + Add Paragraph
                </div>
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary rerenders when timer updates
// Only rerender if the passage prop actually changes
export const PassageRenderWithHighlight = memo(
  PassageRenderWithHighlightComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.passage.id === nextProps.passage.id &&
      prevProps.passage.title === nextProps.passage.title &&
      prevProps.passage.content === nextProps.passage.content &&
      JSON.stringify(prevProps.passage.passageHeadingList) ===
        JSON.stringify(nextProps.passage.passageHeadingList)
    );
  }
);
