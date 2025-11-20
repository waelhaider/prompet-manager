import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";

interface BoardManagementProps {
  onAddBoard: () => void;
  onEditBoard: () => void;
  onDeleteBoard: () => void;
  onReorderBoards: () => void;
}

export const BoardManagement = ({
  onAddBoard,
  onEditBoard,
  onDeleteBoard,
  onReorderBoards,
}: BoardManagementProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-card border border-border rounded-lg">
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
    </div>
  );
};
