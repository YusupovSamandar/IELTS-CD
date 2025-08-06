-- Database initialization script
-- This runs automatically when the PostgreSQL container starts for the first time

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS app;

-- Set default permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ieltstrek_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ieltstrek_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ieltstrek_user;

-- Grant existing permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ieltstrek_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ieltstrek_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ieltstrek_user;
