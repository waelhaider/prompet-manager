import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Edit, Trash2, ArrowUpDown, Download, Upload, RotateCcw, FileDown, FileUp, ChevronDown, LayoutGrid } from "lucide-react";
import { useRef, useState } from "react";

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
  const [boardsMenuOpen, setBoardsMenuOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-64 bg-popover">
        <SheetHeader>
          <SheetTitle className="text-right">القائمة الرئيسية</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          {/* Boards Management Collapsible */}
          <Collapsible open={boardsMenuOpen} onOpenChange={setBoardsMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="justify-between w-full gap-2">
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  إدارة اللوحات
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${boardsMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pr-4 space-y-1 mt-1">
              <Button onClick={() => handleAction(onAddBoard)} variant="ghost" size="sm" className="justify-start gap-2 w-full">
                <Plus className="h-4 w-4" />
                إضافة لوحة
              </Button>
              <Button onClick={() => handleAction(onEditBoard)} variant="ghost" size="sm" className="justify-start gap-2 w-full">
                <Edit className="h-4 w-4" />
                تعديل اسم لوحة
              </Button>
              <Button onClick={() => handleAction(onReorderBoards)} variant="ghost" size="sm" className="justify-start gap-2 w-full">
                <ArrowUpDown className="h-4 w-4" />
                ترتيب اللوحات
              </Button>
              <Button onClick={() => handleAction(onDeleteBoard)} variant="ghost" size="sm" className="justify-start gap-2 w-full">
                <Trash2 className="h-4 w-4" />
                حذف لوحة
              </Button>
            </CollapsibleContent>
          </Collapsible>

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
