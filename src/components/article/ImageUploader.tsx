
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Use useRef instead of useState for DOM references
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds 5MB limit`);
      return false;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported`);
      return false;
    }

    return true;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to upload images");
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before uploading
    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      // Use a UUID-like filename to prevent path traversal attacks
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Prevent overwrites of existing files
        });

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        ref={fileInputRef}
        type="file"
        id="imageUpload"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleImageUpload}
        className="hidden"
      />
      <Button 
        type="button" 
        variant="outline" 
        disabled={uploading || !isAuthenticated}
        onClick={triggerFileInput}
      >
        <Upload size={16} className="mr-2" />
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
};

export default ImageUploader;
