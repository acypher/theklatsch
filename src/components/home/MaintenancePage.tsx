
import { AlertTriangle } from "lucide-react";

export const MaintenancePage = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-6 flex justify-center">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-6">Temporarily unavailable</h2>
      
      <div className="flex justify-center mb-8">
        <img
          src="/placeholder.svg"
          alt=""
          className="max-w-md h-auto rounded-lg opacity-50"
        />
      </div>
      
      <p className="text-lg text-muted-foreground mt-6">
        We're currently experiencing some technical difficulties. 
        Our team is working hard to resolve the issue.
      </p>
    </div>
  </div>
);
