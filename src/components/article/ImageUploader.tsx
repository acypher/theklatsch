
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ARTICLE_MEDIA_TYPES, getArticleMediaError } from '@/lib/articleMedia';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Use useRef instead of useState for DOM references
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to upload images or videos");
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before uploading
    const validationError = getArticleMediaError(file);
    if (validationError) {
      toast.error(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      let publicUrl: string;
      if (file.type.startsWith('video/')) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) throw new Error('Please sign in again before uploading.');
        const body = new FormData();
        body.append('video', file);
        const response = await fetch('/api/upload-video.php', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body,
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.url) {
          throw new Error(result?.error || 'Video upload failed. Please try again.');
        }
        publicUrl = new URL(result.url, window.location.origin).href;
      } else {
        const fileExt = ARTICLE_MEDIA_TYPES[file.type];
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        publicUrl = supabase.storage.from('article-images').getPublicUrl(filePath).data.publicUrl;
      }

      onImageUpload(publicUrl);
      toast.success(`${file.type.startsWith('video/') ? 'Video' : 'Image'} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image or video');
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
        accept={Object.keys(ARTICLE_MEDIA_TYPES).join(',')}
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
