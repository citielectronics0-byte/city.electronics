DROP POLICY IF EXISTS "Product images are viewable" ON storage.objects;

CREATE POLICY "Admins view product images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO service_role;