
import { AlertTriangle } from "lucide-react";

export const MaintenancePage = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-6 flex justify-center">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-6">Lovable Trouble</h2>
      
      <div className="flex justify-center mb-8">
        <img 
          src="/lovable-uploads/a99bdae2-b16b-477b-477b-87c2-37edc603881f.png" 
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
);
