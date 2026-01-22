
import { ReactNode } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ArticleFormValues } from "@/components/article/ArticleFormSchema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TitleField,
  DescriptionField,
  AuthorField,
  KeywordsField,
  ImageField,
  SourceUrlField,
  SummaryField,
  ContentField,
  PrivateField,
  DraftField
} from "@/components/article/ArticleFormFields";

interface ArticleFormProps {
  form: UseFormReturn<ArticleFormValues>;
  onSubmit: (data: ArticleFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onChange?: () => void;
  children?: ReactNode;
  isDraft?: boolean;
}

const ArticleForm = ({ 
  form, 
  onSubmit, 
  isSubmitting, 
  submitButtonText, 
  onChange,
  children,
  isDraft = false
}: ArticleFormProps) => {
  const currentDraftValue = form.watch("draft");
  const titleValue = form.watch("title");
  const descriptionValue = form.watch("description");
  const showDraftBorder = isDraft || currentDraftValue;
  
  const isMissingRequired = !titleValue?.trim() || !descriptionValue?.trim();
  const isButtonDisabled = isSubmitting || isMissingRequired;

  const SubmitButton = (
    <Button 
      type="submit" 
      disabled={isButtonDisabled} 
      className="flex-1"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          {currentDraftValue ? "Saving..." : (submitButtonText === "Publish Article" ? "Publishing..." : "Updating...")}
        </>
      ) : (currentDraftValue ? "Save" : submitButtonText)}
    </Button>
  );

  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        onChange={onChange} 
        className={`space-y-6 ${showDraftBorder ? 'draft-border p-6 rounded-lg' : ''}`}
      >
        {children}
        
        <TitleField />
        <DescriptionField />
        <AuthorField />
        <KeywordsField />
        <ImageField />
        <SourceUrlField />
        <ContentField />
        <SummaryField />
        
        <PrivateField />
        <DraftField />
        
        <div className="pt-4 flex gap-2">
          {isMissingRequired ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="flex-1">
                  <span className="flex-1">{SubmitButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Articles require a Title and a Description</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            SubmitButton
          )}
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ArticleForm;
