import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/data/catalog";

// Runs in the browser so the storefront works on static hosting (GitHub Pages)
// as well as on the server-rendered preview.
export async function fetchCatalog(): Promise<{ categories: Category[]; products: Product[] }> {
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("id, name, blurb").order("sort_order"),
    supabase
      .from("products")
      .select("id, name, category_id, price, note, in_stock, image_url")
      .order("sort_order"),
  ]);
  if (categories.error) throw categories.error;
  if (products.error) throw products.error;

  const rows = products.data ?? [];
  const paths = rows.map((p) => p.image_url).filter((v): v is string => Boolean(v));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage
      .from("product-images")
      .createSignedUrls(paths, 60 * 60 * 24);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }

  return {
    categories: categories.data ?? [],
    products: rows.map((p) => ({
      ...p,
      image_url: p.image_url ? (signed.get(p.image_url) ?? null) : null,
    })),
  };
}

export const catalogQueryOptions = {
  queryKey: ["catalog"] as const,
  queryFn: fetchCatalog,
  staleTime: 60_000,
};
