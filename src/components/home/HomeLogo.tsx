
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const HomeLogo = () => {
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

  return (
    <header className="text-center mb-12">
      {logoUrl ? (
        <div className="flex justify-center mb-4">
          <img 
            src={logoUrl} 
            alt="The Klatsch" 
            className="h-20 md:h-24" 
          />
        </div>
      ) : (
        <h1 className="text-4xl font-bold mb-4">The Klatsch</h1>
      )}
    </header>
  );
};
