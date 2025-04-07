
-- Function to get a value from the vars table
CREATE OR REPLACE FUNCTION get_var_value(var_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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
