
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from "@/integrations/supabase/client";

// Dynamically set the favicon from Supabase storage
async function setFavicon() {
  try {
    const { data } = supabase
      .storage
      .from('logos')
      .getPublicUrl('favicon.jpg');
    
    if (data?.publicUrl) {
      // Create link element for the favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/jpeg';
      link.href = data.publicUrl;
      
      // Remove any existing favicons
      document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
      
      // Add the new favicon
      document.head.appendChild(link);
    }
  } catch (error) {
    console.error('Error setting favicon:', error);
  }
}

// Set favicon before rendering the app
setFavicon();

createRoot(document.getElementById("root")!).render(<App />);
