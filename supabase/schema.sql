-- ============================================================
--  KOSHISH — Full Database Schema
--  Supabase PostgreSQL
--  Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- ────────────────────────────────────────────
--  1. ADMINS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- No public access to admins table at all
CREATE POLICY "No public access to admins"
  ON admins FOR ALL
  USING (false);

-- ────────────────────────────────────────────
--  2. NOTICES
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  content     text NOT NULL,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active notices"
  ON notices FOR SELECT
  TO anon
  USING (is_active = true);

-- ────────────────────────────────────────────
--  3. EVENTS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name    text CHECK (event_name IN ('udaan', 'abhyuday')) NOT NULL,
  photo_url     text NOT NULL,
  storage_path  text NOT NULL,
  caption       text,
  uploaded_at   timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read events"
  ON events FOR SELECT
  TO anon
  USING (true);

-- ────────────────────────────────────────────
--  4. TEAM MEMBERS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  role           text NOT NULL,
  year           text CHECK (year IN ('faculty','4th','3rd','2nd','1st')) NOT NULL,
  photo_url      text,
  storage_path   text,
  email          text,
  display_order  integer DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read team members"
  ON team_members FOR SELECT
  TO anon
  USING (true);

-- ────────────────────────────────────────────
--  5. SITE CONTENT
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT
  TO anon
  USING (true);


-- ============================================================
--  SEED DATA
-- ============================================================

-- ── Admin ──
-- email: admin@koshish.org
-- password: koshish2024
-- bcrypt hash generated with cost factor 10
INSERT INTO admins (email, password_hash) VALUES
  ('admin@koshish.org', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- ── Notices ──
INSERT INTO notices (title, content) VALUES
  ('Welcome to Koshish!', 'We are a community of college students dedicated to providing free education to underprivileged children. Join us in making a difference!'),
  ('Class Schedule Update', 'New class timings: Weekdays 4 PM – 6 PM, Weekends 10 AM – 1 PM. All mentors please update your availability.'),
  ('Udaan 2025 Announced!', 'Our annual technical fest "Udaan" is scheduled for March 2025. Registrations open soon. Stay tuned for exciting events and workshops!');

-- ── Team Members (one per tier) ──
INSERT INTO team_members (name, role, year, display_order) VALUES
  ('Dr. Ananya Sharma',  'Faculty Advisor',        'faculty', 1),
  ('Rahul Verma',        'President',               '4th',     1),
  ('Priya Singh',        'Vice President',           '3rd',     1),
  ('Arjun Patel',        'Mentor Lead',              '2nd',     1),
  ('Sneha Gupta',        'Junior Mentor',            '1st',     1);

-- ── Site Content ──
INSERT INTO site_content (key, value) VALUES
  ('hero_tagline', 'Shaping futures, one lesson at a time'),
  ('mission',      'To provide free, quality education to underprivileged children from Kindergarten to Class 12, guided by passionate college student mentors and faculty, empowering every learner to achieve their full potential.'),
  ('vision',       'A world where every child has access to quality education regardless of their socio-economic background — where knowledge flows freely and opportunity knows no barriers.')
ON CONFLICT (key) DO NOTHING;
