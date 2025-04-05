
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getCurrentIssue } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [currentIssue, setCurrentIssue] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCurrentIssue = async () => {
      const issueData = await getCurrentIssue();
      if (issueData?.text) {
        setCurrentIssue(issueData.text);
      }
    };
    
    loadCurrentIssue();
  }, []);
  
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
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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
          <a 
            href="subtitle" 
            id="subtitle"
            className="text-xl text-muted-foreground max-w-2xl mx-auto block"
          >
            {currentIssue || ""}
          </a>
        </header>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <AlertTriangle className="h-16 w-16 text-amber-500" />
            </div>
            
            <h2 className="text-3xl font-bold mb-6">Lovable Trouble</h2>
            
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/a99bdae2-b16b-477b-87c2-37edc603881f.png" 
                alt="Person confused looking at computer with errors" 
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            <p className="text-lg text-muted-foreground mt-6">
              We're currently experiencing some technical difficulties. 
              Our team is working hard to resolve the issue.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
