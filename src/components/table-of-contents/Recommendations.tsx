
import { ScrollArea } from "@/components/ui/scroll-area";
import EditableMarkdown from "../EditableMarkdown";

interface RecommendationsProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  sectionHeight: number;
  titleHeight: number;
}

export const Recommendations = ({ 
  content, 
  onSave,
  sectionHeight,
  titleHeight
}: RecommendationsProps) => {
  if (!content) return null;
  
  return (
    <div className="mt-4 flex-shrink-0">
      <div className="text-sm font-medium text-muted-foreground mb-1">
        Recommendations:
      </div>
      <div style={{ height: `${sectionHeight - titleHeight}px`, overflow: 'hidden' }}>
        <ScrollArea className="h-full w-full">
          <EditableMarkdown 
            content={content} 
            onSave={onSave} 
            placeholder="Add recommendations here..."
          />
        </ScrollArea>
      </div>
    </div>
  );
};
