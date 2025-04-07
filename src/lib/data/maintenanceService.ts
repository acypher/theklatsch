
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to get the maintenance mode status
export const getMaintenanceMode = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('vars')
      .select('value')
      .eq('key', 'maintenance')
      .single();
    
    if (error) {
      console.error("Error fetching maintenance mode:", error);
      return 'normal'; // Default to normal mode if there's an error
    }
    
    return data?.value || 'normal';
  } catch (error) {
    console.error("Error in getMaintenanceMode:", error);
    return 'normal'; // Default to normal mode if there's an error
  }
};

// Function to update the maintenance mode
export const updateMaintenanceMode = async (mode: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vars')
      .update({ 
        value: mode,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'maintenance');
    
    if (error) {
      console.error("Error updating maintenance mode:", error);
      toast.error("Failed to update maintenance mode");
      return false;
    }
    
    toast.success(`Maintenance mode updated to: ${mode}`);
    return true;
  } catch (error) {
    console.error("Error in updateMaintenanceMode:", error);
    toast.error("Failed to update maintenance mode");
    return false;
  }
};
