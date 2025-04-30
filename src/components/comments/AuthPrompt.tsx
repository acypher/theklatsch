
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface AuthPromptProps {
  onLogin: () => void;
}

const AuthPrompt = ({ onLogin }: AuthPromptProps) => {
  return (
    <div className="mt-2 mb-2 space-y-4">
      <Alert>
        <AlertDescription>
          You need to be signed in to post a comment.
        </AlertDescription>
      </Alert>
      <Button 
        onClick={onLogin}
        className="w-full flex items-center justify-center gap-2"
      >
        <LogIn size={16} />
        Sign In to Comment
      </Button>
    </div>
  );
};

export default AuthPrompt;
