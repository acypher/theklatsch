
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  
  // Create a reference to the file input element
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        ref={(el) => fileInputRef.current = el}
        type="file"
        id="imageUpload"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <Button 
        type="button" 
        variant="outline" 
        disabled={uploading}
        onClick={triggerFileInput}
      >
        <Upload size={16} className="mr-2" />
        {uploading ? 'Uploading...' : 'Upload Image'}
      </Button>
    </div>
  );
};

export default ImageUploader;
