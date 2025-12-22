import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardTabs } from "@/components/BoardTabs";
import { NoteCard } from "@/components/NoteCard";
import { BoardManagement } from "@/components/BoardManagement";
import { ReorderDialog } from "@/components/ReorderDialog";
import { TranslateDialog } from "@/components/TranslateDialog";
import { useToast } from "@/hooks/use-toast";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import { Save, Trash2, ImagePlus, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Note } from "@/lib/indexedDB";
const Index = () => {
  const {
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
  } = useIndexedDB();

  const [activeBoard, setActiveBoard] = useState<string>(boards[0] || "الرئيسية");
  const [noteContent, setNoteContent] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [addBoardOpen, setAddBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [boardToDelete, setBoardToDelete] = useState("");
  const [targetBoard, setTargetBoard] = useState("");
  const [boardToRestore, setBoardToRestore] = useState("");
  const [noteToTranslate, setNoteToTranslate] = useState<Note | null>(null);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);
  const [confirmDeleteBoardName, setConfirmDeleteBoardName] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();

  // Update activeBoard when boards are loaded or changed
  useEffect(() => {
    if (!isLoading && boards.length > 0 && !boards.includes(activeBoard)) {
      setActiveBoard(boards[0]);
    }
  }, [boards, activeBoard, isLoading]);

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 1, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 1, 10));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize to 25% of original dimensions
          const canvas = document.createElement('canvas');
          canvas.width = img.width * 0.25;
          canvas.height = img.height * 0.25;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setPendingImages(prev => [...prev, resizedBase64]);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveNote = () => {
    if (!noteContent.trim() && pendingImages.length === 0) {
      toast({
        title: "تنبيه",
        description: "الرجاء كتابة نص أو إضافة صورة للحفظ",
        variant: "destructive"
      });
      return;
    }
    if (editingNote) {
      const editedNoteId = editingNote.id;
      setNotes(notes.map(n => n.id === editingNote.id ? {
        ...n,
        content: noteContent,
        images: pendingImages.length > 0 ? pendingImages : n.images
      } : n));
      setEditingNote(null);
      setHighlightedNoteId(editedNoteId);
      
      // Scroll to the edited note after a brief delay
      setTimeout(() => {
        const noteElement = document.getElementById(`note-${editedNoteId}`);
        if (noteElement) {
          noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      setTimeout(() => {
        setHighlightedNoteId(null);
      }, 5000);
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملاحظة بنجاح"
      });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        content: noteContent,
        board: activeBoard,
        images: pendingImages.length > 0 ? pendingImages : undefined
      };
      setNotes([newNote, ...notes]);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الملاحظة بنجاح"
      });
    }
    setNoteContent("");
    setPendingImages([]);
  };
  const copyNote = (note: Note) => {
    navigator.clipboard.writeText(note.content);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص بنجاح"
    });
  };
  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (noteToDelete) {
      const newDeletedNotes = [...deletedNotes, noteToDelete];
      setDeletedNotes(newDeletedNotes);
      localStorage.setItem("deletedNotes", JSON.stringify(newDeletedNotes));
    }
    setNotes(notes.filter(n => n.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم نقل الملاحظة إلى المحذوفات"
    });
  };

  const restoreNote = (noteId: string) => {
    const noteToRestore = deletedNotes.find(n => n.id === noteId);
    if (noteToRestore) {
      // Check if the original board still exists
      const targetBoardName = boards.includes(noteToRestore.board) ? noteToRestore.board : boards[0];
      const restoredNote = { ...noteToRestore, board: targetBoardName };
      setNotes([restoredNote, ...notes]);
      setDeletedNotes(deletedNotes.filter(n => n.id !== noteId));
      toast({
        title: "تمت الاستعادة",
        description: `تم استعادة الملاحظة إلى ${targetBoardName}`
      });
    }
  };

  const permanentlyDeleteNote = (noteId: string) => {
    setDeletedNotes(deletedNotes.filter(n => n.id !== noteId));
    setConfirmDeleteNoteId(null);
    toast({
      title: "تم الحذف نهائياً",
      description: "تم حذف الملاحظة نهائياً"
    });
  };

  const permanentlyDeleteBoard = (boardName: string) => {
    setDeletedBoards(deletedBoards.filter(d => d.board !== boardName));
    setBoardToRestore("");
    setConfirmDeleteBoardName(null);
    toast({
      title: "تم الحذف نهائياً",
      description: "تم حذف اللوحة وملاحظاتها نهائياً"
    });
  };
  const editNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setPendingImages(note.images || []);
    setHighlightedNoteId(note.id);
    toast({
      title: "وضع التحرير",
      description: "يمكنك الآن تعديل الملاحظة"
    });
  };
  const moveNoteToBoard = (note: Note, targetBoardName: string) => {
    setNotes(notes.map(n => n.id === note.id ? {
      ...n,
      board: targetBoardName
    } : n));
    toast({
      title: "تم النقل",
      description: `تم نقل الملاحظة إلى ${targetBoardName}`
    });
  };
  const translateNote = (note: Note) => {
    setNoteToTranslate(note);
    setTranslateOpen(true);
  };

  const exportData = async () => {
    const data = {
      boards,
      notes,
      deletedBoards,
      deletedNotes,
      exportDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Try modern File System Access API first (shows save dialog)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `notes-backup-${new Date().toISOString().split('T')[0]}.json`,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({
          title: "تم التصدير",
          description: "تم تصدير البيانات بنجاح"
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled
      }
    }
    
    // Fallback for browsers that don't support showSaveFilePicker
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "تم التصدير",
      description: "تم تصدير البيانات بنجاح"
    });
  };

  const exportBoard = async () => {
    const boardNotes = notes.filter(n => n.board === activeBoard);
    const data = {
      boardName: activeBoard,
      notes: boardNotes,
      exportDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `${activeBoard}-${new Date().toISOString().split('T')[0]}.json`,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({
          title: "تم التصدير",
          description: `تم تصدير لوحة "${activeBoard}" بنجاح`
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBoard}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "تم التصدير",
      description: `تم تصدير لوحة "${activeBoard}" بنجاح`
    });
  };

  const importBoard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.boardName && data.notes) {
          // Check if board already exists
          let newBoardName = data.boardName;
          if (boards.includes(newBoardName)) {
            let counter = 1;
            while (boards.includes(`${data.boardName} (${counter})`)) {
              counter++;
            }
            newBoardName = `${data.boardName} (${counter})`;
          }
          
          // Add new board
          setBoards([...boards, newBoardName]);
          
          // Add notes with new board name
          const importedNotes = data.notes.map((note: any) => ({
            ...note,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            board: newBoardName
          }));
          setNotes([...notes, ...importedNotes]);
          
          setActiveBoard(newBoardName);
          toast({
            title: "تم الاستيراد",
            description: `تم استيراد لوحة "${newBoardName}" مع ${importedNotes.length} ملاحظات`
          });
        } else {
          throw new Error("Invalid board file format");
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل استيراد اللوحة. تأكد من صحة الملف.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.boards && data.notes) {
          setBoards(data.boards);
          setNotes(data.notes);
          if (data.deletedBoards) {
            setDeletedBoards(data.deletedBoards);
          }
          if (data.deletedNotes) {
            setDeletedNotes(data.deletedNotes);
          }
          setActiveBoard(data.boards[0]);
          toast({
            title: "تم الاستيراد",
            description: "تم استيراد البيانات بنجاح"
          });
        } else {
          throw new Error("Invalid file format");
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل استيراد البيانات. تأكد من صحة الملف.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  const addBoard = () => {
    if (!newBoardName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم اللوحة",
        variant: "destructive"
      });
      return;
    }
    if (boards.includes(newBoardName)) {
      toast({
        title: "خطأ",
        description: "اسم اللوحة موجود بالفعل",
        variant: "destructive"
      });
      return;
    }
    setBoards([...boards, newBoardName]);
    setNewBoardName("");
    setAddBoardOpen(false);
    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة لوحة ${newBoardName}`
    });
  };
  const editBoard = () => {
    if (!newBoardName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم اللوحة الجديد",
        variant: "destructive"
      });
      return;
    }
    setBoards(boards.map(b => b === activeBoard ? newBoardName : b));
    setNotes(notes.map(n => n.board === activeBoard ? {
      ...n,
      board: newBoardName
    } : n));
    setActiveBoard(newBoardName);
    setNewBoardName("");
    setEditBoardOpen(false);
    toast({
      title: "تم التعديل",
      description: "تم تعديل اسم اللوحة"
    });
  };
  const deleteBoard = () => {
    if (boardToDelete !== activeBoard) {
      toast({
        title: "خطأ",
        description: "الاسم غير مطابق",
        variant: "destructive"
      });
      return;
    }
    if (boards.length === 1) {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف اللوحة الوحيدة",
        variant: "destructive"
      });
      return;
    }
    const boardNotes = notes.filter(n => n.board === activeBoard);
    const newDeletedBoards = [...deletedBoards, { board: activeBoard, notes: boardNotes }];
    setDeletedBoards(newDeletedBoards);
    // Save immediately to localStorage to ensure persistence
    localStorage.setItem("deletedBoards", JSON.stringify(newDeletedBoards));
    
    setBoards(boards.filter(b => b !== activeBoard));
    setNotes(notes.filter(n => n.board !== activeBoard));
    setActiveBoard(boards[0] === activeBoard ? boards[1] : boards[0]);
    setBoardToDelete("");
    setDeleteBoardOpen(false);
    toast({
      title: "تم الحذف",
      description: "تم نقل اللوحة إلى المحذوفات"
    });
  };

  const restoreBoard = () => {
    if (!boardToRestore) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار لوحة للاستعادة",
        variant: "destructive"
      });
      return;
    }
    const deletedItem = deletedBoards.find(d => d.board === boardToRestore);
    if (!deletedItem) return;
    
    if (!targetBoard) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار اللوحة الهدف",
        variant: "destructive"
      });
      return;
    }

    const restoredNotes = deletedItem.notes.map(n => ({ ...n, board: targetBoard }));
    setNotes([...notes, ...restoredNotes]);
    setDeletedBoards(deletedBoards.filter(d => d.board !== boardToRestore));
    setBoardToRestore("");
    setTargetBoard("");
    setRestoreOpen(false);
    toast({
      title: "تمت الاستعادة",
      description: `تم استعادة ملاحظات ${deletedItem.board} إلى ${targetBoard}`
    });
  };
  // Detect text direction based on majority of characters
  const getTextDirection = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/g;
    const latinPattern = /[a-zA-Z]/g;
    const arabicCount = (text.match(arabicPattern) || []).length;
    const latinCount = (text.match(latinPattern) || []).length;
    return arabicCount >= latinCount ? 'rtl' : 'ltr';
  };
  const filteredNotes = notes.filter(n => n.board === activeBoard);
  
  // Show loading state while data is being loaded from IndexedDB
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }


  return <div className="min-h-screen bg-background" dir="rtl">
      <BoardTabs boards={boards} activeBoard={activeBoard} onBoardChange={setActiveBoard} onMenuOpen={() => setMenuOpen(true)} />

      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <div className="space-y-3 rounded-md">
          <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="اكتب ملاحظتك هنا..." rows={editingNote ? Math.max(3, Math.min(15, noteContent.split('\n').length + 1)) : 3} className="resize-none" style={{ fontSize: `${fontSize}px` }} dir={getTextDirection(noteContent)} />
          
          {/* Pending Images Preview */}
          {pendingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
              {pendingImages.map((img, index) => (
                <div key={index} className="relative">
                  <img 
                    src={img} 
                    alt={`صورة ${index + 1}`} 
                    className="h-16 w-auto rounded border cursor-pointer"
                    onClick={() => setViewingImage(img)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                    onClick={() => removePendingImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={saveNote} size="sm" className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {editingNote ? "تحديث" : "حفظ"}
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button onClick={() => imageInputRef.current?.click()} variant="outline" size="sm" className="gap-1.5">
              <ImagePlus className="h-3.5 w-3.5" />
              تحميل صورة
            </Button>
            {editingNote && <Button onClick={() => {
            setEditingNote(null);
            setNoteContent("");
            setPendingImages([]);
          }} variant="outline" size="sm">
                إلغاء
              </Button>}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotes.length === 0 ? <div className="text-center py-12 text-muted-foreground">
              لا توجد ملاحظات في هذه اللوحة
            </div> : filteredNotes.map(note => <div key={note.id} id={`note-${note.id}`}><NoteCard note={note} boards={boards} isSelected={selectedNoteId === note.id || highlightedNoteId === note.id} onSelect={() => setSelectedNoteId(note.id === selectedNoteId ? null : note.id)} onCopy={() => copyNote(note)} onEdit={() => editNote(note)} onDelete={() => deleteNote(note.id)} onMoveTo={(targetBoard) => moveNoteToBoard(note, targetBoard)} onTranslate={() => translateNote(note)} fontSize={fontSize} onImageClick={setViewingImage} /></div>)}
        </div>
      </div>

      <ReorderDialog open={reorderOpen} onOpenChange={setReorderOpen} boards={boards} onReorder={setBoards} />

      <Dialog open={addBoardOpen} onOpenChange={setAddBoardOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>إضافة لوحة جديدة</DialogTitle>
          </DialogHeader>
          <Input value={newBoardName} onChange={e => setNewBoardName(e.target.value)} placeholder="اسم اللوحة" onKeyDown={e => e.key === 'Enter' && addBoard()} />
          <DialogFooter>
            <Button onClick={addBoard}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editBoardOpen} onOpenChange={setEditBoardOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>تعديل اسم اللوحة: {activeBoard}</DialogTitle>
          </DialogHeader>
          <Input value={newBoardName} onChange={e => setNewBoardName(e.target.value)} placeholder="الاسم الجديد" onKeyDown={e => e.key === 'Enter' && editBoard()} />
          <DialogFooter>
            <Button onClick={editBoard}>تعديل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteBoardOpen} onOpenChange={setDeleteBoardOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>حذف اللوحة: {activeBoard}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            اكتب اسم اللوحة بالضبط للتأكيد:
          </p>
          <Input value={boardToDelete} onChange={e => setBoardToDelete(e.target.value)} placeholder={activeBoard} onKeyDown={e => e.key === 'Enter' && deleteBoard()} />
          <DialogFooter>
            <Button onClick={deleteBoard} variant="destructive">
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TranslateDialog 
        open={translateOpen} 
        onOpenChange={setTranslateOpen} 
        originalText={noteToTranslate?.content || ""} 
        onSaveTranslation={(newText) => {
          if (noteToTranslate) {
            setNotes(notes.map(n => n.id === noteToTranslate.id ? { ...n, content: newText } : n));
          }
        }}
        fontSize={fontSize}
      />

      <BoardManagement 
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onAddBoard={() => setAddBoardOpen(true)} 
        onEditBoard={() => setEditBoardOpen(true)} 
        onDeleteBoard={() => setDeleteBoardOpen(true)} 
        onReorderBoards={() => setReorderOpen(true)}
        onRestoreBoards={() => setRestoreOpen(true)}
        onExport={exportData}
        onImport={importData}
        onExportBoard={exportBoard}
        onImportBoard={importBoard}
        fontSize={fontSize}
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
      />

      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="bg-popover max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>المحذوفات</DialogTitle>
          </DialogHeader>
          
          {/* Deleted Notes Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">الملاحظات المحذوفة ({deletedNotes.length})</h3>
            {deletedNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                لا توجد ملاحظات محذوفة
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {deletedNotes.map(note => (
                  <div key={note.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                    <span className="truncate flex-1 ml-2">{note.content.substring(0, 50)}...</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => restoreNote(note.id)}>
                        استعادة
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" onClick={() => setConfirmDeleteNoteId(note.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border my-2" />

          {/* Deleted Boards Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">اللوحات المحذوفة ({deletedBoards.length})</h3>
            {deletedBoards.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                لا توجد لوحات محذوفة
              </p>
            ) : (
              <>
                <Select value={boardToRestore} onValueChange={setBoardToRestore}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="اختر اللوحة المحذوفة" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {deletedBoards.map(d => (
                      <SelectItem key={d.board} value={d.board}>
                        {d.board} ({d.notes.length} ملاحظات)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={targetBoard} onValueChange={setTargetBoard}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="استعادة إلى اللوحة" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {boards.map(board => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter className="flex gap-2 sm:gap-0">
                  <Button onClick={() => setConfirmDeleteBoardName(boardToRestore)} size="sm" variant="destructive" disabled={!boardToRestore}>
                    <Trash2 className="h-3 w-3 ml-1" />
                    حذف نهائي
                  </Button>
                  <Button onClick={restoreBoard} size="sm">استعادة اللوحة</Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Note Dialog */}
      <AlertDialog open={!!confirmDeleteNoteId} onOpenChange={(open) => !open && setConfirmDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف النهائي</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الملاحظة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteNoteId && permanentlyDeleteNote(confirmDeleteNoteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Board Dialog */}
      <AlertDialog open={!!confirmDeleteBoardName} onOpenChange={(open) => !open && setConfirmDeleteBoardName(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف النهائي</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف اللوحة "{confirmDeleteBoardName}" وجميع ملاحظاتها نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteBoardName && permanentlyDeleteBoard(confirmDeleteBoardName)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2">
          {viewingImage && (
            <img 
              src={viewingImage} 
              alt="صورة مكبرة" 
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;