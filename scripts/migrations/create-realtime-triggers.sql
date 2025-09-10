-- PostgreSQL LISTEN/NOTIFY Triggers for Real-time Updates
-- This migration creates triggers for all main tables to notify on changes

-- Function to notify on data changes
CREATE OR REPLACE FUNCTION notify_data_change()
RETURNS TRIGGER AS $$
DECLARE
  channel_name TEXT;
  payload JSON;
  record_data JSON;
BEGIN
  -- Determine the channel name based on table
  channel_name := TG_TABLE_NAME || '_changes';
  
  -- Get the record data
  IF TG_OP = 'DELETE' THEN
    record_data := row_to_json(OLD);
  ELSE
    record_data := row_to_json(NEW);
  END IF;
  
  -- Build the notification payload
  payload := json_build_object(
    'operation', TG_OP,
    'table_name', TG_TABLE_NAME,
    'id', CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id 
      ELSE NEW.id 
    END,
    'data', record_data,
    'timestamp', NOW()
  );
  
  -- Send notification
  PERFORM pg_notify(channel_name, payload::text);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS projects_notify_trigger ON projects;
DROP TRIGGER IF EXISTS clients_notify_trigger ON clients;
DROP TRIGGER IF EXISTS staff_notify_trigger ON staff;
DROP TRIGGER IF EXISTS procurement_boq_notify_trigger ON procurement_boq;
DROP TRIGGER IF EXISTS procurement_rfq_notify_trigger ON procurement_rfq;
DROP TRIGGER IF EXISTS sow_poles_notify_trigger ON sow_poles;
DROP TRIGGER IF EXISTS sow_drops_notify_trigger ON sow_drops;
DROP TRIGGER IF EXISTS sow_fiber_notify_trigger ON sow_fiber;

-- Create trigger for projects table
CREATE TRIGGER projects_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for clients table
CREATE TRIGGER clients_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for staff table
CREATE TRIGGER staff_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON staff
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for procurement BOQ table
CREATE TRIGGER procurement_boq_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON procurement_boq
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for procurement RFQ table
CREATE TRIGGER procurement_rfq_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON procurement_rfq
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for SOW poles table
CREATE TRIGGER sow_poles_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON sow_poles
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for SOW drops table
CREATE TRIGGER sow_drops_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON sow_drops
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Create trigger for SOW fiber table
CREATE TRIGGER sow_fiber_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON sow_fiber
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT EXECUTE ON FUNCTION notify_data_change() TO PUBLIC;

-- Create indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at);
CREATE INDEX IF NOT EXISTS idx_staff_updated_at ON staff(updated_at);
CREATE INDEX IF NOT EXISTS idx_procurement_boq_project_id ON procurement_boq(project_id);
CREATE INDEX IF NOT EXISTS idx_procurement_rfq_project_id ON procurement_rfq(project_id);
CREATE INDEX IF NOT EXISTS idx_sow_poles_project_id ON sow_poles(project_id);
CREATE INDEX IF NOT EXISTS idx_sow_drops_project_id ON sow_drops(project_id);
CREATE INDEX IF NOT EXISTS idx_sow_fiber_project_id ON sow_fiber(project_id);

-- Function to get real-time statistics
CREATE OR REPLACE FUNCTION get_realtime_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  stats := json_build_object(
    'projects_count', (SELECT COUNT(*) FROM projects),
    'clients_count', (SELECT COUNT(*) FROM clients),
    'staff_count', (SELECT COUNT(*) FROM staff),
    'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'active'),
    'last_update', (
      SELECT MAX(updated_at) FROM (
        SELECT MAX(updated_at) as updated_at FROM projects
        UNION ALL
        SELECT MAX(updated_at) FROM clients
        UNION ALL
        SELECT MAX(updated_at) FROM staff
      ) AS all_updates
    )
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create a heartbeat function for connection monitoring
CREATE OR REPLACE FUNCTION send_heartbeat()
RETURNS void AS $$
BEGIN
  PERFORM pg_notify('heartbeat', json_build_object(
    'timestamp', NOW(),
    'status', 'alive'
  )::text);
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION notify_data_change() IS 'Sends notifications via pg_notify when data changes occur';
COMMENT ON FUNCTION get_realtime_stats() IS 'Returns real-time statistics about the database';
COMMENT ON FUNCTION send_heartbeat() IS 'Sends heartbeat notifications for connection monitoring';