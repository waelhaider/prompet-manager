import { useState, useEffect, useCallback } from 'react';
import {
  initializeDB,
  setBoards as saveBoards,
  setNotes as saveNotes,
  setDeletedBoards as saveDeletedBoards,
  setDeletedNotes as saveDeletedNotes,
  setFontSize as saveFontSize,
  Note,
  DeletedBoard,
} from '@/lib/indexedDB';

export interface UseIndexedDBResult {
  boards: string[];
  setBoards: (boards: string[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  deletedBoards: DeletedBoard[];
  setDeletedBoards: (boards: DeletedBoard[]) => void;
  deletedNotes: Note[];
  setDeletedNotes: (notes: Note[]) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isLoading: boolean;
}

export const useIndexedDB = (): UseIndexedDBResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [boards, setBoardsState] = useState<string[]>(['الرئيسية']);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [deletedBoards, setDeletedBoardsState] = useState<DeletedBoard[]>([]);
  const [deletedNotes, setDeletedNotesState] = useState<Note[]>([]);
  const [fontSize, setFontSizeState] = useState<number>(14);

  // Initialize data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await initializeDB();
        setBoardsState(data.boards);
        setNotesState(data.notes);
        setDeletedBoardsState(data.deletedBoards);
        setDeletedNotesState(data.deletedNotes);
        setFontSizeState(data.fontSize);
      } catch (error) {
        console.error('Failed to load data from IndexedDB:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Wrapped setters that also persist to IndexedDB
  const setBoards = useCallback((newBoards: string[]) => {
    setBoardsState(newBoards);
    saveBoards(newBoards).catch(console.error);
  }, []);

  const setNotes = useCallback((newNotes: Note[]) => {
    setNotesState(newNotes);
    saveNotes(newNotes).catch(console.error);
  }, []);

  const setDeletedBoards = useCallback((newDeletedBoards: DeletedBoard[]) => {
    setDeletedBoardsState(newDeletedBoards);
    saveDeletedBoards(newDeletedBoards).catch(console.error);
  }, []);

  const setDeletedNotes = useCallback((newDeletedNotes: Note[]) => {
    setDeletedNotesState(newDeletedNotes);
    saveDeletedNotes(newDeletedNotes).catch(console.error);
  }, []);

  const setFontSize = useCallback((newFontSize: number) => {
    setFontSizeState(newFontSize);
    saveFontSize(newFontSize).catch(console.error);
  }, []);

  return {
    boards,
    setBoards,
    notes,
    setNotes,
    deletedBoards,
    setDeletedBoards,
    deletedNotes,
    setDeletedNotes,
    fontSize,
    setFontSize,
    isLoading,
  };
};
