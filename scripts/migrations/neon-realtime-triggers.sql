-- Neon-compatible Real-time Triggers
-- Simplified version that works with Neon's PostgreSQL

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS projects_updated_trigger ON projects;
DROP TRIGGER IF EXISTS clients_updated_trigger ON clients;
DROP TRIGGER IF EXISTS staff_updated_trigger ON staff;

-- Create a simple update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER projects_updated_trigger
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER clients_updated_trigger
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER staff_updated_trigger
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a tracking table for real-time changes
CREATE TABLE IF NOT EXISTS realtime_changes (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id INTEGER,
    record_data JSONB,
    changed_at TIMESTAMP DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Create index for efficient polling
CREATE INDEX IF NOT EXISTS idx_realtime_changes_unprocessed 
ON realtime_changes(processed, changed_at) 
WHERE processed = FALSE;

-- Function to log changes to tracking table
CREATE OR REPLACE FUNCTION log_realtime_change()
RETURNS TRIGGER AS $$
DECLARE
    record_data JSONB;
    record_id INTEGER;
BEGIN
    -- Get the record ID and data based on operation
    IF TG_OP = 'DELETE' THEN
        record_id := OLD.id;
        record_data := to_jsonb(OLD);
    ELSE
        record_id := NEW.id;
        record_data := to_jsonb(NEW);
    END IF;
    
    -- Insert change record
    INSERT INTO realtime_changes (table_name, operation, record_id, record_data)
    VALUES (TG_TABLE_NAME, TG_OP, record_id, record_data);
    
    -- Return appropriate value
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for change logging
CREATE TRIGGER projects_realtime_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_realtime_change();

CREATE TRIGGER clients_realtime_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION log_realtime_change();

CREATE TRIGGER staff_realtime_trigger
    AFTER INSERT OR UPDATE OR DELETE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION log_realtime_change();

-- Function to get recent changes (for polling)
CREATE OR REPLACE FUNCTION get_recent_changes(
    since_timestamp TIMESTAMP DEFAULT NULL,
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    id INTEGER,
    table_name VARCHAR(50),
    operation VARCHAR(10),
    record_id INTEGER,
    record_data JSONB,
    changed_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id,
        rc.table_name,
        rc.operation,
        rc.record_id,
        rc.record_data,
        rc.changed_at
    FROM realtime_changes rc
    WHERE rc.processed = FALSE
    AND (since_timestamp IS NULL OR rc.changed_at > since_timestamp)
    ORDER BY rc.changed_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark changes as processed
CREATE OR REPLACE FUNCTION mark_changes_processed(change_ids INTEGER[])
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE realtime_changes
    SET processed = TRUE
    WHERE id = ANY(change_ids);
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- Clean up old processed changes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_changes()
RETURNS INTEGER AS $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM realtime_changes
    WHERE processed = TRUE
    AND changed_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;