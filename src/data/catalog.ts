export const WHATSAPP_NUMBER = "919946249664"; // TODO: replace with City Electronics WhatsApp number

export const SHOP_LOCATION = "Ernakulam, Kerala";

export type Category = { id: string; name: string; blurb: string };

export type Product = {
  id: string;
  name: string;
  category_id: string;
  price: number;
  note: string;
  in_stock: boolean;
  image_url: string | null;
};

export type DeliveryZone = { id: string; label: string; areas: string; eta: string };

export const deliveryZones: DeliveryZone[] = [
  {
    id: "city",
    label: "Ernakulam city",
    areas: "Kaloor, Palarivattom, Edappally, Vyttila, Kadavanthra, Fort Kochi",
    eta: "Same day — usually within 2 to 4 hours",
  },
  {
    id: "district",
    label: "Ernakulam district",
    areas: "Aluva, Perumbavoor, Angamaly, Muvattupuzha, Tripunithura, Cherai",
    eta: "Next day delivery",
  },
  {
    id: "kerala",
    label: "Elsewhere in Kerala",
    areas: "Thrissur, Kottayam, Alappuzha, Kozhikode, Trivandrum and other districts",
    eta: "2 to 3 working days by courier",
  },
  {
    id: "india",
    label: "Rest of India",
    areas: "All other states, shipped by registered courier",
    eta: "4 to 7 working days",
  },
  {
    id: "pickup",
    label: "Pickup from the shop",
    areas: "Collect directly at City Electronics, Ernakulam",
    eta: "Ready in about 30 minutes during shop hours",
  },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
