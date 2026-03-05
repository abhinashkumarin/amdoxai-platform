-- ============================================================
-- AMDOX AI — COMPLETE SUPABASE SCHEMA
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- 1. DROP OLD TABLES (if exist)
DROP TABLE IF EXISTS employee_sessions CASCADE;
DROP TABLE IF EXISTS eod_reports CASCADE;
DROP TABLE IF EXISTS stress_alerts CASCADE;
DROP TABLE IF EXISTS emotion_logs CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 2. ORGANIZATIONS
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  plan_type     TEXT DEFAULT 'free',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS (Clerk linked)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   TEXT UNIQUE NOT NULL,
  email           TEXT,
  full_name       TEXT,
  role            TEXT DEFAULT 'employee',
  organization_id UUID REFERENCES organizations(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EMPLOYEES
CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name            TEXT NOT NULL,
  email           TEXT,
  department      TEXT DEFAULT 'General',
  role            TEXT DEFAULT 'employee',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMOTION LOGS
CREATE TABLE emotion_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID REFERENCES employees(id),
  organization_id UUID REFERENCES organizations(id),
  emotion         TEXT NOT NULL,
  confidence      FLOAT DEFAULT 0.5,
  stress_level    FLOAT DEFAULT 0.0,
  source          TEXT DEFAULT 'TEXT',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STRESS ALERTS
CREATE TABLE stress_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID REFERENCES employees(id),
  organization_id  UUID REFERENCES organizations(id),
  dominant_emotion TEXT,
  severity_score   FLOAT DEFAULT 0.0,
  stress_score     FLOAT DEFAULT 0.0,
  status           TEXT DEFAULT 'pending',
  message          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EOD REPORTS
CREATE TABLE eod_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         UUID REFERENCES employees(id),
  org_id              UUID REFERENCES organizations(id),
  report_date         DATE DEFAULT CURRENT_DATE,
  employee_name       TEXT,
  work_hours          TEXT,
  total_scans         INTEGER DEFAULT 0,
  face_scans          INTEGER DEFAULT 0,
  text_scans          INTEGER DEFAULT 0,
  dominant_emotion    TEXT,
  avg_stress_pct      INTEGER DEFAULT 0,
  distribution_pct    JSONB DEFAULT '{}',
  timeline            JSONB DEFAULT '[]',
  needs_hr_attention  BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMPLOYEE SESSIONS
CREATE TABLE employee_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID REFERENCES employees(id),
  org_id           UUID REFERENCES organizations(id),
  employee_name    TEXT NOT NULL,
  designation      TEXT NOT NULL,
  login_time       TIMESTAMPTZ DEFAULT NOW(),
  work_end_time    TIMESTAMPTZ,
  work_hours       INTEGER DEFAULT 8,
  work_mins        INTEGER DEFAULT 0,
  logout_time      TIMESTAMPTZ,
  total_scans      INTEGER DEFAULT 0,
  face_scans       INTEGER DEFAULT 0,
  text_scans       INTEGER DEFAULT 0,
  dominant_emotion TEXT DEFAULT 'Neutral',
  avg_stress_pct   INTEGER DEFAULT 0,
  session_date     DATE DEFAULT CURRENT_DATE,
  status           TEXT DEFAULT 'active',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SEED DEFAULT DATA
INSERT INTO organizations (id, name, plan_type)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'free')
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees (id, organization_id, name, email, department, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Test Employee',
  'test@amdox.com',
  'Engineering',
  'employee'
)
ON CONFLICT (id) DO NOTHING;

-- 10. RLS POLICIES
ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE eod_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_sessions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_all_orgs"      ON organizations      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_users"     ON users              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_emps"      ON employees          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_logs"      ON emotion_logs       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_alerts"    ON stress_alerts      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_eod"       ON eod_reports        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_sessions"  ON employee_sessions  FOR ALL USING (true) WITH CHECK (true);

-- 11. VERIFY ALL TABLES
SELECT 'organizations'     as tbl, count(*) FROM organizations
UNION ALL SELECT 'users',            count(*) FROM users
UNION ALL SELECT 'employees',        count(*) FROM employees
UNION ALL SELECT 'emotion_logs',     count(*) FROM emotion_logs
UNION ALL SELECT 'stress_alerts',    count(*) FROM stress_alerts
UNION ALL SELECT 'eod_reports',      count(*) FROM eod_reports
UNION ALL SELECT 'employee_sessions',count(*) FROM employee_sessions;