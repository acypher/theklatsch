
interface UnsavedChangesPromptProps {
  onCancel: () => void;
  onSave: () => void;
}

const UnsavedChangesPrompt = ({ onCancel, onSave }: UnsavedChangesPromptProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-10">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
        <p className="mb-2">You have unsaved changes to the article order</p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onCancel}
            className="px-3 py-1 bg-primary-foreground/20 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="px-3 py-1 bg-primary-foreground/50 rounded font-medium"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesPrompt;
