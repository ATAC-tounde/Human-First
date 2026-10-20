-- HUMAN FIRST - proposed PostgreSQL multi-tenant backbone, V0.9 technical foundation.
-- NOT executed by the Node demo. Requires authenticated backend, reviewed policies,
-- backups, migration runner, privacy impact assessment and production infrastructure.
-- Apply with a privileged migration role, never directly from a browser.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS hf;

CREATE TABLE hf.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z][a-z0-9-]{1,63}$'),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 160),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- user_id is a stable ID from a trusted identity service, not login credentials.
CREATE TABLE hf.memberships (
  organization_id uuid NOT NULL REFERENCES hf.organizations(id),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','editor','reviewer','learner')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id,user_id)
);

CREATE TABLE hf.taxonomy_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES hf.organizations(id),
  taxonomy text NOT NULL CHECK (taxonomy IN ('country','territory','education-stage','qualification','occupation','competency','sector')),
  term_key text NOT NULL CHECK (char_length(term_key) BETWEEN 2 AND 160),
  labels jsonb NOT NULL CHECK (jsonb_typeof(labels)='object'),
  source_name text,
  source_url text,
  source_revision text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id,taxonomy,term_key)
);

CREATE TABLE hf.content_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES hf.organizations(id),
  slug text NOT NULL CHECK (slug ~ '^[a-z][a-z0-9-]{1,39}$'),
  title jsonb NOT NULL CHECK (jsonb_typeof(title)='object'),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  UNIQUE (organization_id,slug),
  UNIQUE (id,organization_id)
);

CREATE TABLE hf.content_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  pack_id uuid NOT NULL,
  major int NOT NULL CHECK (major>=0),
  minor int NOT NULL CHECK (minor>=0),
  patch int NOT NULL CHECK (patch>=0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in-review','approved','published','withdrawn')),
  content jsonb NOT NULL CHECK (jsonb_typeof(content)='object'),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(provenance)='object'),
  license_code text NOT NULL CHECK (license_code IN ('CC-BY-4.0','CC-BY-SA-4.0','CC0-1.0','PROPRIETARY','PERMISSION-REQUIRED')),
  author_id uuid NOT NULL,
  reviewer_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  content_sha256 text CHECK (content_sha256 IS NULL OR content_sha256 ~ '^[a-f0-9]{64}$'),
  FOREIGN KEY (pack_id,organization_id) REFERENCES hf.content_packs(id,organization_id),
  UNIQUE (pack_id,major,minor,patch),
  UNIQUE (id,organization_id),
  CHECK (status NOT IN ('approved','published','withdrawn') OR (reviewer_id IS NOT NULL AND reviewed_at IS NOT NULL AND reviewer_id <> author_id)),
  CHECK (status <> 'published' OR (published_at IS NOT NULL AND content_sha256 IS NOT NULL))
);

CREATE TABLE hf.editorial_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  release_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('created','edited','submitted','approved','rejected','published','withdrawn')),
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(checklist)='object'),
  detail text,
  happened_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (release_id,organization_id) REFERENCES hf.content_releases(id,organization_id)
);

-- Read model: one immutable snapshot per competency and per published release.
CREATE TABLE hf.competency_index (
  organization_id uuid NOT NULL,
  release_id uuid NOT NULL,
  competency_key text NOT NULL,
  title jsonb NOT NULL CHECK (jsonb_typeof(title)='object'),
  prerequisite_keys text[] NOT NULL DEFAULT '{}',
  source_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (release_id,competency_key),
  FOREIGN KEY (release_id,organization_id) REFERENCES hf.content_releases(id,organization_id)
);

-- Adult-only demonstration. Future minor access requires dedicated consent/safeguards.
-- A profile must not infer ability from age, employment or qualification labels.
CREATE TABLE hf.learner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES hf.organizations(id),
  subject_id uuid NOT NULL,
  consent_version text NOT NULL,
  consented_at timestamptz NOT NULL,
  adult_confirmed boolean NOT NULL CHECK (adult_confirmed=true),
  locale text NOT NULL CHECK (locale IN ('fr','en')),
  context jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(context)='object'),
  encrypted_preferences bytea,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id,subject_id),
  UNIQUE (id,organization_id)
);

CREATE TABLE hf.portfolio_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  competency_key text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('explored','practiced','review-later','evidence-reviewed')),
  evidence_source text NOT NULL CHECK (evidence_source IN ('self-declared','human-reviewed')),
  evidence_note_ciphertext bytea,
  pack_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (learner_id,organization_id) REFERENCES hf.learner_profiles(id,organization_id)
);

CREATE TABLE hf.consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('personalization','portfolio','data-export')),
  action text NOT NULL CHECK (action IN ('granted','revoked')),
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (learner_id,organization_id) REFERENCES hf.learner_profiles(id,organization_id)
);

CREATE INDEX ON hf.content_releases (organization_id,status,pack_id);
CREATE INDEX ON hf.editorial_events (organization_id,release_id,happened_at DESC);
CREATE INDEX ON hf.competency_index (organization_id,competency_key);
CREATE INDEX ON hf.portfolio_events (organization_id,learner_id,created_at DESC);
CREATE INDEX ON hf.consent_events (organization_id,learner_id,occurred_at DESC);
CREATE INDEX ON hf.learner_profiles (organization_id,subject_id) WHERE deleted_at IS NULL;

-- Protect release content after publication. Withdrawal changes status only,
-- never the content or provenance of the original released snapshot.
CREATE OR REPLACE FUNCTION hf.protect_release_snapshot() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN
   IF OLD.status IN ('published','withdrawn') THEN
      RAISE EXCEPTION 'Published releases must be withdrawn, not destroyed';
   END IF;
   RETURN OLD;
 END IF;
 IF OLD.status IN ('published','withdrawn') THEN
   IF NEW.content IS DISTINCT FROM OLD.content OR NEW.provenance IS DISTINCT FROM OLD.provenance OR
      NEW.license_code IS DISTINCT FROM OLD.license_code OR NEW.content_sha256 IS DISTINCT FROM OLD.content_sha256 OR
      NEW.major IS DISTINCT FROM OLD.major OR NEW.minor IS DISTINCT FROM OLD.minor OR NEW.patch IS DISTINCT FROM OLD.patch THEN
      RAISE EXCEPTION 'Published content is immutable; create a new version';
   END IF;
   IF NOT (OLD.status='published' AND NEW.status='withdrawn' OR OLD.status=NEW.status) THEN
      RAISE EXCEPTION 'Invalid published status transition';
   END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_release BEFORE UPDATE OR DELETE ON hf.content_releases
 FOR EACH ROW EXECUTE FUNCTION hf.protect_release_snapshot();

-- Runtime policies use a trusted backend that sets tenant_id ONLY AFTER verifying
-- authentication and membership. Custom session settings are not an auth boundary.
CREATE OR REPLACE FUNCTION hf.current_tenant() RETURNS uuid
LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('hf.tenant_id',true),'')::uuid $$;

ALTER TABLE hf.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.taxonomy_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.content_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.editorial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.competency_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.portfolio_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf.consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_organizations ON hf.organizations USING (id=hf.current_tenant()) WITH CHECK (id=hf.current_tenant());
CREATE POLICY tenant_memberships ON hf.memberships USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_taxonomy ON hf.taxonomy_terms USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_packs ON hf.content_packs USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_releases ON hf.content_releases USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_editorial ON hf.editorial_events USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_competency ON hf.competency_index USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_learners ON hf.learner_profiles USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_portfolio ON hf.portfolio_events USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());
CREATE POLICY tenant_consents ON hf.consent_events USING (organization_id=hf.current_tenant()) WITH CHECK (organization_id=hf.current_tenant());

-- Tenant RLS alone is not sufficient: the future authenticated service MUST additionally
-- enforce editor/reviewer/learner permissions, learner ownership and encryption key policy.
-- Do not GRANT any of these tables to a client-accessible/public/anonymous DB role.
COMMIT;