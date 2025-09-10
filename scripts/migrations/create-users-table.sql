-- Create users table for storing user profiles from Clerk
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'technician', 'viewer')),
  phone VARCHAR(50),
  department VARCHAR(100),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default development user
INSERT INTO users (id, clerk_id, email, name, role, is_active, created_at) 
VALUES 
  ('dev-user-001', 'dev-user-001', 'dev@fibreflow.local', 'Development Admin', 'admin', true, CURRENT_TIMESTAMP),
  ('dev-user-002', 'dev-user-002', 'manager@fibreflow.local', 'Test Manager', 'manager', true, CURRENT_TIMESTAMP),
  ('dev-user-003', 'dev-user-003', 'tech@fibreflow.local', 'Test Technician', 'technician', true, CURRENT_TIMESTAMP),
  ('dev-user-004', 'dev-user-004', 'viewer@fibreflow.local', 'Test Viewer', 'viewer', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Create user_sessions table for tracking sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Create user_permissions table for granular permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  granted BOOLEAN DEFAULT true,
  granted_by VARCHAR(255) REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_permissions_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE,
    
  CONSTRAINT unique_user_permission 
    UNIQUE (user_id, resource, action)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource ON user_permissions(resource);

-- Create audit log for user actions
CREATE TABLE IF NOT EXISTS user_audit_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX idx_user_audit_log_action ON user_audit_log(action);
CREATE INDEX idx_user_audit_log_created_at ON user_audit_log(created_at DESC);

-- Grant default permissions for development users
INSERT INTO user_permissions (user_id, resource, action, granted_by) 
VALUES 
  ('dev-user-001', '*', '*', 'dev-user-001'),
  ('dev-user-002', 'projects', 'read', 'dev-user-001'),
  ('dev-user-002', 'projects', 'write', 'dev-user-001'),
  ('dev-user-002', 'staff', 'read', 'dev-user-001'),
  ('dev-user-002', 'staff', 'write', 'dev-user-001'),
  ('dev-user-003', 'projects', 'read', 'dev-user-001'),
  ('dev-user-003', 'tasks', 'read', 'dev-user-001'),
  ('dev-user-003', 'tasks', 'write', 'dev-user-001'),
  ('dev-user-004', 'projects', 'read', 'dev-user-001'),
  ('dev-user-004', 'dashboard', 'read', 'dev-user-001')
ON CONFLICT (user_id, resource, action) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE users IS 'User profiles synchronized from Clerk authentication';
COMMENT ON TABLE user_sessions IS 'Active user sessions for tracking login state';
COMMENT ON TABLE user_permissions IS 'Granular permissions for role-based access control';
COMMENT ON TABLE user_audit_log IS 'Audit trail of user actions for security and compliance';