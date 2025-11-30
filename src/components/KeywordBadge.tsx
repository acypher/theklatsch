
import { cn } from "@/lib/utils";

interface KeywordBadgeProps {
  keyword: string;
  className?: string;
  onClick?: () => void;
}

const KeywordBadge = ({ keyword, className, onClick }: KeywordBadgeProps) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
    >
      {keyword}
    </span>
  );
};

export default KeywordBadge;
