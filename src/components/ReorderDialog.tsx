import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boards: string[];
  onReorder: (boards: string[]) => void;
}

export const ReorderDialog = ({ open, onOpenChange, boards, onReorder }: ReorderDialogProps) => {
  const [tempBoards, setTempBoards] = useState(boards);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBoards = [...tempBoards];
    [newBoards[index], newBoards[index - 1]] = [newBoards[index - 1], newBoards[index]];
    setTempBoards(newBoards);
  };

  const moveDown = (index: number) => {
    if (index === tempBoards.length - 1) return;
    const newBoards = [...tempBoards];
    [newBoards[index], newBoards[index + 1]] = [newBoards[index + 1], newBoards[index]];
    setTempBoards(newBoards);
  };

  const handleSave = () => {
    onReorder(tempBoards);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempBoards(boards);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover top-[10%] translate-y-0">
        <DialogHeader>
          <DialogTitle>ترتيب اللوحات</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {tempBoards.map((board, index) => (
            <div
              key={board}
              className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
            >
              <span className="font-medium">{board}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveDown(index)}
                  disabled={index === tempBoards.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
