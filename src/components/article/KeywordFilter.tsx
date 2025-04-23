
interface KeywordFilterProps {
  selectedKeyword: string;
  onClear: () => void;
}

const KeywordFilter = ({ selectedKeyword, onClear }: KeywordFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <p className="font-medium">Filtered by keyword:</p>
      <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm flex items-center gap-1">
        {selectedKeyword}
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

export default KeywordFilter;
