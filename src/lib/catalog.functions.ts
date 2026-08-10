import { createServerFn } from "@tanstack/react-start";
import type { Category, Product } from "@/data/catalog";
import { createPublicClient } from "./supabase-public.server";

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ categories: Category[]; products: Product[] }> => {
    const supabase = createPublicClient();
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
      // Storage objects are private; sign them server-side with the service role.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin.storage
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
  },
);
