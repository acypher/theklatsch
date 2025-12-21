
import { supabase } from "@/integrations/supabase/client";

export const uploadToLogosBucket = async (file: File, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // This will overwrite if file exists
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    console.log('File uploaded successfully:', urlData.publicUrl);
    return { 
      success: true, 
      data, 
      publicUrl: urlData.publicUrl 
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return { success: false, error };
  }
};

// Example usage function
export const uploadLogoFile = async () => {
  // Create a file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const result = await uploadToLogosBucket(file, file.name);
      if (result.success) {
        alert(`File uploaded! URL: ${result.publicUrl}`);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    }
  };
  
  input.click();
};
