
import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

const ImageDisplay = () => {
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get("url") || "https://kjfwyaniengzduyeeufq.supabase.co/storage/v1/object/public/logos/defaultImage.png";
  const imageName = imageUrl.split("/").pop() || "image";

  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="p-4 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{imageName}</h1>
            <button 
              onClick={copyLinkToClipboard}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
          
          <div className="flex justify-center">
            <img 
              src={imageUrl} 
              alt="Full size display"
              className="object-contain" 
              style={{ height: "900px" }}
            />
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ImageDisplay;
