
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useLogoUpload = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const uploadLogo = async () => {
      try {
        const { data: existingFiles } = await supabase
          .storage
          .from('logos')
          .list();
        
        const logoExists = existingFiles?.some(file => file.name === 'klatsch-logo.png');
        
        if (!logoExists) {
          const response = await fetch('/klatsch-logo.png');
          const blob = await response.blob();
          
          const { error } = await supabase
            .storage
            .from('logos')
            .upload('klatsch-logo.png', blob);
            
          if (error) {
            console.error('Error uploading logo:', error);
          }
        }
        
        const { data: logoData } = supabase
          .storage
          .from('logos')
          .getPublicUrl('klatsch-logo.png');
        
        if (logoData) {
          setLogoUrl(logoData.publicUrl);
        }
      } catch (error) {
        console.error('Error with logo:', error);
      }
    };
    
    uploadLogo();
  }, []);

  return logoUrl;
};
