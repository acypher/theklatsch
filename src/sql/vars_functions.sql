
-- Function to get a value from the vars table
CREATE OR REPLACE FUNCTION get_var_value(var_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    var_value TEXT;
BEGIN
    SELECT value INTO var_value
    FROM vars
    WHERE key = var_key;
    
    RETURN var_value;
END;
$$;

-- Function to set a value in the vars table
CREATE OR REPLACE FUNCTION set_var_value(var_key TEXT, var_value TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE vars
    SET 
        value = var_value,
        updated_at = now()
    WHERE key = var_key;
    
    IF NOT FOUND THEN
        INSERT INTO vars (key, value)
        VALUES (var_key, var_value);
    END IF;
END;
$$;

-- Function to ensure that display_issue is always set properly
CREATE OR REPLACE FUNCTION ensure_display_issue()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_issue TEXT;
BEGIN
    -- Try to get the current display_issue
    SELECT value INTO current_issue
    FROM issue
    WHERE key = 'display_issue';
    
    -- If it doesn't exist or is invalid, set it to "August 2023"
    IF current_issue IS NULL OR current_issue = 'Unknown "2024"' THEN
        UPDATE issue
        SET value = '"August 2023"'
        WHERE key = 'display_issue';
        
        IF NOT FOUND THEN
            INSERT INTO issue (key, value)
            VALUES ('display_issue', '"August 2023"');
        END IF;
        
        RETURN 'August 2023';
    END IF;
    
    RETURN current_issue;
END;
$$;
