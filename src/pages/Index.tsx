import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardTabs } from "@/components/BoardTabs";
import { NoteCard } from "@/components/NoteCard";
import { BoardManagement } from "@/components/BoardManagement";
import { ReorderDialog } from "@/components/ReorderDialog";
import { TranslateDialog } from "@/components/TranslateDialog";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface Note {
  id: string;
  content: string;
  board: string;
}
const Index = () => {
  const [boards, setBoards] = useState<string[]>(() => {
    const saved = localStorage.getItem("boards");
    return saved ? JSON.parse(saved) : ["الرئيسية"];
  });
  const [deletedBoards, setDeletedBoards] = useState<{board: string, notes: Note[]}[]>(() => {
    const saved = localStorage.getItem("deletedBoards");
    return saved ? JSON.parse(saved) : [];
  });
  const [deletedNotes, setDeletedNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("deletedNotes");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeBoard, setActiveBoard] = useState<string>(boards[0]);
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [addBoardOpen, setAddBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [moveNoteOpen, setMoveNoteOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [boardToDelete, setBoardToDelete] = useState("");
  const [targetBoard, setTargetBoard] = useState("");
  const [boardToRestore, setBoardToRestore] = useState("");
  const [noteToMove, setNoteToMove] = useState<Note | null>(null);
  const [noteToTranslate, setNoteToTranslate] = useState<Note | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    localStorage.setItem("boards", JSON.stringify(boards));
  }, [boards]);
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem("deletedBoards", JSON.stringify(deletedBoards));
  }, [deletedBoards]);
  useEffect(() => {
    localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  }, [deletedNotes]);
  const saveNote = () => {
    if (!noteContent.trim()) {
      toast({
        title: "تنبيه",
        description: "الرجاء كتابة نص للحفظ",
        variant: "destructive"
      });
      return;
    }
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? {
        ...n,
        content: noteContent
      } : n));
      setEditingNote(null);
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملاحظة بنجاح"
      });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        content: noteContent,
        board: activeBoard
      };
      setNotes([newNote, ...notes]);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الملاحظة بنجاح"
      });
    }
    setNoteContent("");
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
  const editNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    toast({
      title: "وضع التحرير",
      description: "يمكنك الآن تعديل الملاحظة"
    });
  };
  const moveNote = (note: Note) => {
    setNoteToMove(note);
    setMoveNoteOpen(true);
  };
  const confirmMoveNote = () => {
    if (noteToMove && targetBoard) {
      setNotes(notes.map(n => n.id === noteToMove.id ? {
        ...n,
        board: targetBoard
      } : n));
      setMoveNoteOpen(false);
      setNoteToMove(null);
      setTargetBoard("");
      toast({
        title: "تم النقل",
        description: `تم نقل الملاحظة إلى ${targetBoard}`
      });
    }
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
  const filteredNotes = notes.filter(n => n.board === activeBoard);
  return <div className="min-h-screen bg-background" dir="rtl">
      <BoardTabs boards={boards} activeBoard={activeBoard} onBoardChange={setActiveBoard} onMenuOpen={() => setMenuOpen(true)} />

      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <div className="space-y-3 rounded-md">
          <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="اكتب ملاحظتك هنا..." rows={3} className="text-base resize-none" />
          
          <div className="flex gap-2">
            <Button onClick={saveNote} size="sm" className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {editingNote ? "تحديث" : "حفظ"}
            </Button>
            {editingNote && <Button onClick={() => {
            setEditingNote(null);
            setNoteContent("");
          }} variant="outline" size="sm">
                إلغاء
              </Button>}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotes.length === 0 ? <div className="text-center py-12 text-muted-foreground">
              لا توجد ملاحظات في هذه اللوحة
            </div> : filteredNotes.map(note => <NoteCard key={note.id} note={note} isSelected={selectedNoteId === note.id} onSelect={() => setSelectedNoteId(note.id === selectedNoteId ? null : note.id)} onCopy={() => copyNote(note)} onEdit={() => editNote(note)} onDelete={() => deleteNote(note.id)} onMove={() => moveNote(note)} onTranslate={() => translateNote(note)} />)}
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

      <Dialog open={moveNoteOpen} onOpenChange={setMoveNoteOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>نقل الملاحظة</DialogTitle>
          </DialogHeader>
          <Select value={targetBoard} onValueChange={setTargetBoard}>
            <SelectTrigger>
              <SelectValue placeholder="اختر اللوحة" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {boards.filter(b => b !== activeBoard).map(board => <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={confirmMoveNote}>نقل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TranslateDialog open={translateOpen} onOpenChange={setTranslateOpen} originalText={noteToTranslate?.content || ""} />

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
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => restoreNote(note.id)}>
                      استعادة
                    </Button>
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
                <DialogFooter>
                  <Button onClick={restoreBoard} size="sm">استعادة اللوحة</Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;