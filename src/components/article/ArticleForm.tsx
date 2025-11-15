
import { ReactNode } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ArticleFormValues } from "@/components/article/ArticleFormSchema";
import {
  TitleField,
  DescriptionField,
  AuthorField,
  KeywordsField,
  ImageField,
  SourceUrlField,
  SummaryField,
  ContentField,
  PrivateField
} from "@/components/article/ArticleFormFields";

interface ArticleFormProps {
  form: UseFormReturn<ArticleFormValues>;
  onSubmit: (data: ArticleFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onChange?: () => void;
  children?: ReactNode;
}

const ArticleForm = ({ 
  form, 
  onSubmit, 
  isSubmitting, 
  submitButtonText, 
  onChange,
  children 
}: ArticleFormProps) => {
  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        onChange={onChange} 
        className="space-y-6"
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
        
        <div className="pt-4 flex gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {submitButtonText === "Publish Article" ? "Publishing..." : "Updating..."}
              </>
            ) : submitButtonText}
          </Button>
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
