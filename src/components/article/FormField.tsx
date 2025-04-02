
import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

const FormField = ({ 
  id, 
  label, 
  required = false, 
  description,
  children 
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default FormField;
