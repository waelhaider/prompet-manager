import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Edit, Trash2, ArrowUpDown, Download, Upload, RotateCcw, FileDown, FileUp } from "lucide-react";
import { useRef } from "react";

interface BoardManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBoard: () => void;
  onEditBoard: () => void;
  onDeleteBoard: () => void;
  onReorderBoards: () => void;
  onRestoreBoards: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportBoard: () => void;
  onImportBoard: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BoardManagement = ({
  open,
  onOpenChange,
  onAddBoard,
  onEditBoard,
  onDeleteBoard,
  onReorderBoards,
  onRestoreBoards,
  onExport,
  onImport,
  onExportBoard,
  onImportBoard,
}: BoardManagementProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const boardFileInputRef = useRef<HTMLInputElement>(null);

  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-64 bg-popover">
        <SheetHeader>
          <SheetTitle className="text-right">إدارة اللوحات</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={() => handleAction(onAddBoard)} variant="ghost" size="sm" className="justify-start gap-2">
            <Plus className="h-4 w-4" />
            إضافة لوحة
          </Button>
          <Button onClick={() => handleAction(onEditBoard)} variant="ghost" size="sm" className="justify-start gap-2">
            <Edit className="h-4 w-4" />
            تعديل اسم لوحة
          </Button>
          <Button onClick={() => handleAction(onReorderBoards)} variant="ghost" size="sm" className="justify-start gap-2">
            <ArrowUpDown className="h-4 w-4" />
            ترتيب اللوحات
          </Button>
          <Button onClick={() => handleAction(onDeleteBoard)} variant="ghost" size="sm" className="justify-start gap-2">
            <Trash2 className="h-4 w-4" />
            حذف لوحة
          </Button>
          <Button onClick={() => handleAction(onRestoreBoards)} variant="ghost" size="sm" className="justify-start gap-2">
            <RotateCcw className="h-4 w-4" />
            المحذوفات
          </Button>
          <div className="border-t border-border my-2" />
          <Button onClick={() => handleAction(onExportBoard)} variant="ghost" size="sm" className="justify-start gap-2">
            <FileDown className="h-4 w-4" />
            تصدير اللوحة الحالية
          </Button>
          <input
            ref={boardFileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              onImportBoard(e);
              onOpenChange(false);
            }}
            className="hidden"
          />
          <Button onClick={() => boardFileInputRef.current?.click()} variant="ghost" size="sm" className="justify-start gap-2">
            <FileUp className="h-4 w-4" />
            استيراد لوحة
          </Button>
          <div className="border-t border-border my-2" />
          <Button onClick={() => handleAction(onExport)} variant="ghost" size="sm" className="justify-start gap-2">
            <Download className="h-4 w-4" />
            تصدير كل البيانات
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              onImport(e);
              onOpenChange(false);
            }}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="sm" className="justify-start gap-2">
            <Upload className="h-4 w-4" />
            استيراد كل البيانات
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
