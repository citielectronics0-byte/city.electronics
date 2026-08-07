export const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with City Electronics WhatsApp number

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  note: string;
};

export const categories = [
  { id: "cables", name: "Cables", blurb: "HDMI, USB-C, AUX, LAN, power leads" },
  { id: "connectors", name: "Connectors", blurb: "Jacks, adaptors, converters, lugs" },
  { id: "remotes", name: "Remotes", blurb: "TV, set-top box, AC and universal" },
  { id: "components", name: "Components", blurb: "Resistors, ICs, boards, soldering" },
  { id: "laptop", name: "Laptop Accessories", blurb: "Chargers, hubs, stands, keyboards" },
  { id: "mobile", name: "Mobile Accessories", blurb: "Chargers, covers, earphones, holders" },
];

export const products: Product[] = [
  { id: "p1", name: "HDMI 2.0 Cable — 1.5m", category: "cables", price: 299, note: "4K @ 60Hz, gold plated" },
  { id: "p2", name: "USB-C Fast Charging Cable", category: "cables", price: 199, note: "65W, braided, 1m" },
  { id: "p3", name: "CAT6 LAN Cable — 3m", category: "cables", price: 249, note: "Gigabit, moulded ends" },
  { id: "p4", name: "3.5mm AUX Cable", category: "cables", price: 99, note: "Copper core, 1m" },
  { id: "p5", name: "RCA to 3.5mm Connector", category: "connectors", price: 89, note: "Stereo audio adaptor" },
  { id: "p6", name: "HDMI Female Coupler", category: "connectors", price: 129, note: "Straight joiner" },
  { id: "p7", name: "USB OTG Adaptor", category: "connectors", price: 79, note: "Type-C to USB-A" },
  { id: "p8", name: "Universal TV Remote", category: "remotes", price: 249, note: "Works with most brands" },
  { id: "p9", name: "Set-Top Box Remote", category: "remotes", price: 199, note: "Tata Play / Airtel / DishTV" },
  { id: "p10", name: "Split AC Remote", category: "remotes", price: 279, note: "Universal, backlit keys" },
  { id: "p11", name: "Resistor Assortment Kit", category: "components", price: 149, note: "600 pcs, 1/4W" },
  { id: "p12", name: "Soldering Iron 25W", category: "components", price: 349, note: "With stand and wire" },
  { id: "p13", name: "Arduino-Compatible Uno Board", category: "components", price: 649, note: "With USB cable" },
  { id: "p14", name: "Laptop Adaptor 65W", category: "laptop", price: 999, note: "HP / Dell / Lenovo pins" },
  { id: "p15", name: "4-in-1 Type-C Hub", category: "laptop", price: 799, note: "HDMI, USB 3.0, SD" },
  { id: "p16", name: "Aluminium Laptop Stand", category: "laptop", price: 899, note: "Foldable, adjustable" },
  { id: "p17", name: "20W Mobile Charger", category: "mobile", price: 549, note: "PD fast charge" },
  { id: "p18", name: "Wired Earphones", category: "mobile", price: 249, note: "With mic, deep bass" },
  { id: "p19", name: "10000mAh Power Bank", category: "mobile", price: 1099, note: "Dual output, fast charge" },
  { id: "p20", name: "Bike Mobile Holder", category: "mobile", price: 349, note: "Shockproof clamp" },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
