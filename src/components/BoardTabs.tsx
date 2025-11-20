import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoardTabsProps {
  boards: string[];
  activeBoard: string;
  onBoardChange: (board: string) => void;
}

export const BoardTabs = ({ boards, activeBoard, onBoardChange }: BoardTabsProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
      <ScrollArea className="w-full">
        <div className="flex gap-2 p-4">
          {boards.map((board) => (
            <Button
              key={board}
              variant={activeBoard === board ? "default" : "outline"}
              onClick={() => onBoardChange(board)}
              className={cn(
                "whitespace-nowrap transition-all",
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
  );
};
