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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  
  const [activeBoard, setActiveBoard] = useState<string>(boards[0]);
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [addBoardOpen, setAddBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [moveNoteOpen, setMoveNoteOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [boardToDelete, setBoardToDelete] = useState("");
  const [targetBoard, setTargetBoard] = useState("");
  const [noteToMove, setNoteToMove] = useState<Note | null>(null);
  const [noteToTranslate, setNoteToTranslate] = useState<Note | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("boards", JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const saveNote = () => {
    if (!noteContent.trim()) {
      toast({
        title: "تنبيه",
        description: "الرجاء كتابة نص للحفظ",
        variant: "destructive",
      });
      return;
    }

    if (editingNote) {
      setNotes(notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, content: noteContent }
          : n
      ));
      setEditingNote(null);
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملاحظة بنجاح",
      });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        content: noteContent,
        board: activeBoard,
      };
      setNotes([newNote, ...notes]);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الملاحظة بنجاح",
      });
    }
    setNoteContent("");
  };

  const copyNote = (note: Note) => {
    navigator.clipboard.writeText(note.content);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص بنجاح",
    });
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف الملاحظة",
    });
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    toast({
      title: "وضع التحرير",
      description: "يمكنك الآن تعديل الملاحظة",
    });
  };

  const moveNote = (note: Note) => {
    setNoteToMove(note);
    setMoveNoteOpen(true);
  };

  const confirmMoveNote = () => {
    if (noteToMove && targetBoard) {
      setNotes(notes.map(n => 
        n.id === noteToMove.id 
          ? { ...n, board: targetBoard }
          : n
      ));
      setMoveNoteOpen(false);
      setNoteToMove(null);
      setTargetBoard("");
      toast({
        title: "تم النقل",
        description: `تم نقل الملاحظة إلى ${targetBoard}`,
      });
    }
  };

  const translateNote = (note: Note) => {
    setNoteToTranslate(note);
    setTranslateOpen(true);
  };

  const addBoard = () => {
    if (!newBoardName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم اللوحة",
        variant: "destructive",
      });
      return;
    }
    if (boards.includes(newBoardName)) {
      toast({
        title: "خطأ",
        description: "اسم اللوحة موجود بالفعل",
        variant: "destructive",
      });
      return;
    }
    setBoards([...boards, newBoardName]);
    setNewBoardName("");
    setAddBoardOpen(false);
    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة لوحة ${newBoardName}`,
    });
  };

  const editBoard = () => {
    if (!newBoardName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم اللوحة الجديد",
        variant: "destructive",
      });
      return;
    }
    setBoards(boards.map(b => b === activeBoard ? newBoardName : b));
    setNotes(notes.map(n => 
      n.board === activeBoard 
        ? { ...n, board: newBoardName }
        : n
    ));
    setActiveBoard(newBoardName);
    setNewBoardName("");
    setEditBoardOpen(false);
    toast({
      title: "تم التعديل",
      description: "تم تعديل اسم اللوحة",
    });
  };

  const deleteBoard = () => {
    if (boardToDelete !== activeBoard) {
      toast({
        title: "خطأ",
        description: "الاسم غير مطابق",
        variant: "destructive",
      });
      return;
    }
    if (boards.length === 1) {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف اللوحة الوحيدة",
        variant: "destructive",
      });
      return;
    }
    setBoards(boards.filter(b => b !== activeBoard));
    setNotes(notes.filter(n => n.board !== activeBoard));
    setActiveBoard(boards[0] === activeBoard ? boards[1] : boards[0]);
    setBoardToDelete("");
    setDeleteBoardOpen(false);
    toast({
      title: "تم الحذف",
      description: "تم حذف اللوحة وجميع ملاحظاتها",
    });
  };

  const filteredNotes = notes.filter(n => n.board === activeBoard);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <BoardTabs
        boards={boards}
        activeBoard={activeBoard}
        onBoardChange={setActiveBoard}
      />

      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="اكتب ملاحظتك هنا..."
            className="min-h-[120px] text-lg resize-none"
          />
          
          <div className="flex gap-2">
            <Button onClick={saveNote} className="gap-2">
              <Save className="h-4 w-4" />
              {editingNote ? "تحديث" : "حفظ النص"}
            </Button>
            {editingNote && (
              <Button
                onClick={() => {
                  setEditingNote(null);
                  setNoteContent("");
                }}
                variant="outline"
              >
                إلغاء التحرير
              </Button>
            )}
          </div>
        </div>

        <BoardManagement
          onAddBoard={() => setAddBoardOpen(true)}
          onEditBoard={() => setEditBoardOpen(true)}
          onDeleteBoard={() => setDeleteBoardOpen(true)}
          onReorderBoards={() => setReorderOpen(true)}
        />

        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد ملاحظات في هذه اللوحة
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={() => setSelectedNoteId(note.id === selectedNoteId ? null : note.id)}
                onCopy={() => copyNote(note)}
                onEdit={() => editNote(note)}
                onDelete={() => deleteNote(note.id)}
                onMove={() => moveNote(note)}
                onTranslate={() => translateNote(note)}
              />
            ))
          )}
        </div>
      </div>

      <ReorderDialog
        open={reorderOpen}
        onOpenChange={setReorderOpen}
        boards={boards}
        onReorder={setBoards}
      />

      <Dialog open={addBoardOpen} onOpenChange={setAddBoardOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>إضافة لوحة جديدة</DialogTitle>
          </DialogHeader>
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="اسم اللوحة"
            onKeyDown={(e) => e.key === 'Enter' && addBoard()}
          />
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
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="الاسم الجديد"
            onKeyDown={(e) => e.key === 'Enter' && editBoard()}
          />
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
          <Input
            value={boardToDelete}
            onChange={(e) => setBoardToDelete(e.target.value)}
            placeholder={activeBoard}
            onKeyDown={(e) => e.key === 'Enter' && deleteBoard()}
          />
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
              {boards.filter(b => b !== activeBoard).map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={confirmMoveNote}>نقل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TranslateDialog
        open={translateOpen}
        onOpenChange={setTranslateOpen}
        originalText={noteToTranslate?.content || ""}
      />
    </div>
  );
};

export default Index;
