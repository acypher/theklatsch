
interface SelectedKeywordProps {
  keyword: string;
  onClear: () => void;
}

const SelectedKeyword = ({ keyword, onClear }: SelectedKeywordProps) => {
  if (!keyword) return null;
  
  return (
    <div className="flex items-center gap-2">
      <p className="font-medium">Filtered by keyword:</p>
      <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm flex items-center gap-1">
        {keyword}
        <button 
          onClick={onClear} 
          className="ml-1 hover:bg-primary-foreground/20 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs"
        >
          ×
        </button>
      </span>
    </div>
  );
};

export default SelectedKeyword;
