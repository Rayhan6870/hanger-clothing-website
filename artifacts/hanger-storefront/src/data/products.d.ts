export type Product = {
  id: string;
  name: string;
  category: "Casual Full Shirts (Premium Fabrics)" | "Stripe Polo T-Shirts (China Fabrics)";
  fabric: string;
  price: number;
  sizes: string[];
  image: string;
};

export const products: Product[];
