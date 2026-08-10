import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Plus, LogOut, ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/data/catalog";
import { claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Manage Catalogue — City Electronics" },
      { name: "description", content: "Add, edit and remove City Electronics products, photos, prices and stock status." },
      { property: "og:title", content: "Manage Catalogue — City Electronics" },
      { property: "og:description", content: "Internal catalogue manager for City Electronics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const emptyDraft = { name: "", category_id: "", price: "", note: "" };

function Admin() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  async function signPaths(paths: string[]) {
    if (!paths.length) return;
    const { data } = await supabase.storage.from("product-images").createSignedUrls(paths, 60 * 60);
    const next: Record<string, string> = {};
    for (const item of data ?? []) if (item.path && item.signedUrl) next[item.path] = item.signedUrl;
    setPreviews((p) => ({ ...p, ...next }));
  }

  async function load() {
    const [cats, prods] = await Promise.all([
      supabase.from("categories").select("id, name, blurb").order("sort_order"),
      supabase
        .from("products")
        .select("id, name, category_id, price, note, in_stock, image_url")
        .order("sort_order"),
    ]);
    setCategories(cats.data ?? []);
    setProducts(prods.data ?? []);
    setDraft((d) => ({ ...d, category_id: d.category_id || (cats.data?.[0]?.id ?? "") }));
    await signPaths((prods.data ?? []).map((p) => p.image_url).filter((v): v is string => Boolean(v)));
  }

  useEffect(() => {
    (async () => {
      await claimAdmin().catch(() => undefined);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: allowed } = await supabase.rpc("has_role", { _user_id: user.user.id, _role: "admin" });
      setIsAdmin(Boolean(allowed));
      if (allowed) await load();
    })();
  }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.from("products").insert({
      name: draft.name.trim(),
      category_id: draft.category_id,
      price: Number(draft.price) || 0,
      note: draft.note.trim(),
      sort_order: products.length + 1,
    });
    if (error) return setError(error.message);
    setDraft({ ...emptyDraft, category_id: draft.category_id });
    await load();
  }

  async function patch(id: string, patchValues: Partial<Product>) {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patchValues } : p)));
    const { error } = await supabase.from("products").update(patchValues).eq("id", id);
    if (error) setError(error.message);
  }

  async function uploadImage(product: Product, file: File) {
    setError(null);
    setUploading(product.id);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${product.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    setUploading(null);
    if (upErr) return setError(upErr.message);
    if (product.image_url) await supabase.storage.from("product-images").remove([product.image_url]);
    await patch(product.id, { image_url: path });
    await signPaths([path]);
  }

  async function removeImage(product: Product) {
    if (!product.image_url) return;
    await supabase.storage.from("product-images").remove([product.image_url]);
    await patch(product.id, { image_url: null });
  }

  async function remove(id: string) {
    const target = products.find((p) => p.id === id);
    if (target?.image_url) await supabase.storage.from("product-images").remove([target.image_url]);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return setError(error.message);
    setProducts((ps) => ps.filter((p) => p.id !== id));
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === false) {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <p className="font-display text-2xl">This account is not a shop admin.</p>
          <button onClick={signOut} className="mt-6 border border-border px-5 py-2 text-sm uppercase tracking-widest">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="font-display text-2xl">Catalogue manager</p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="inline-flex items-center gap-2 text-gold-soft"><ArrowLeft className="size-4" /> Shop</Link>
            <button onClick={signOut} className="inline-flex items-center gap-2 border border-gold/50 px-4 py-2 text-gold-soft">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12">
        {error && <p className="mb-6 border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}

        <section className="card-classic p-6">
          <h2 className="font-display text-xl">Add a new item</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add the item first, then upload its photo from the list below.</p>
          <form onSubmit={addProduct} className="mt-5 grid gap-3 md:grid-cols-5">
            <input
              required
              placeholder="Product name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="border border-border bg-card px-3 py-2 text-sm md:col-span-2"
            />
            <select
              value={draft.category_id}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
              className="border border-border bg-card px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              required
              type="number"
              min={0}
              placeholder="Price ₹"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              className="border border-border bg-card px-3 py-2 text-sm"
            />
            <input
              placeholder="Short note"
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              className="border border-border bg-card px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground md:col-span-5"
            >
              <Plus className="size-4" /> Add item
            </button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="rule-gold font-display text-2xl">Items ({products.length})</h2>
          <div className="mt-6 space-y-3">
            {products.map((p) => (
              <div key={p.id} className="card-classic grid gap-3 p-4 md:grid-cols-[96px_2fr_1fr_100px_2fr_auto_auto] md:items-center">
                <div className="space-y-2">
                  <div className="grid h-20 w-20 place-items-center overflow-hidden border border-border bg-secondary">
                    {uploading === p.id ? (
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    ) : p.image_url && previews[p.image_url] ? (
                      <img src={previews[p.image_url]} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <label className="block cursor-pointer text-[10px] uppercase tracking-widest text-accent-foreground underline decoration-accent underline-offset-4">
                    {p.image_url ? "Replace" : "Add photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(p, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {p.image_url && (
                    <button onClick={() => removeImage(p)} className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Remove photo
                    </button>
                  )}
                </div>
                <input
                  value={p.name}
                  onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                  onBlur={(e) => patch(p.id, { name: e.target.value })}
                  className="border border-border bg-card px-3 py-2 text-sm"
                />
                <select
                  value={p.category_id}
                  onChange={(e) => patch(p.id, { category_id: e.target.value })}
                  className="border border-border bg-card px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={p.price}
                  onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, price: Number(e.target.value) } : x)))}
                  onBlur={(e) => patch(p.id, { price: Number(e.target.value) || 0 })}
                  className="border border-border bg-card px-3 py-2 text-sm"
                />
                <input
                  value={p.note}
                  onChange={(e) => setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, note: e.target.value } : x)))}
                  onBlur={(e) => patch(p.id, { note: e.target.value })}
                  className="border border-border bg-card px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
                  <input
                    type="checkbox"
                    checked={p.in_stock}
                    onChange={(e) => patch(p.id, { in_stock: e.target.checked })}
                  />
                  In stock
                </label>
                <button
                  aria-label={`Delete ${p.name}`}
                  onClick={() => remove(p.id)}
                  className="justify-self-start p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
