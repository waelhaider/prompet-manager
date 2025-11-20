import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Copy, Edit2, Trash2, ArrowRight } from "lucide-react";
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
}

export const NoteCard = ({
  note,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  onCopy,
}: NoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lines = note.content.split('\n');
  const previewLines = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <Card
      className={cn(
        "relative p-4 cursor-pointer transition-all duration-200",
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
              <p key={idx} className="text-foreground leading-relaxed truncate">
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
            className="absolute bottom-2 left-2 h-8 w-8 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-48 bg-popover shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            نسخ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            تحرير
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMove}>
            <ArrowRight className="mr-2 h-4 w-4" />
            نقل إلى
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};
