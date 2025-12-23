import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Copy, Edit2, Trash2, ArrowRight, Languages, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NoteCardProps {
  note: {
    id: string;
    content: string;
    board: string;
    images?: string[];
    createdAt?: string;
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
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const activationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activateCard = () => {
    if (activationTimeoutRef.current) {
      clearTimeout(activationTimeoutRef.current);
    }
    setIsActivated(true);
    activationTimeoutRef.current = setTimeout(() => {
      setIsActivated(false);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current);
      }
    };
  }, []);

  const lines = note.content.split('\n');
  const lineCount = Math.min(lines.length, 3);
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

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open);
    if (!open) {
      setShowMoveOptions(false);
    }
  };

  return (
    <Card
      className={cn(
        "relative p-2 pb-7 cursor-pointer transition-all duration-200",
        "shadow-sm hover:shadow-lg hover:bg-note-hover",
        isSelected && "bg-note-selected ring-2 ring-primary shadow-md",
        isActivated && "ring-2 ring-primary/60 bg-primary/5 shadow-md"
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
        <div className="flex-1 min-w-0 overflow-hidden" style={{ height: isExpanded ? 'auto' : undefined, minHeight: isExpanded ? undefined : `${lineCount * 1.5}em`, maxHeight: isExpanded ? undefined : '4.5em', direction: textDirection, textAlign: textDirection === 'rtl' ? 'right' : 'left' }}>
          {isExpanded ? (
            <p className="whitespace-pre-wrap text-foreground" style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}>
              {note.content}
            </p>
          ) : (
            <div className="line-clamp-3">
              <p className="text-foreground break-words whitespace-pre-wrap" style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}>
                {note.content}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: timestamp and menu */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
        {note.createdAt && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(note.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })} - {new Date(note.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {!note.createdAt && <span />}
        <DropdownMenu open={menuOpen} onOpenChange={handleMenuOpenChange}>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-opacity"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          sideOffset={8}
          className="w-48 bg-dropdown-menu shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {showMoveOptions ? (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowMoveOptions(false);
                }}
                className="text-sm font-medium"
              >
                <ChevronLeft className="mr-2 h-3.5 w-3.5" />
                رجوع
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {availableBoards.map(board => (
                <DropdownMenuItem
                  key={board}
                  className="text-sm"
                  onClick={() => {
                    onMoveTo(board);
                    setMenuOpen(false);
                  }}
                >
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  {board}
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => { onCopy(); activateCard(); }} className="text-sm">
                <Copy className="mr-2 h-3.5 w-3.5" />
                نسخ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onEdit(); activateCard(); }} className="text-sm">
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                تحرير
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onTranslate(); activateCard(); }} className="text-sm">
                <Languages className="mr-2 h-3.5 w-3.5" />
                ترجمة
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={availableBoards.length === 0}
                onSelect={(e) => {
                  e.preventDefault();
                  setShowMoveOptions(true);
                }}
                className="text-sm"
              >
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                نقل إلى
              </DropdownMenuItem>
              {availableBoards.length === 0 && (
                <DropdownMenuItem disabled className="text-sm">
                  لا توجد لوحات أخرى
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={() => {
                  setMenuOpen(false);
                  setShowDeleteConfirm(true);
                }} 
                className="text-destructive text-sm"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                حذف
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
