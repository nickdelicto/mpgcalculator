-- Add normalized_model column
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS normalized_model VARCHAR(100);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_normalized_search 
ON vehicles(normalized_model, make, year);

-- Update normalized_model values
UPDATE vehicles 
SET normalized_model = TRIM(
    REGEXP_REPLACE(
        REGEXP_REPLACE(LOWER(model), '[^a-z0-9]', ' ', 'g'),  -- Replace all non-alphanumeric chars with space
        '\s+', ' ', 'g'                                        -- Replace multiple spaces with single space
    )
);

-- Add NOT NULL constraint after populating
ALTER TABLE vehicles ALTER COLUMN normalized_model SET NOT NULL;

-- Add comment explaining the normalization rules
COMMENT ON COLUMN vehicles.normalized_model IS 
'Normalized version of model name: lowercase, all special characters replaced with spaces, trimmed. Used for matching URLs to database entries.'; 