
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
  const { control, setValue, watch } = useFormContext<ArticleFormValues>();
  const currentImageUrl = watch('imageUrl');
  
  const handleImageUpload = (imageUrl: string) => {
    setValue('imageUrl', imageUrl, { shouldValidate: true });
  };
  
  return (
    <Controller
      control={control}
      name="imageUrl"
      render={({ field }) => (
        <FieldWrapper 
          name="imageUrl" 
          label="Article Image"
          description="Upload an image or provide an image URL (only primary image for now)"
        >
          <div className="flex space-x-4 items-center">
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              {...field} 
            />
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
          {currentImageUrl && (
            <div className="mt-2 p-2 border rounded">
              <div className="text-xs text-muted-foreground mb-1">Preview:</div>
              <img 
                src={currentImageUrl} 
                alt="Image preview" 
                className="h-20 object-contain" 
              />
            </div>
          )}
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
