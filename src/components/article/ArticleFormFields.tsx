
import { ReactNode } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField as HookFormField, FormItem } from "@/components/ui/form";
import FormField from "@/components/article/FormField";
import MarkdownEditor from "@/components/article/MarkdownEditor";
import ImageUploader from "@/components/article/ImageUploader";
import { ArticleFormValues } from "@/components/article/ArticleFormSchema";

interface FieldWrapperProps {
  name: keyof ArticleFormValues;
  label: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

const FieldWrapper = ({ name, label, required, description, children }: FieldWrapperProps) => {
  return (
    <HookFormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormField id={String(name)} label={label} required={required} description={description}>
            <FormControl>{children}</FormControl>
          </FormField>
        </FormItem>
      )}
    />
  );
};

export const TitleField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="title"
      render={({ field }) => (
        <FieldWrapper 
          name="title" 
          label="Title" 
          required 
          description="Use Markdown to format your title"
        >
          <MarkdownEditor
            value={field.value}
            onChange={(value) => field.onChange(value || "")}
            placeholder="Enter article title"
            height={150}
          />
        </FieldWrapper>
      )}
    />
  );
};

export const DescriptionField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="description"
      render={({ field }) => (
        <FieldWrapper 
          name="description" 
          label="Description" 
          required 
          description="Use Markdown to format your description"
        >
          <MarkdownEditor
            value={field.value}
            onChange={(value) => field.onChange(value || "")}
            placeholder="Write a short description of your article"
          />
        </FieldWrapper>
      )}
    />
  );
};

export const AuthorField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="author"
      render={({ field }) => (
        <FieldWrapper name="author" label="Author">
          <Input
            id="author"
            placeholder="Your name (optional)"
            {...field} 
          />
        </FieldWrapper>
      )}
    />
  );
};

export const KeywordsField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="keywords"
      render={({ field }) => (
        <FieldWrapper 
          name="keywords" 
          label="Keywords"
          description="Separate keywords with spaces"
        >
          <Input
            id="keywords"
            placeholder="Web Development JavaScript Design"
            {...field} 
          />
        </FieldWrapper>
      )}
    />
  );
};

export const ImageField = () => {
  const { control, setValue } = useFormContext<ArticleFormValues>();
  
  const handleImageUpload = (imageUrl: string) => {
    setValue('imageUrl', imageUrl);
  };
  
  return (
    <Controller
      control={control}
      name="imageUrl"
      render={({ field }) => (
        <FieldWrapper 
          name="imageUrl" 
          label="Article Image or Video"
          description="Provide a URL or upload an image or video"
        >
          <div className="flex space-x-4 items-center">
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              {...field} 
            />
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        </FieldWrapper>
      )}
    />
  );
};

export const SourceUrlField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="sourceUrl"
      render={({ field }) => (
        <FieldWrapper 
          name="sourceUrl" 
          label="Source URL"
        >
          <Input
            id="sourceUrl"
            placeholder="https://example.com/your-article"
            {...field} 
          />
        </FieldWrapper>
      )}
    />
  );
};

export const SummaryField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="summary"
      render={({ field }) => (
        <FieldWrapper 
          name="summary" 
          label="Summary"
          description="A brief summary of the article in Markdown format"
        >
          <MarkdownEditor
            value={field.value}
            onChange={(value) => field.onChange(value || "")}
            placeholder="Add a brief summary..."
            height={150}
          />
        </FieldWrapper>
      )}
    />
  );
};

export const ContentField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="more_content"
      render={({ field }) => (
        <FieldWrapper 
          name="more_content" 
          label="More Content (Markdown)"
          description="Use Markdown to format additional content"
        >
          <MarkdownEditor
            value={field.value}
            onChange={(value) => field.onChange(value || "")}
            placeholder="Write additional content using Markdown..."
          />
        </FieldWrapper>
      )}
    />
  );
};

export const PrivateField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="private"
      render={({ field }) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="private"
            checked={field.value || false}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="private" className="text-sm font-medium">
            Private (only visible to registered users)
          </label>
        </div>
      )}
    />
  );
};

export const DraftField = () => {
  const { control } = useFormContext<ArticleFormValues>();
  
  return (
    <Controller
      control={control}
      name="draft"
      render={({ field }) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="draft"
            checked={field.value || false}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="draft" className="text-sm font-medium">
            Draft (only visible to you until published)
          </label>
        </div>
      )}
    />
  );
};
