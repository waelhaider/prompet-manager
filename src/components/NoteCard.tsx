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

  // Detect text direction based on majority of characters
  const getTextDirection = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/g;
    const latinPattern = /[a-zA-Z]/g;
    const arabicCount = (text.match(arabicPattern) || []).length;
    const latinCount = (text.match(latinPattern) || []).length;
    return arabicCount >= latinCount ? 'rtl' : 'ltr';
  };
  const textDirection = getTextDirection(note.content);

  const availableBoards = boards.filter(b => b !== note.board);

  return (
    <Card
      className={cn(
        "relative p-2 pb-7 cursor-pointer transition-all duration-200",
        "hover:bg-note-hover hover:shadow-md",
        isSelected && "bg-note-selected ring-2 ring-primary"
      )}
      onClick={() => {
        onSelect();
        setIsExpanded(!isExpanded);
      }}
    >
      <div className="flex gap-2 items-start">
        {/* Images on the left */}
        {note.images && note.images.length > 0 && (
          <div className="flex-shrink-0 grid grid-cols-2 gap-0.5 content-start" style={{ width: '88px' }}>
            {(isExpanded ? note.images : note.images.slice(0, 4)).map((img, idx) => (
              <img 
                key={idx}
                src={img} 
                alt={`صورة ${idx + 1}`} 
                className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick?.(img);
                }}
              />
            ))}
            {!isExpanded && note.images.length > 4 && (
              <span className="text-xs text-muted-foreground flex items-center justify-center">+{note.images.length - 4}</span>
            )}
          </div>
        )}
        
        {/* Text on the right */}
        <div className="flex-1 min-w-0 overflow-hidden" style={{ maxHeight: isExpanded ? 'none' : '4.5em', direction: textDirection, textAlign: textDirection === 'rtl' ? 'right' : 'left' }}>
          {isExpanded ? (
            <p className="whitespace-pre-wrap text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
              {note.content}
            </p>
          ) : (
            <>
              {previewLines.map((line, idx) => {
                const lineDirection = getTextDirection(line);
                return (
                  <p key={idx} className="text-foreground leading-relaxed break-words whitespace-pre-wrap line-clamp-1" style={{ fontSize: `${fontSize}px`, direction: lineDirection, textAlign: lineDirection === 'rtl' ? 'right' : 'left' }}>
                    {line || '\u00A0'}
                  </p>
                );
              })}
              {hasMore && (
                <p className="text-muted-foreground text-sm">...</p>
              )}
            </>
          )}
        </div>
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
