DROP POLICY IF EXISTS businesses_select ON public.businesses;
CREATE POLICY businesses_select ON public.businesses
FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR can_access_business(id));