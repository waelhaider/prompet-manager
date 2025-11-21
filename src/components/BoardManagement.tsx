import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowUpDown, Download, Upload } from "lucide-react";
import { useRef } from "react";

interface BoardManagementProps {
  onAddBoard: () => void;
  onEditBoard: () => void;
  onDeleteBoard: () => void;
  onReorderBoards: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const BoardManagement = ({
  onAddBoard,
  onEditBoard,
  onDeleteBoard,
  onReorderBoards,
  onExport,
  onImport,
  className,
}: BoardManagementProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex flex-wrap gap-2 p-4 bg-card border border-border rounded-lg ${className}`}>
      <Button onClick={onAddBoard} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        إضافة لوحة
      </Button>
      <Button onClick={onEditBoard} variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        تعديل اسم لوحة
      </Button>
      <Button onClick={onDeleteBoard} variant="outline" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        حذف لوحة
      </Button>
      <Button onClick={onReorderBoards} variant="outline" size="sm">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        ترتيب اللوحات
      </Button>
      <Button onClick={onExport} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        تصدير البيانات
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImport}
        className="hidden"
      />
      <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
        <Upload className="mr-2 h-4 w-4" />
        استيراد البيانات
      </Button>
    </div>
  );
};
