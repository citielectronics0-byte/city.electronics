REVOKE ALL ON public.categories FROM anon;
REVOKE ALL ON public.products FROM anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;