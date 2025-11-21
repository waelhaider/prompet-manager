import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface BoardTabsProps {
  boards: string[];
  activeBoard: string;
  onBoardChange: (board: string) => void;
  onMenuOpen: () => void;
}

export const BoardTabs = ({ boards, activeBoard, onBoardChange, onMenuOpen }: BoardTabsProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
      <div className="container max-w-4xl mx-auto relative">
        <Button 
          onClick={onMenuOpen}
          variant="ghost" 
          size="sm" 
          className="absolute left-2 top-2 z-20"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-2 pr-12" dir="rtl">
            {boards.map((board) => (
              <Button
                key={board}
                variant={activeBoard === board ? "default" : "outline"}
                onClick={() => onBoardChange(board)}
                size="sm"
                className={cn(
                  "whitespace-nowrap transition-all text-sm h-8",
                  activeBoard === board && "shadow-md"
                )}
              >
                {board}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
