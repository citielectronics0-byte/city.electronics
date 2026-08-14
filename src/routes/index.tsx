import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cable, Plug, Tv, CircuitBoard, Laptop, Smartphone, MessageCircle, MapPin, Clock, Phone, Minus, Plus, Lock, Truck, ImageOff, Search, X } from "lucide-react";
import heroImage from "@/assets/hero-electronics.jpg";
import { whatsappLink, WHATSAPP_NUMBER, deliveryZones, SHOP_LOCATION, type Category, type Product } from "@/data/catalog";
import { catalogQueryOptions } from "@/lib/catalog-client";

export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "City Electronics — Cables, Connectors & Accessories" },
      {
        name: "description",
        content:
          "City Electronics stocks cables, connectors, remotes, components, laptop and mobile accessories. Browse the catalogue and place your order on WhatsApp.",
      },
      { property: "og:title", content: "City Electronics — Cables, Connectors & Accessories" },
      {
        property: "og:description",
        content: "Genuine electronics accessories at fair prices. Order instantly on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <p>Could not load the catalogue right now. Please refresh the page.</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Page not found.</div>,
  component: Index,
});

const categoryIcons: Record<string, typeof Cable> = {
  cables: Cable,
  connectors: Plug,
  remotes: Tv,
  components: CircuitBoard,
  laptop: Laptop,
  mobile: Smartphone,
};

function Index() {
  const { data } = useQuery(catalogQueryOptions);
  const categories: Category[] = data?.categories ?? [];
  const products: Product[] = data?.products ?? [];
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const [cart, setCart] = useState<Record<string, number>>({});
  const [zoneId, setZoneId] = useState<string>(deliveryZones[0]!.id);
  const zone = deliveryZones.find((z) => z.id === zoneId)!;

  const visible = useMemo(() => {
    const byCategory = active === "all" ? products : products.filter((p) => p.category_id === active);
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return byCategory;
    const categoryName = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));
    return byCategory.filter((p) => {
      const haystack = [p.name, p.note ?? "", categoryName.get(p.category_id) ?? ""]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [active, products, categories, query]);

  const lines = Object.entries(cart).filter(([, qty]) => qty > 0);
  const total = lines.reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const orderMessage = () => {
    const body = lines
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id)!;
        return `• ${p.name} × ${qty} — ₹${p.price * qty}`;
      })
      .join("\n");
    return `Hello City Electronics, I would like to order:\n\n${body}\n\nEstimated total: ₹${total}\nDelivery to: ${zone.label} (${zone.eta})\n\nName:\nAddress / Pickup:`;
  };

  const setQty = (id: string, delta: number) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }));

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="surface-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-display text-2xl font-semibold tracking-wide">City Electronics</p>
            <p className="text-xs uppercase tracking-[0.28em] text-gold-soft">Since day one · Trusted parts</p>
          </div>
          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="inline-flex items-center gap-2 border border-gold/50 px-4 py-2 text-sm text-gold-soft transition-colors hover:bg-gold hover:text-primary"
          >
            <Phone className="size-4" /> Call the shop
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <img
          src={heroImage}
          alt="Cables, connectors, remotes and electronic components arranged on a dark surface"
          width={1600}
          height={1008}
          className="h-[420px] w-full object-cover md:h-[520px]"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-5">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Electronics & accessories</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-primary-foreground md:text-6xl">
            Everything that plugs, connects and powers.
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/80">
            Cables, connectors, remotes, components and accessories for laptops and mobiles — stocked,
            tested and priced fairly. Pick what you need and send the order on WhatsApp.
          </p>
          <div className="mt-8">
            <a
              href={whatsappLink("Hello City Electronics, I have a product enquiry.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp px-6 py-3 text-sm font-semibold uppercase tracking-widest text-whatsapp-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-4" /> Order on WhatsApp
            </a>
          </div>
          <div className="relative mt-6 w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products, cables, connectors, remotes..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) {
                  document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="w-full border border-border bg-card py-3 pl-11 pr-11 text-sm text-foreground outline-none focus:border-accent"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="rule-gold font-display text-3xl">What we stock</h2>
        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = categoryIcons[c.id] ?? Cable;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActive(c.id);
                  document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group bg-card p-7 text-left transition-colors hover:bg-secondary"
              >
                <Icon className="size-6 text-accent" />
                <h3 className="mt-4 font-display text-xl">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="border-y border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="rule-gold font-display text-3xl">Catalogue</h2>

          <div className="relative mt-8 w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label="Search the catalogue"
              placeholder="Search products, cables, connectors, remotes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-border bg-card py-3 pl-11 pr-11 text-sm text-foreground outline-none focus:border-accent"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[{ id: "all", name: "All items" }, ...categories].map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`border px-4 py-2 text-sm transition-colors ${
                  active === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-accent"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <article key={p.id} className="card-classic flex flex-col overflow-hidden">
                <div className="aspect-4/3 w-full border-b border-border bg-secondary">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <ImageOff className="size-7" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg leading-snug">{p.name}</h3>
                  <span
                    className={`shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                      p.in_stock
                        ? "border-accent/60 text-accent-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {p.in_stock ? "In stock" : "Out of stock"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
                <p className="mt-4 font-display text-2xl text-primary">₹{p.price}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  {p.in_stock ? (
                    <div className="flex items-center border border-border">
                      <button
                        aria-label={`Remove one ${p.name}`}
                        onClick={() => setQty(p.id, -1)}
                        className="px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{cart[p.id] ?? 0}</span>
                      <button
                        aria-label={`Add one ${p.name}`}
                        onClick={() => setQty(p.id, 1)}
                        className="px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Ask us when it arrives</span>
                  )}
                  <a
                    href={whatsappLink(`Hello City Electronics, is "${p.name}" (₹${p.price}) available?`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold uppercase tracking-widest text-accent-foreground underline decoration-accent underline-offset-4"
                  >
                    Enquire
                  </a>
                </div>
                </div>
              </article>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="card-classic mt-10 p-12 text-center">
              <Search className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-4 font-display text-2xl">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try searching for another product, category, or keyword.
              </p>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-6 border border-border px-5 py-2 text-xs uppercase tracking-widest hover:border-accent"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Delivery */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="rule-gold font-display text-3xl">Delivery time</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          We dispatch from {SHOP_LOCATION}. Choose where you are and we will show the usual delivery
          time — it travels with your WhatsApp order too.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-wrap gap-2">
            {deliveryZones.map((z) => (
              <button
                key={z.id}
                onClick={() => setZoneId(z.id)}
                className={`border px-4 py-2 text-sm transition-colors ${
                  zoneId === z.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-accent"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
          <div className="card-classic p-7">
            <Truck className="size-6 text-accent" />
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">{zone.label}</p>
            <p className="mt-2 font-display text-2xl text-primary">{zone.eta}</p>
            <p className="mt-3 text-sm text-muted-foreground">{zone.areas}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Orders confirmed before 5:00 pm are dispatched the same working day. Sundays and public
              holidays are not counted.
            </p>
          </div>
        </div>
      </section>


      {/* Visit */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <h2 className="rule-gold font-display text-3xl">Visit the shop</h2>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="size-5 shrink-0 text-accent" />
              <span>City Electronics, Main Market Road — shop address to be added.</span>
            </li>
            <li className="flex gap-3">
              <Clock className="size-5 shrink-0 text-accent" />
              <span>Monday to Saturday, 10:00 am – 8:30 pm. Sunday closed.</span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="size-5 shrink-0 text-accent" />
              <span>Orders and enquiries answered on WhatsApp through the day.</span>
            </li>
          </ul>
        </div>
        <div className="card-classic p-8">
          <h3 className="font-display text-xl">How ordering works</h3>
          <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">1.</span> Add the items you need from the catalogue.</li>
            <li><span className="font-semibold text-foreground">2.</span> Tap the WhatsApp bar — your list is filled in automatically.</li>
            <li><span className="font-semibold text-foreground">3.</span> We confirm stock, final price and delivery or pickup.</li>
          </ol>
        </div>
      </section>

      <footer className="surface-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm">
          <p className="font-display text-lg">City Electronics</p>
          <div className="flex items-center gap-5">
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-gold-soft">
              <Lock className="size-3.5" /> Shop login
            </Link>
            <p className="text-primary-foreground/60">© {new Date().getFullYear()} City Electronics. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky order bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="text-sm">
            <p className="font-semibold">
              {lines.length ? `${lines.length} item${lines.length > 1 ? "s" : ""} selected` : "No items selected yet"}
            </p>
            <p className="text-muted-foreground">Estimated total ₹{total}</p>
          </div>
          <a
            href={whatsappLink(
              lines.length ? orderMessage() : "Hello City Electronics, I have a product enquiry.",
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp px-5 py-3 text-sm font-semibold uppercase tracking-widest text-whatsapp-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-4" />
            {lines.length ? "Send order" : "Chat with us"}
          </a>
        </div>
      </div>
    </div>
  );
}
