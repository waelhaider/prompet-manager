import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Copy, Edit2, Trash2, ArrowRight, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteCardProps {
  note: {
    id: string;
    content: string;
    board: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
  onCopy: () => void;
  onTranslate: () => void;
}

export const NoteCard = ({
  note,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  onCopy,
  onTranslate,
}: NoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lines = note.content.split('\n');
  const previewLines = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <Card
      className={cn(
        "relative p-3 cursor-pointer transition-all duration-200",
        "hover:bg-note-hover hover:shadow-md",
        isSelected && "bg-note-selected ring-2 ring-primary"
      )}
      onClick={() => {
        onSelect();
        setIsExpanded(!isExpanded);
      }}
    >
      <div className="pr-8">
        {isExpanded ? (
          <p className="whitespace-pre-wrap text-foreground leading-relaxed">
            {note.content}
          </p>
        ) : (
          <>
            {previewLines.map((line, idx) => (
              <p key={idx} className="text-foreground leading-relaxed break-words whitespace-pre-wrap">
                {line || '\u00A0'}
              </p>
            ))}
            {hasMore && (
              <p className="text-muted-foreground text-sm mt-1">...</p>
            )}
          </>
        )}
      </div>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-1.5 left-1.5 h-7 w-7 transition-opacity"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-40 bg-popover shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={onCopy} className="text-xs">
            <Copy className="mr-2 h-3.5 w-3.5" />
            نسخ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit} className="text-xs">
            <Edit2 className="mr-2 h-3.5 w-3.5" />
            تحرير
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onTranslate} className="text-xs">
            <Languages className="mr-2 h-3.5 w-3.5" />
            ترجمة
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMove} className="text-xs">
            <ArrowRight className="mr-2 h-3.5 w-3.5" />
            نقل إلى
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive text-xs">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};
