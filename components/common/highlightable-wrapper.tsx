'use client';

import { useState, useRef, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useHighlight, HighlightRange } from '@/global/highlight-context';
import { Highlighter } from 'lucide-react';

interface HighlightableWrapperProps {
  children: ReactNode;
  elementId: string;
  className?: string;
}

export function HighlightableWrapper({ children, elementId, className = '' }: HighlightableWrapperProps) {
  const { highlights, addHighlight, removeHighlight } = useHighlight();
  const [showHighlightButton, setShowHighlightButton] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [tempRange, setTempRange] = useState<{ startOffset: number; endOffset: number } | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<{ startOffset: number; endOffset: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '' && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Check if selection is within this element
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
      const isWithinElement = contentRef.current?.contains(element);
      
      if (isWithinElement && contentRef.current) {
        const selectedTextValue = selection.toString().trim();
        
        // Get text offsets relative to this element using a more accurate method
        const getTextOffset = (container: Node, offset: number) => {
          if (!contentRef.current) return 0;
          
          // Create a range from the start of the element to the target position
          const range = document.createRange();
          range.setStart(contentRef.current, 0);
          range.setEnd(container, offset);
          
          // Count text characters, accounting for non-text nodes
          const walker = document.createTreeWalker(
            range.cloneContents(),
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let textLength = 0;
          let node;
          while (node = walker.nextNode()) {
            textLength += (node.textContent || '').length;
          }
          
          return textLength;
        };
        
        const startOffset = getTextOffset(range.startContainer, range.startOffset);
        const endOffset = startOffset + selectedTextValue.length;
        
        setSelectedText(selectedTextValue);
        setTempRange({ startOffset, endOffset });
        setPendingHighlight({ startOffset, endOffset });
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowHighlightButton(true);
      }
    } else {
      setShowHighlightButton(false);
      setSelectedText('');
      setTempRange(null);
      setPendingHighlight(null);
    }
  }, []);

  const handleHighlight = useCallback(() => {
    if (selectedText && tempRange) {
      const highlightId = `highlight-${Date.now()}-${Math.random()}`;
      const { startOffset, endOffset } = tempRange;
      
      const newHighlight: HighlightRange = {
        id: highlightId,
        text: selectedText,
        elementId: elementId,
        startOffset,
        endOffset
      };
      
      addHighlight(elementId, newHighlight);
      
      // Clear selection and hide button
      window.getSelection()?.removeAllRanges();
      setShowHighlightButton(false);
      setSelectedText('');
      setTempRange(null);
      setPendingHighlight(null);
    }
  }, [selectedText, tempRange, elementId, addHighlight]);

  // Apply highlights to the DOM dynamically without breaking structure
  useEffect(() => {
    if (!contentRef.current) return;

    const elementHighlights = highlights.get(elementId) || [];
    const element = contentRef.current;

    // Clear previous highlights but preserve the text content
    const existingHighlights = element.querySelectorAll('.highlight-mark');
    existingHighlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        // Replace the highlight with its text content
        const textNode = document.createTextNode(highlight.textContent || '');
        parent.replaceChild(textNode, highlight);
      }
    });
    
    // Normalize to merge adjacent text nodes
    element.normalize();

    // Apply current highlights if any exist
    if (elementHighlights.length > 0) {
      // Get all text content with positions, accounting for complex DOM structure
      const getTextNodesWithOffsets = (element: Element) => {
        const textNodes: Array<{ node: Text; startOffset: number; endOffset: number }> = [];
        let currentOffset = 0;
        
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              // Accept all text nodes, even those inside input elements, etc.
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        let node;
        while (node = walker.nextNode()) {
          const textNode = node as Text;
          const length = textNode.textContent?.length || 0;
          if (length > 0) { // Only include non-empty text nodes
            textNodes.push({
              node: textNode,
              startOffset: currentOffset,
              endOffset: currentOffset + length
            });
            currentOffset += length;
          }
        }
        
        return textNodes;
      };

      const textNodes = getTextNodesWithOffsets(element);
      
      // Sort highlights by start position (descending to process from end to start)
      const sortedHighlights = [...elementHighlights].sort((a, b) => b.startOffset - a.startOffset);
      
      sortedHighlights.forEach(highlight => {
        // Find which text node(s) contain this highlight
        const overlappingNodes = textNodes.filter(({ startOffset: nodeStart, endOffset: nodeEnd }) => 
          highlight.startOffset < nodeEnd && highlight.endOffset > nodeStart
        );

        // Process each overlapping text node
        overlappingNodes.forEach(({ node, startOffset: nodeStart, endOffset: nodeEnd }) => {
          const relativeStart = Math.max(0, highlight.startOffset - nodeStart);
          const relativeEnd = Math.min(node.textContent?.length || 0, highlight.endOffset - nodeStart);
          
          if (relativeStart < relativeEnd && node.parentNode && node.textContent) {
            try {
              // Only create highlight if this portion hasn't been highlighted yet
              const nodeText = node.textContent;
              const highlightText = nodeText.slice(relativeStart, relativeEnd);
              
              // Create the highlight range within this text node
              const range = document.createRange();
              range.setStart(node, relativeStart);
              range.setEnd(node, relativeEnd);
              
              // Create the highlight mark
              const mark = document.createElement('mark');
              mark.className = 'highlight-mark';
              mark.setAttribute('data-highlight-id', highlight.id);
              mark.setAttribute('data-element-id', elementId);
              mark.style.backgroundColor = 'yellow';
              mark.style.padding = '1px 2px';
              mark.style.cursor = 'pointer';
              mark.title = 'Click to remove highlight';
              
              // Add hover effects
              mark.addEventListener('mouseenter', () => {
                mark.style.backgroundColor = 'orange';
              });
              mark.addEventListener('mouseleave', () => {
                mark.style.backgroundColor = 'yellow';
              });
              
              // Surround the range content with the mark
              range.surroundContents(mark);
              
            } catch (error) {
              console.warn('Could not apply highlight:', error);
            }
          }
        });
      });
    }
  }, [highlights, elementId]);

  // Apply pending highlight styling
  useEffect(() => {
    if (!contentRef.current || !pendingHighlight) return;

    const element = contentRef.current;
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'pending-highlight';
      span.style.backgroundColor = '#3b82f6';
      span.style.color = 'white';
      span.style.padding = '1px 2px';
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // If we can't surround contents (e.g., range spans multiple elements),
        // fall back to just showing the highlight button
        console.warn('Could not apply pending highlight styling');
      }
    }

    return () => {
      // Clean up pending highlights
      const pendingHighlights = element.querySelectorAll('.pending-highlight');
      pendingHighlights.forEach(highlight => {
        const parent = highlight.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
          parent.normalize();
        }
      });
    };
  }, [pendingHighlight]);

  const hasHighlights = useMemo(() => 
    (highlights.get(elementId)?.length || 0) > 0, 
    [highlights, elementId]
  );

  // Add click handler for removing highlights
  useEffect(() => {
    const handleHighlightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('highlight-mark')) {
        const highlightId = target.dataset.highlightId;
        const targetElementId = target.dataset.elementId;
        if (highlightId && targetElementId === elementId) {
          removeHighlight(elementId, highlightId);
        }
      }
    };
    
    document.addEventListener('click', handleHighlightClick);
    return () => document.removeEventListener('click', handleHighlightClick);
  }, [elementId, removeHighlight]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.highlight-button') && 
          !target.classList.contains('highlight-mark')) {
        setTimeout(() => {
          const selection = window.getSelection();
          if (!selection || selection.toString().trim() === '') {
            setShowHighlightButton(false);
            setSelectedText('');
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
    <>
      {/* Floating Highlight Button */}
      {showHighlightButton && (
        <div
          className="highlight-button fixed z-50 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md shadow-lg cursor-pointer transition-colors"
          style={{
            left: selectionPosition.x - 50,
            top: selectionPosition.y - 40,
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
        className={`select-text ${className}`}
        data-highlightable
        data-element-id={elementId}
      >
        {children}
      </div>
    </>
  );
}
