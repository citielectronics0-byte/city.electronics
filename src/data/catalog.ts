export const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with City Electronics WhatsApp number

export type Category = { id: string; name: string; blurb: string };

export type Product = {
  id: string;
  name: string;
  category_id: string;
  price: number;
  note: string;
  in_stock: boolean;
};

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
