'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState
} from 'react';

export interface HighlightRange {
  id: string;
  text: string;
  elementId: string;
  startOffset: number;
  endOffset: number;
}

interface HighlightContextType {
  highlights: Map<string, HighlightRange[]>;
  setHighlights: React.Dispatch<
    React.SetStateAction<Map<string, HighlightRange[]>>
  >;
  addHighlight: (elementId: string, highlight: HighlightRange) => void;
  removeHighlight: (elementId: string, highlightId: string) => void;
  clearAllHighlights: () => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(
  undefined
);

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};

interface HighlightProviderProps {
  children: ReactNode;
}

export const HighlightProvider = ({ children }: HighlightProviderProps) => {
  const [highlights, setHighlights] = useState<Map<string, HighlightRange[]>>(
    new Map()
  );

  const addHighlight = useCallback(
    (elementId: string, highlight: HighlightRange) => {
      setHighlights((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(elementId) || [];
        newMap.set(elementId, [...existing, highlight]);
        return newMap;
      });
    },
    []
  );

  const removeHighlight = useCallback(
    (elementId: string, highlightId: string) => {
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
    },
    []
  );

  const clearAllHighlights = useCallback(() => {
    setHighlights(new Map());
  }, []);

  return (
    <HighlightContext.Provider
      value={{
        highlights,
        setHighlights,
        addHighlight,
        removeHighlight,
        clearAllHighlights
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
};
