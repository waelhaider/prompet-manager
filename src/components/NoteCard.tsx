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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface NoteCardProps {
  note: {
    id: string;
    content: string;
    board: string;
    images?: string[];
  };
  boards: string[];
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveTo: (targetBoard: string) => void;
  onCopy: () => void;
  onTranslate: () => void;
  fontSize?: number;
  onImageClick?: (image: string) => void;
}

export const NoteCard = ({
  note,
  boards,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onMoveTo,
  onCopy,
  onTranslate,
  fontSize = 14,
  onImageClick,
}: NoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lines = note.content.split('\n');
  const previewLines = lines.slice(0, 3);
  const hasMore = lines.length > 3 || (note.images && note.images.length > 0);

  const availableBoards = boards.filter(b => b !== note.board);

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
          <>
            <p className="whitespace-pre-wrap text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
              {note.content}
            </p>
            {note.images && note.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {note.images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`صورة ${idx + 1}`} 
                    className="max-w-[25%] h-auto rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick?.(img);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {previewLines.map((line, idx) => (
              <p key={idx} className="text-foreground leading-relaxed break-words whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                {line || '\u00A0'}
              </p>
            ))}
            {note.images && note.images.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.images.slice(0, 3).map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`صورة ${idx + 1}`} 
                    className="h-12 w-auto rounded border"
                  />
                ))}
                {note.images.length > 3 && (
                  <span className="text-xs text-muted-foreground self-center">+{note.images.length - 3}</span>
                )}
              </div>
            )}
            {hasMore && !note.images?.length && (
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
          {availableBoards.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                نقل إلى
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-popover shadow-lg z-50">
                  {availableBoards.map(board => (
                    <DropdownMenuItem
                      key={board}
                      className="text-xs"
                      onClick={() => {
                        onMoveTo(board);
                        setMenuOpen(false);
                      }}
                    >
                      {board}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          <DropdownMenuItem onClick={onDelete} className="text-destructive text-xs">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};
