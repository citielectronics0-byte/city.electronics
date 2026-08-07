import { createServerFn } from "@tanstack/react-start";
import { createPublicClient } from "./supabase-public.server";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("id, name, blurb").order("sort_order"),
    supabase
      .from("products")
      .select("id, name, category_id, price, note, in_stock")
      .order("sort_order"),
  ]);
  if (categories.error) throw categories.error;
  if (products.error) throw products.error;
  return { categories: categories.data ?? [], products: products.data ?? [] };
});
