export interface ProductVariant {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  sizes: string[];
  colors: string[];
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  numericPrice: number;
  originalPrice?: string;
  image: string;
  isLiked?: boolean;
  rating: number;
  reviewsCount: number;
  colors: string[];
  sizes: string[];
  limited?: boolean;
  category?: string;
  images?: string[];
  variants?: ProductVariant[];
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Aqua Grand 10Ltr Storage Ro+Uv+Uf+Minerals",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua Grand 10Ltr Storage Ro+Uv+Uf+Minerals domestic water purifier.",
    price: "₹10,000.00",
    originalPrice: "₹13,000.00",
    numericPrice: 10000,
    image: "/images/ro-1.jpg",
    images: ["/images/ro-1.jpg", "/images/ro-2.jpg"],
    isLiked: false,
    rating: 4.8,
    reviewsCount: 120,
    colors: ["#ffffff", "#0000ff"],
    sizes: ["10Ltr"],
    limited: false,
    category: "domestic-ro"
  },
  {
    id: "2",
    name: "Aqua Purosis 11Ltr Storage Ro+Uv+Uf+Minerals",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua Purosis 11Ltr Storage Ro+Uv+Uf+Minerals domestic water purifier.",
    price: "₹13,500.00",
    originalPrice: "₹17,000.00",
    numericPrice: 13500,
    image: "/images/ro-2.jpg",
    images: ["/images/ro-2.jpg", "/images/ro-3.jpg"],
    isLiked: false,
    rating: 4.7,
    reviewsCount: 95,
    colors: ["#d2691e"],
    sizes: ["11Ltr"],
    limited: false,
    category: "domestic-ro"
  },
  {
    id: "3",
    name: "Aqua XL 12Ltr Storage Ro+Uv+Uf+Minerals",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua XL 12Ltr Storage Ro+Uv+Uf+Minerals domestic water purifier.",
    price: "₹12,500.00",
    originalPrice: "₹15,500.00",
    numericPrice: 12500,
    image: "/images/ro-3.jpg",
    images: ["/images/ro-3.jpg", "/images/ro-1.jpg"],
    isLiked: true,
    rating: 4.9,
    reviewsCount: 160,
    colors: ["#0000ff"],
    sizes: ["12Ltr"],
    limited: false,
    category: "domestic-ro"
  },
  {
    id: "4",
    name: "Aqua Sonnet 11Ltr Storage Ro+Uv+Uf+Minerals",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua Sonnet 11Ltr Storage Ro+Uv+Uf+Minerals domestic water purifier.",
    price: "₹12,500.00",
    originalPrice: "₹15,500.00",
    numericPrice: 12500,
    image: "/images/ro-1.jpg",
    images: ["/images/ro-1.jpg", "/images/ro-3.jpg"],
    isLiked: false,
    rating: 4.8,
    reviewsCount: 140,
    colors: ["#000000"],
    sizes: ["11Ltr"],
    limited: true,
    category: "domestic-ro"
  },
  {
    id: "5",
    name: "Dolphin 9Ltr Storage Ro+Uv",
    subtitle: "Domestic RO Units",
    description: "Premium Dolphin 9Ltr Storage Ro+Uv domestic water purifier.",
    price: "₹7,000.00",
    originalPrice: "₹9,000.00",
    numericPrice: 7000,
    image: "/images/ro-2.jpg",
    images: ["/images/ro-2.jpg", "/images/ro-1.jpg"],
    isLiked: false,
    rating: 4.6,
    reviewsCount: 75,
    colors: ["#ffffff", "#0000ff"],
    sizes: ["9Ltr"],
    limited: false,
    category: "domestic-ro"
  },
  {
    id: "6",
    name: "Aqua Mars 9Ltr Storage Ro+Uv+Uf",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua Mars 9Ltr Storage Ro+Uv+Uf domestic water purifier.",
    price: "₹10,500.00",
    originalPrice: "₹13,500.00",
    numericPrice: 10500,
    image: "/images/ro-3.jpg",
    images: ["/images/ro-3.jpg", "/images/ro-2.jpg"],
    isLiked: false,
    rating: 4.9,
    reviewsCount: 88,
    colors: ["#000000"],
    sizes: ["9Ltr"],
    limited: true,
    category: "domestic-ro"
  },
  {
    id: "7",
    name: "Aqua Jade 10Ltr Storage RO+UV+UF",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua Jade 10Ltr Storage RO+UV+UF domestic water purifier.",
    price: "₹10,500.00",
    originalPrice: "₹13,500.00",
    numericPrice: 10500,
    image: "/images/ro-1.jpg",
    images: ["/images/ro-1.jpg", "/images/ro-2.jpg"],
    isLiked: false,
    rating: 4.5,
    reviewsCount: 64,
    colors: ["#2f4f4f"],
    sizes: ["10Ltr"],
    limited: false,
    category: "domestic-ro"
  },
  {
    id: "8",
    name: "Aqua Emerald 12Ltr Storage RO+UV+UF+Minerals",
    subtitle: "Domestic RO Units",
    description: "Premium Aqua Emerald 12Ltr Storage RO+UV+UF+Minerals domestic water purifier.",
    price: "₹12,500.00",
    originalPrice: "₹15,500.00",
    numericPrice: 12500,
    image: "/images/ro-2.jpg",
    images: ["/images/ro-2.jpg", "/images/ro-3.jpg"],
    isLiked: false,
    rating: 4.7,
    reviewsCount: 110,
    colors: ["#ffffff", "#8a2be2"],
    sizes: ["12Ltr"],
    limited: false,
    category: "domestic-ro"
  }
];
