-- Run AFTER schema.sql (Supabase SQL Editor -> Run). Safe to re-run.

-- 1. Subscription columns on businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_id text NOT NULL DEFAULT 'FREE_TRIAL';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_started_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS ai_replies_used integer NOT NULL DEFAULT 0;

-- Business owners must not edit their own plan/quota (only service role / super admin)
CREATE OR REPLACE FUNCTION public.protect_business_plan()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_super_admin() THEN
    NEW.plan_id := OLD.plan_id;
    NEW.plan_started_at := OLD.plan_started_at;
    NEW.plan_expires_at := OLD.plan_expires_at;
    NEW.ai_replies_used := OLD.ai_replies_used;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_protect_business_plan ON public.businesses;
CREATE TRIGGER trg_protect_business_plan BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.protect_business_plan();

-- 2. WhatsApp carts (one per customer per business)
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, contact_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS carts_all ON public.carts;
CREATE POLICY carts_all ON public.carts FOR ALL TO authenticated
USING (can_access_business(business_id)) WITH CHECK (can_access_business(business_id));

-- 3. Product photos must be publicly viewable (WhatsApp + dashboard previews)
UPDATE storage.buckets SET public = true WHERE id = 'product-images';
DROP POLICY IF EXISTS product_images_public_read ON storage.objects;
CREATE POLICY product_images_public_read ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

-- 4. Activate a plan after payment (run by you, the admin). Example:
-- UPDATE public.businesses
--   SET plan_id = 'GROWTH', plan_started_at = now(),
--       plan_expires_at = now() + interval '30 days', ai_replies_used = 0
-- WHERE name = 'Zetiora';
-- Durations: STARTER/BASIC = 7 days, LITE..ENTERPRISE = 30 days.
