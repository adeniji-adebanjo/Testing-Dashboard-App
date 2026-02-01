-- Migration: Functional Modules and Templates Support (idempotent)
-- Date: 2026-02-01
-- Description: Adds support for customizable functional testing modules per project

-- 1. Create functional_modules table
CREATE TABLE IF NOT EXISTS public.functional_modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  module_type text NOT NULL DEFAULT 'functional', -- 'functional' or 'non-functional'
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  "order" integer DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (project_id, module_type, slug)
);

-- 2. Create functional_module_templates table for default test scenarios
CREATE TABLE IF NOT EXISTS public.functional_module_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id uuid REFERENCES public.functional_modules(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  test_case_id_prefix text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create default_test_scenarios table for storing default scenarios per module
CREATE TABLE IF NOT EXISTS public.default_test_scenarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid REFERENCES public.functional_module_templates(id) ON DELETE CASCADE NOT NULL,
  test_case_id text NOT NULL,
  scenario text NOT NULL,
  expected_result text NOT NULL,
  steps text,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create indexes for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index i ON i.indrelid = t.oid
    JOIN pg_class ix ON ix.oid = i.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname = 'functional_modules'
      AND ix.relname = 'idx_functional_modules_project_id'
  ) THEN
    CREATE INDEX idx_functional_modules_project_id ON public.functional_modules(project_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index i ON i.indrelid = t.oid
    JOIN pg_class ix ON ix.oid = i.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname = 'functional_module_templates'
      AND ix.relname = 'idx_functional_module_templates_project_id'
  ) THEN
    CREATE INDEX idx_functional_module_templates_project_id ON public.functional_module_templates(project_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index i ON i.indrelid = t.oid
    JOIN pg_class ix ON ix.oid = i.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname = 'default_test_scenarios'
      AND ix.relname = 'idx_default_test_scenarios_template_id'
  ) THEN
    CREATE INDEX idx_default_test_scenarios_template_id ON public.default_test_scenarios(template_id);
  END IF;
END;
$$;

-- 5. Enable RLS and add policies
ALTER TABLE public.functional_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_module_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.default_test_scenarios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename  = 'functional_modules'
      AND p.policyname = 'Allow public all access to functional_modules'
  ) THEN
    CREATE POLICY "Allow public all access to functional_modules"
      ON public.functional_modules
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename  = 'functional_module_templates'
      AND p.policyname = 'Allow public all access to functional_module_templates'
  ) THEN
    CREATE POLICY "Allow public all access to functional_module_templates"
      ON public.functional_module_templates
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename  = 'default_test_scenarios'
      AND p.policyname = 'Allow public all access to default_test_scenarios'
  ) THEN
    CREATE POLICY "Allow public all access to default_test_scenarios"
      ON public.default_test_scenarios
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

-- 6. Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'functional_modules'
      AND trigger_name = 'set_functional_modules_updated_at'
  ) THEN
    CREATE TRIGGER set_functional_modules_updated_at
      BEFORE UPDATE ON public.functional_modules
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'functional_module_templates'
      AND trigger_name = 'set_functional_module_templates_updated_at'
  ) THEN
    CREATE TRIGGER set_functional_module_templates_updated_at
      BEFORE UPDATE ON public.functional_module_templates
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'default_test_scenarios'
      AND trigger_name = 'set_default_test_scenarios_updated_at'
  ) THEN
    CREATE TRIGGER set_default_test_scenarios_updated_at
      BEFORE UPDATE ON public.default_test_scenarios
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;
