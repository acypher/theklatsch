
import { useState, useEffect } from "react";

const NoArticlesFound = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 5000); // Wait 5 seconds before showing the message

    return () => clearTimeout(timer);
  }, []);

  if (!showMessage) {
    return null; // Don't render anything during the delay
  }

  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-medium text-gray-600">No articles found</h3>
      <p className="text-muted-foreground mt-2">Select a different month for the Issue</p>
    </div>
  );
};

export default NoArticlesFound;
