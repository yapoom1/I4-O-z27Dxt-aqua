import { Product, PRODUCTS } from "@/data/products";
const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || "https://aquacare.udayamarketing.in/graphql/";
const DEFAULT_CHANNEL = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || "india_channel";
const SALEOR_BACKEND_BASE = API_URL.replace(/\/graphql\/?$/, "");

const LOCAL_FALLBACK_IMAGES = [
  "/images/ro-1.jpg",
  "/images/ro-2.jpg",
  "/images/ro-3.jpg",
];

const BEAUTIFUL_COLORS = [
  "#e5a63c", // honey amber
  "#5d3c26", // deep brown
  "#4a2f1b", // dark wood
  "#c5cdd8", // ribbon fish silver
  "#3d2719", // masi dark
  "#9d9284", // slate grey
  "#7d8c99", // ocean blue
  "#99b350", // gooseberry green
];

// Rewrites Saleor media URLs — ensures all product images use the aquacare backend host
export function rewriteSaleorMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  let cleanUrl = url;
  if (cleanUrl.startsWith("http://example.com")) {
    cleanUrl = cleanUrl.replace("http://example.com", SALEOR_BACKEND_BASE);
  }
  // Ensure all media paths point directly to aquacare
  cleanUrl = cleanUrl.replace(/^https?:\/\/[^\/]+\/media\//, `${SALEOR_BACKEND_BASE}/media/`);

  return cleanUrl;
}

// Cached staff token for background metadata updates
let cachedStaffToken: string | null = null;
let tokenExpiresAt = 0;

async function getStaffToken(): Promise<string | null> {
  if (cachedStaffToken && Date.now() < tokenExpiresAt) {
    return cachedStaffToken;
  }
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation { tokenCreate(email: "aquacare@gmail.com", password: "1234567890") { token errors { message } } }`,
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const token = json.data?.tokenCreate?.token;
    if (token) {
      cachedStaffToken = token;
      tokenExpiresAt = Date.now() + 1000 * 60 * 60 * 12; // 12 hrs
      return token;
    }
  } catch (err) {
    console.error("Failed to get staff token:", err);
  }
  return null;
}

// Increments product view count in Saleor metadata
export async function incrementProductViews(productId: string): Promise<number> {
  const decodedId = decodeURIComponent(productId);
  try {
    const token = await getStaffToken();
    if (!token) return 0;

    const getQuery = `
      query GetViews($id: ID!) {
        product(id: $id, channel: "${DEFAULT_CHANNEL}") {
          metadata {
            key
            value
          }
        }
      }
    `;
    const getRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: getQuery, variables: { id: decodedId } }),
      cache: "no-store",
    });
    const getJson = await getRes.json();
    const metaList = getJson.data?.product?.metadata || [];
    const viewsEntry = metaList.find((m: any) => m.key === "views");
    const currentViews = viewsEntry ? parseInt(viewsEntry.value, 10) : 150;
    const newViews = isNaN(currentViews) ? 151 : currentViews + 1;

    console.log(`[incrementProductViews] decodedId: ${decodedId}, currentViews: ${currentViews}, newViews: ${newViews}`);

    const mutQuery = `
      mutation UpdateViews($id: ID!, $input: [MetadataInput!]!) {
        updateMetadata(id: $id, input: $input) {
          item {
            metadata {
              key
              value
            }
          }
          errors {
            field
            message
          }
        }
      }
    `;
    const mutRes = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: mutQuery,
        variables: {
          id: decodedId,
          input: [{ key: "views", value: String(newViews) }],
        },
      }),
      cache: "no-store",
    });
    const mutJson = await mutRes.json();
    if (mutJson.errors || mutJson.data?.updateMetadata?.errors?.length) {
      console.error("[incrementProductViews] mutation errors:", mutJson.errors || mutJson.data?.updateMetadata?.errors);
    } else {
      console.log(`[incrementProductViews] Success! New views: ${newViews}`);
    }

    return newViews;
  } catch (e) {
    console.error("Error in incrementProductViews:", e);
    return 0;
  }
}

// Returns the rupee symbol for all currencies (Indian store)
function getCurrencySymbol(currency: string): string {
  if (currency === "INR" || currency === "USD") return "\u20b9"; // ₹
  return `${currency} `;
}

// Simple helper to hash a string to a positive integer
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Parses Saleor's Editor.js JSON description to plain text
function parseSaleorDescription(descriptionJson: string | null | undefined): string {
  if (!descriptionJson) return "";
  try {
    const data = JSON.parse(descriptionJson);
    if (data && data.blocks && Array.isArray(data.blocks)) {
      return data.blocks
        .map((block: any) => block.data?.text || "")
        .join(" ")
        .replace(/<[^>]*>/g, ""); // Strip any HTML tags
    }
  } catch (e) {
    // Return as-is if it's not a JSON string
  }
  return descriptionJson;
}

export interface SaleorProductNode {
  id: string;
  name: string;
  description?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  pricing?: {
    onSale?: boolean | null;
    discount?: {
      gross?: {
        amount: number;
        currency: string;
      } | null;
    } | null;
    priceRange?: {
      start?: {
        gross?: {
          amount: number;
          currency: string;
        } | null;
      } | null;
    } | null;
    priceRangeUndiscounted?: {
      start?: {
        gross?: {
          amount: number;
          currency: string;
        } | null;
      } | null;
    } | null;
  } | null;
  thumbnail?: {
    url: string;
    alt?: string | null;
  } | null;
  media?: Array<{
    url: string;
    alt?: string | null;
  }> | null;
  attributes?: Array<{
    attribute: {
      id?: string;
      name: string;
      slug: string;
    };
    values: Array<{
      name: string;
      value?: string;
    }>;
  }> | null;
  metadata?: Array<{
    key: string;
    value: string;
  }> | null;
  variants?: Array<{
    id: string;
    name: string;
    pricing?: {
      price?: {
        gross?: {
          amount: number;
          currency: string;
        } | null;
      } | null;
    } | null;
    media?: Array<{
      url: string;
      alt?: string | null;
    }> | null;
    attributes: Array<{
      attribute: {
        name: string;
      };
      values: Array<{
        name: string;
      }>;
    }>;
  }> | null;
}

// Maps a Saleor GraphQL product node to the frontend Product UI interface
export function mapSaleorProductToProduct(node: SaleorProductNode): Product {
  const id = node.id;
  const hash = hashString(id);

  // Parse Description
  const description = parseSaleorDescription(node.description) || `Premium quality ${node.name} sourced from our select vendors.`;

  // Parse Pricing
  const priceAmount =
    node.pricing?.priceRange?.start?.gross?.amount ??
    node.variants?.[0]?.pricing?.price?.gross?.amount ??
    0;
  const currency = node.pricing?.priceRange?.start?.gross?.currency ?? "INR";
  const currencySymbol = getCurrencySymbol(currency);
  const price = `${currencySymbol}${priceAmount.toFixed(0)}`;
  const numericPrice = priceAmount;

  // Resolve Image: rewrite placeholder URLs, check thumbnail first, then media array
  const fallbackImage = LOCAL_FALLBACK_IMAGES[hash % LOCAL_FALLBACK_IMAGES.length];
  const thumbnailImage = rewriteSaleorMediaUrl(node.thumbnail?.url);
  const mediaImage = node.media && node.media.length > 0 ? rewriteSaleorMediaUrl(node.media[0].url) : undefined;
  const image = thumbnailImage || mediaImage || fallbackImage;

  // Collect ALL images from product node and variants
  const images: string[] = [];
  if (thumbnailImage) images.push(thumbnailImage);
  if (node.media) {
    node.media.forEach(m => {
      const rewritten = rewriteSaleorMediaUrl(m.url);
      if (rewritten && !images.includes(rewritten)) {
        images.push(rewritten);
      }
    });
  }
  if (node.variants) {
    node.variants.forEach(v => {
      if (v.media) {
        v.media.forEach(m => {
          const rewritten = rewriteSaleorMediaUrl(m.url);
          if (rewritten && !images.includes(rewritten)) {
            images.push(rewritten);
          }
        });
      }
    });
  }

  // Resolve Subtitle
  const subtitle = node.category?.name 
    ? `Premium ${node.category.name.toLowerCase()}` 
    : "High Quality Product";

  // Deterministic Rating and Reviews
  const rating = parseFloat((4.5 + (hash % 5) * 0.1).toFixed(1));
  const reviewsCount = 20 + (hash % 180);

  // Resolve Colors (from variant attributes or fallback)
  const colors: string[] = [];
  if (node.variants && node.variants.length > 0) {
    node.variants.forEach(variant => {
      variant.attributes.forEach(attr => {
        if (attr.attribute.name.toLowerCase().includes("color")) {
          attr.values.forEach(val => {
            if (val.name && !colors.includes(val.name)) {
              colors.push(val.name);
            }
          });
        }
      });
    });
  }
  if (colors.length === 0) {
    // Pick 1 or 2 deterministic beautiful colors
    const colorIndex1 = hash % BEAUTIFUL_COLORS.length;
    const colorIndex2 = (hash + 3) % BEAUTIFUL_COLORS.length;
    colors.push(BEAUTIFUL_COLORS[colorIndex1]);
    if (hash % 2 === 0 && colorIndex1 !== colorIndex2) {
      colors.push(BEAUTIFUL_COLORS[colorIndex2]);
    }
  }

  // Resolve Sizes (from variant attributes/names or fallback)
  const sizes: string[] = [];
  if (node.variants && node.variants.length > 0) {
    node.variants.forEach(variant => {
      // Look for Size attributes
      let foundSizeAttr = false;
      variant.attributes.forEach(attr => {
        const name = attr.attribute.name.toLowerCase();
        if (name.includes("size") || name.includes("weight") || name.includes("dimension") || name.includes("medium")) {
          attr.values.forEach(val => {
            if (val.name && !sizes.includes(val.name)) {
              sizes.push(val.name);
            }
          });
          foundSizeAttr = true;
        }
      });
      // Fallback to variant name if no size attribute was explicitly tagged
      if (!foundSizeAttr && variant.name && variant.name !== node.name && !sizes.includes(variant.name)) {
        sizes.push(variant.name);
      }
    });
  }
  if (sizes.length === 0) {
    // Fallback to weight options based on category or default
    const isTraditionalOrHoney = node.category?.slug.includes("honey") || node.category?.slug.includes("traditional");
    sizes.push(...(isTraditionalOrHoney ? ["250g", "500g", "1kg"] : ["Standard"]));
  }

  // Map variants to UI list of variant objects
  const variants = (node.variants || []).map(v => {
    const vPriceAmount = v.pricing?.price?.gross?.amount ?? priceAmount;
    const vCurrency = v.pricing?.price?.gross?.currency ?? currency;
    const vCurrencySymbol = getCurrencySymbol(vCurrency);

    // Check variant specific media, rewrite placeholder URLs, fallback to parent image
    const vMediaUrl = v.media && v.media.length > 0 ? rewriteSaleorMediaUrl(v.media[0].url) : undefined;
    const vImage = vMediaUrl || image;

    // Collect sizes and colors specific to this variant
    const vSizes: string[] = [];
    const vColors: string[] = [];
    v.attributes.forEach(attr => {
      const attrName = attr.attribute.name.toLowerCase();
      if (attrName.includes("size") || attrName.includes("weight") || attrName.includes("dimension") || attrName.includes("medium")) {
        attr.values.forEach(val => {
          if (val.name && !vSizes.includes(val.name)) vSizes.push(val.name);
        });
      }
      if (attrName.includes("color")) {
        attr.values.forEach(val => {
          if (val.name && !vColors.includes(val.name)) vColors.push(val.name);
        });
      }
    });

    if (vSizes.length === 0 && v.name !== node.name) {
      vSizes.push(v.name);
    }

    return {
      id: v.id,
      name: v.name,
      price: `${vCurrencySymbol}${vPriceAmount.toFixed(0)}`,
      numericPrice: vPriceAmount,
      sizes: vSizes,
      colors: vColors,
      image: vImage,
    };
  });

  // Parse MRP from attributes or metadata
  let mrpAmount: number | null = null;
  if (node.attributes) {
    const mrpAttr = node.attributes.find(
      (a) => a.attribute.slug?.toLowerCase() === "mrp" || a.attribute.name?.toLowerCase() === "mrp"
    );
    if (mrpAttr && mrpAttr.values && mrpAttr.values.length > 0) {
      const valStr = (mrpAttr.values[0].value || mrpAttr.values[0].name || "").replace(/[^\d.]/g, "");
      const parsed = parseFloat(valStr);
      if (!isNaN(parsed) && parsed > 0) {
        mrpAmount = parsed;
      }
    }
  }
  if (!mrpAmount && node.metadata) {
    const mrpMeta = node.metadata.find((m) => m.key.toLowerCase() === "mrp");
    if (mrpMeta) {
      const parsed = parseFloat(mrpMeta.value.replace(/[^\d.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) mrpAmount = parsed;
    }
  }

  // Parse Views from metadata
  let viewsCount = 150 + (hash % 700);
  if (node.metadata) {
    const viewsMeta = node.metadata.find((m) => m.key.toLowerCase() === "views");
    if (viewsMeta) {
      const parsedViews = parseInt(viewsMeta.value, 10);
      if (!isNaN(parsedViews)) viewsCount = parsedViews;
    }
  }

  let originalPrice: string | undefined = undefined;
  let discountPercent: number | undefined = undefined;
  if (mrpAmount && mrpAmount > priceAmount) {
    originalPrice = `${currencySymbol}${mrpAmount.toLocaleString("en-IN")}`;
    discountPercent = Math.round(((mrpAmount - priceAmount) / mrpAmount) * 100);
  } else if (priceAmount > 0) {
    const fallbackMrp = Math.round((priceAmount * 1.22) / 100) * 100;
    originalPrice = `${currencySymbol}${fallbackMrp.toLocaleString("en-IN")}`;
    discountPercent = Math.round(((fallbackMrp - priceAmount) / fallbackMrp) * 100);
  }

  // Limited state
  const limited = (hash % 4 === 0) || (numericPrice > 80);

  // Category slug representation
  const category = node.category?.slug || "traditional";

  return {
    id,
    name: node.name,
    subtitle,
    description,
    price,
    numericPrice,
    originalPrice,
    mrp: originalPrice,
    discountPercent,
    views: viewsCount,
    image,
    rating,
    reviewsCount,
    colors,
    sizes,
    limited,
    category,
    images,
    variants,
    isLiked: hash % 7 === 0, // Randomly like a few products for visual flavor
  };
}

// Executes a GraphQL query against the Saleor backend
export async function fetchSaleorGraphQL(query: string, variables: Record<string, any> = {}, token?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `JWT ${token}`;
    }
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      next: token ? { revalidate: 0 } : { revalidate: 60 },
    });

    const json = await response.json();
    if (json.errors) {
      console.warn("Saleor GraphQL Errors:", json.errors);
      return null;
    }
    return json.data;
  } catch (error) {
    console.error("Failed to fetch from Saleor:", error);
    return null;
  }
}

// Fetches list of products from the live Saleor GraphQL backend
export async function getProducts(first = 24): Promise<Product[]> {
  const query = `
    query GetProducts($first: Int!, $channel: String!) {
      products(first: $first, channel: $channel) {
        edges {
          node {
            id
            name
            description
            slug
            category {
              id
              name
              slug
            }
            metadata {
              key
              value
            }
            attributes {
              attribute {
                name
                slug
              }
              values {
                name
                value
              }
            }
            pricing {
              priceRange {
                start {
                  gross {
                    amount
                    currency
                  }
                }
              }
            }
            thumbnail {
              url
              alt
            }
            media {
              url
              alt
            }
            variants {
              id
              name
              pricing {
                price {
                  gross {
                    amount
                    currency
                  }
                }
              }
              media {
                url
                alt
              }
              attributes {
                attribute {
                  name
                }
                values {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(query, { first, channel: DEFAULT_CHANNEL });
  if (!data || !data.products || !data.products.edges || data.products.edges.length === 0) {
    // Fallback to local catalog if backend has 0 products or is unreachable
    console.warn("Saleor products empty or unavailable, using local fallback.");
    return PRODUCTS.slice(0, first);
  }

  const nodes: SaleorProductNode[] = data.products.edges.map((e: any) => e.node);
  return deduplicateProducts(nodes.map(mapSaleorProductToProduct));
}

export function deduplicateProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  const unique: Product[] = [];
  for (const p of products) {
    const key = p.name.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique;
}

// Fetches products belonging to a specific collection (e.g. "featured_products")
export async function getCollectionProducts(
  collectionSlug = "featured_products",
  first = 12
): Promise<Product[]> {
  const query = `
    query GetCollectionProducts($slug: String!, $channel: String!, $first: Int!) {
      collection(slug: $slug, channel: $channel) {
        id
        name
        slug
        products(first: $first) {
          edges {
            node {
              id
              name
              description
              slug
              category {
                id
                name
                slug
              }
              metadata {
                key
                value
              }
              attributes {
                attribute {
                  name
                  slug
                }
                values {
                  name
                  value
                }
              }
              pricing {
                priceRange {
                  start {
                    gross {
                      amount
                      currency
                    }
                  }
                }
              }
              thumbnail {
                url
                alt
              }
              media {
                url
                alt
              }
              variants {
                id
                name
                pricing {
                  price {
                    gross {
                      amount
                      currency
                    }
                  }
                }
                media {
                  url
                  alt
                }
                attributes {
                  attribute {
                    name
                  }
                  values {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  // Check candidate collection slugs
  const candidates = [
    collectionSlug,
    "featured_products",
    "feature_products",
    "feature_prducts",
    "featured-products",
  ];
  const tried = new Set<string>();

  for (const slug of candidates) {
    if (tried.has(slug)) continue;
    tried.add(slug);

    const data = await fetchSaleorGraphQL(query, { slug, channel: DEFAULT_CHANNEL, first });
    if (data?.collection?.products?.edges && data.collection.products.edges.length > 0) {
      const nodes: SaleorProductNode[] = data.collection.products.edges.map((e: any) => e.node);
      return deduplicateProducts(nodes.map(mapSaleorProductToProduct));
    }
  }

  console.warn(`Collection "${collectionSlug}" empty or not found in channel ${DEFAULT_CHANNEL}`);
  return [];
}

// Fetches a single product by Saleor product ID from the live backend
export async function getProductById(id: string): Promise<Product | null> {
  const decodedId = decodeURIComponent(id);

  const query = `
    query GetProduct($id: ID!, $channel: String!) {
      product(id: $id, channel: $channel) {
        id
        name
        description
        slug
        category {
          id
          name
          slug
        }
        metadata {
          key
          value
        }
        attributes {
          attribute {
            name
            slug
          }
          values {
            name
            value
          }
        }
        pricing {
          priceRange {
            start {
              gross {
                amount
                currency
              }
            }
          }
        }
        thumbnail {
          url
          alt
        }
        media {
          url
          alt
        }
        variants {
          id
          name
          pricing {
            price {
              gross {
                amount
                currency
              }
            }
          }
          media {
            url
            alt
          }
          attributes {
            attribute {
              name
            }
            values {
              name
            }
          }
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(query, { id: decodedId, channel: DEFAULT_CHANNEL });
  if (data?.product) {
    return mapSaleorProductToProduct(data.product as SaleorProductNode);
  }

  // Fallback: try local mock data
  const found = PRODUCTS.find((p) => p.id === decodedId || p.id === id);
  return found || null;
}

const EMOJI_MAP: Record<string, string> = {
  accessories: "👜",
  audiobooks: "🎧",
  apparel: "👕",
  sneakers: "👟",
  sweatshirts: "🧥",
  headware: "🧢",
  beanies: "🧦",
  scarfs: "🧣",
  sunglasses: "🕶️",
  shirts: "👔",
  "t-shirts": "👕",
  "polo-shirts": "👕",
  homewares: "🏠",
  groceries: "🍎",
  juices: "🥤",
  "gift-cards": "🎁",
  "default-category": "📦",
};

export interface SaleorCategory {
  id: string;
  name: string;
  slug: string;
  emoji: string;
}

export async function getCategories(first = 24): Promise<SaleorCategory[]> {
  const query = `
    query GetCategories($first: Int!) {
      categories(first: $first) {
        edges {
          node {
            id
            name
            slug
          }
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(query, { first });
  if (!data || !data.categories || !data.categories.edges) {
    // Fallback to a single default category
    return [{ id: "cat-1", name: "All Products", slug: "default-category", emoji: "💧" }];
  }

  return data.categories.edges.map((e: any) => {
    const node = e.node;
    const emoji = EMOJI_MAP[node.slug] || EMOJI_MAP["default-category"] || "📦";
    return {
      id: node.id,
      name: node.name,
      slug: node.slug,
      emoji,
    };
  });
}

export async function requestOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  const mutation = `
    mutation RequestOtp($phone: String!) {
      otpRequest(phone: $phone) {
        success
        accountErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { phone });
  if (!data || !data.otpRequest) {
    return { success: false, error: "Failed to request OTP" };
  }

  const errors = data.otpRequest.accountErrors;
  if (errors && errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

  return { success: data.otpRequest.success };
}

export async function confirmOtp(phone: string, otp: string): Promise<{ success: boolean; user?: any; token?: string; refreshToken?: string; error?: string }> {
  const mutation = `
    mutation ConfirmOtp($phone: String!, $otp: String!) {
      otpConfirm(phone: $phone, otp: $otp) {
        token
        refreshToken
        csrfToken
        user {
          id
          email
        }
        accountErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { phone, otp });
  if (!data || !data.otpConfirm) {
    return { success: false, error: "Failed to verify OTP" };
  }

  const errors = data.otpConfirm.accountErrors;
  if (errors && errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

  return {
    success: true,
    user: data.otpConfirm.user,
    token: data.otpConfirm.token,
    refreshToken: data.otpConfirm.refreshToken,
  };
}

export async function getUserProfile(token: string) {
  const query = `
    query GetUserProfile {
      me {
        id
        email
        firstName
        lastName
        avatar {
          url
        }
        metadata {
          key
          value
        }
        orders(first: 100) {
          totalCount
        }
        addresses {
          id
          firstName
          lastName
          streetAddress1
          streetAddress2
          city
          postalCode
          phone
          isDefaultShippingAddress
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(query, {}, token);
  if (!data || !data.me) {
    return null;
  }

  const me = data.me;
  const name = [me.firstName, me.lastName].filter(Boolean).join(" ") || "Saleor User";
  
  // Extract custom email & phone number from metadata
  const customEmail = me.metadata?.find((m: any) => m.key === "custom_email" || m.key === "email")?.value;
  const phoneMeta = me.metadata?.find((m: any) => m.key === "phone" || m.key === "mobile_number");
  const phone = phoneMeta ? phoneMeta.value : (me.email.includes("@otp.localhost") ? me.email.split("@")[0] : "");
  const email = customEmail || (me.email.includes("@otp.") ? "" : me.email);

  return {
    id: me.id,
    name,
    email,
    phone,
    avatar: me.avatar?.url || "/images/profile.png",
    ordersCount: me.orders?.totalCount || 0,
    addresses: me.addresses || []
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const mutation = `
    mutation TokenRefresh($refreshToken: String!) {
      tokenRefresh(refreshToken: $refreshToken) {
        token
        errors {
          field
          message
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { refreshToken });
  if (!data || !data.tokenRefresh) {
    return { success: false, error: "Failed to refresh token" };
  }

  const errors = data.tokenRefresh.errors;
  if (errors && errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

  return {
    success: true,
    token: data.tokenRefresh.token
  };
}

export async function createAddress(token: string, addressData: any) {
  const mutation = `
    mutation AccountAddressCreate($input: AddressInput!, $type: AddressTypeEnum) {
      accountAddressCreate(input: $input, type: $type) {
        address {
          id
          firstName
          lastName
          companyName
          streetAddress1
          streetAddress2
          city
          cityArea
          postalCode
          phone
          countryArea
          isDefaultShippingAddress
        }
        accountErrors {
          field
          message
          code
        }
      }
    }
  `;

  let countryCode = (addressData.country || "IN").trim().toUpperCase();
  if (countryCode === "UK" || countryCode === "UNITED KINGDOM" || countryCode === "ENGLAND") {
    countryCode = "GB";
  } else if (countryCode === "USA" || countryCode === "UNITED STATES") {
    countryCode = "US";
  } else {
    countryCode = countryCode.substring(0, 2) || "IN";
  }

  // Attempt to parse postal code, city, and state (countryArea) from input fields
  let postalCode = addressData.postalCode;
  let city = addressData.city;
  let countryArea = addressData.state;

  // Fallback to legacy parsing if fields are not present
  if (!city || !postalCode) {
    const cityStateStr = addressData.cityState || "";
    if (countryCode === "GB") {
      const ukPostcodeRegex = /([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2})/i;
      const match = cityStateStr.match(ukPostcodeRegex);
      postalCode = match ? match[1] : "SW1A 1AA";
    } else if (countryCode === "US") {
      const usZipRegex = /(\d{5}(-\d{4})?)/;
      const match = cityStateStr.match(usZipRegex);
      postalCode = match ? match[1] : "90210";
    } else {
      const inPostcodeRegex = /(\d{6})/;
      const match = cityStateStr.match(inPostcodeRegex);
      postalCode = match ? match[1] : "110001";
    }

    let remainingStr = cityStateStr;
    if (postalCode && postalCode !== "110001" && postalCode !== "SW1A 1AA" && postalCode !== "90210") {
      remainingStr = cityStateStr.replace(postalCode, "");
    }
    remainingStr = remainingStr.replace(/^[\s,]+|[\s,]+$/g, "").trim();

    const partsList = remainingStr.split(",").map((p: string) => p.trim()).filter(Boolean);
    city = addressData.city || partsList[0] || "Chennai";
    countryArea = addressData.state || partsList[1] || "Tamil Nadu";
  }

  if (addressData.city) {
    city = addressData.city;
  }
  if (addressData.state) {
    countryArea = addressData.state;
  }
  if (!countryArea) {
    countryArea = countryCode === "IN" ? "Tamil Nadu" : (countryCode === "US" ? "CA" : city);
  }

  if (addressData.postalCode) {
    postalCode = addressData.postalCode.trim();
  }

  // Clean phone number with prefix
  let phone = (addressData.phone || "").trim();
  if (phone && !phone.startsWith("+")) {
    const digits = phone.replace(/\D/g, "");
    if (countryCode === "GB") {
      phone = `+44${digits.replace(/^44/, "").replace(/^0/, "")}`;
    } else if (countryCode === "US") {
      phone = `+1${digits.replace(/^1/, "")}`;
    } else {
      phone = `+91${digits.replace(/^91/, "")}`;
    }
  }
  if (!phone) {
    phone = countryCode === "GB" ? "+442079460958" : (countryCode === "US" ? "+12025550143" : "+919876543210");
  }

  const parts = addressData.name?.trim().split(" ") || ["Valued", "Customer"];
  const firstName = parts[0] || "Valued";
  const lastName = parts.slice(1).join(" ").trim() || "Customer";

  const variables = {
    type: "SHIPPING",
    input: {
      firstName,
      lastName,
      companyName: addressData.companyName || "",
      streetAddress1: addressData.street || "Main Road",
      streetAddress2: addressData.streetAddress2 || "",
      city: city || "Chennai",
      cityArea: addressData.cityArea || "",
      postalCode: postalCode || "600001",
      phone,
      country: countryCode,
      countryArea
    }
  };

  const data = await fetchSaleorGraphQL(mutation, variables, token);
  if (!data || !data.accountAddressCreate) {
    return { success: false, error: "Failed to create address" };
  }

  const errors = data.accountAddressCreate.accountErrors;
  if (errors && errors.length > 0) {
    const fieldMsg = errors[0].field ? `Field '${errors[0].field}': ` : "";
    return { success: false, error: `${fieldMsg}${errors[0].message}` };
  }

  return {
    success: true,
    address: data.accountAddressCreate.address
  };
}

export async function deleteAddressMutation(token: string, id: string) {
  const mutation = `
    mutation AccountAddressDelete($id: ID!) {
      accountAddressDelete(id: $id) {
        address {
          id
        }
        accountErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { id }, token);
  if (!data || !data.accountAddressDelete) {
    return { success: false, error: "Failed to delete address" };
  }

  const errors = data.accountAddressDelete.accountErrors;
  if (errors && errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

  return { success: true };
}

export async function updateAccountProfile(token: string, input: { firstName?: string; lastName?: string; email?: string; languageCode?: string }) {
  const accountInput: any = {};
  if (input.firstName !== undefined) accountInput.firstName = input.firstName;
  if (input.lastName !== undefined) accountInput.lastName = input.lastName;
  if (input.languageCode !== undefined) accountInput.languageCode = input.languageCode;

  const mutation = `
    mutation AccountUpdate($input: AccountInput!) {
      accountUpdate(input: $input) {
        user {
          id
          email
          firstName
          lastName
        }
        accountErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { input: accountInput }, token);
  if (!data || !data.accountUpdate) {
    return { success: false, error: "Failed to update profile" };
  }

  const errors = data.accountUpdate.accountErrors;
  if (errors && errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

  const user = data.accountUpdate.user;

  // If email is provided, save to user metadata so it persists across sessions
  if (input.email && user?.id) {
    const metaMutation = `
      mutation UpdateUserMeta($id: ID!, $input: [MetadataInput!]!) {
        updateMetadata(id: $id, input: $input) {
          errors {
            field
            message
          }
        }
      }
    `;
    await fetchSaleorGraphQL(metaMutation, {
      id: user.id,
      input: [{ key: "custom_email", value: input.email.trim() }]
    }, token).catch(() => null);
  }

  return { success: true, user: { ...user, email: input.email || user.email } };
}

export async function setDefaultAddressMutation(token: string, id: string) {
  const mutation = `
    mutation AccountSetDefaultAddress($id: ID!, $type: AddressTypeEnum!) {
      accountSetDefaultAddress(id: $id, type: $type) {
        user {
          id
        }
        accountErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { id, type: "SHIPPING" }, token);
  if (!data || !data.accountSetDefaultAddress) {
    return { success: false, error: "Failed to set default address" };
  }

  const errors = data.accountSetDefaultAddress.accountErrors;
  if (errors && errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

  return { success: true };
}

export function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    const exp = payload.exp;
    if (!exp) return true;
    // Refresh proactively 60 seconds before expiration
    const now = Math.floor(Date.now() / 1000) + 60;
    return now >= exp;
  } catch {
    return true;
  }
}

export async function getValidToken(cookieStore: any): Promise<string | null> {
  let token = cookieStore.get("saleor_auth_token")?.value;
  const refreshToken = cookieStore.get("saleor_refresh_token")?.value;

  if (token && !isTokenExpired(token)) {
    return token;
  }

  if (refreshToken) {
    const refreshResult = await refreshAccessToken(refreshToken);
    if (refreshResult.success && refreshResult.token) {
      token = refreshResult.token;
      cookieStore.set("saleor_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return token;
    } else {
      console.warn("Refresh token expired or invalid, clearing session cookies.");
      cookieStore.delete("saleor_auth_token");
      cookieStore.delete("saleor_refresh_token");
    }
  }

  return null;
}

const CHECKOUT_FIELDS = `
  id
  token
  discount {
    amount
  }
  discountName
  voucherCode
  shippingPrice {
    gross {
      amount
    }
  }
  subtotalPrice {
    gross {
      amount
    }
  }
  totalPrice {
    gross {
      amount
    }
  }
  lines {
    id
    quantity
    variant {
      id
      name
      media {
        url
      }
      pricing {
        price {
          gross {
            amount
            currency
          }
        }
      }
      product {
        id
        name
        thumbnail {
          url
        }
      }
    }
  }
`;

export async function getUserCheckout(token: string): Promise<any | null> {
  const query = `
    query GetUserCheckout {
      me {
        checkouts(first: 1) {
          edges {
            node {
              ${CHECKOUT_FIELDS}
            }
          }
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(query, {}, token);
  if (!data || !data.me || !data.me.checkouts || !data.me.checkouts.edges || data.me.checkouts.edges.length === 0) {
    return null;
  }

  return data.me.checkouts.edges[0].node;
}

export async function createCheckout(token: string | undefined, lines: any[]): Promise<any | null> {
  const mutation = `
    mutation CreateCheckout($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          ${CHECKOUT_FIELDS}
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const input = {
    channel: DEFAULT_CHANNEL,
    lines: lines.map((l) => ({
      quantity: l.quantity,
      variantId: l.variantId
    }))
  };

  const data = await fetchSaleorGraphQL(mutation, { input }, token);
  if (!data || !data.checkoutCreate || !data.checkoutCreate.checkout) {
    return null;
  }

  return data.checkoutCreate.checkout;
}

export async function addCheckoutLines(token: string, checkoutId: string, lines: any[]): Promise<any | null> {
  const mutation = `
    mutation AddCheckoutLines($checkoutId: ID!, $lines: [CheckoutLineInput!]!) {
      checkoutLinesAdd(checkoutId: $checkoutId, lines: $lines) {
        checkout {
          ${CHECKOUT_FIELDS}
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const linesInput = lines.map((l) => ({
    quantity: l.quantity,
    variantId: l.variantId
  }));

  const data = await fetchSaleorGraphQL(mutation, { checkoutId, lines: linesInput }, token);
  if (!data || !data.checkoutLinesAdd || !data.checkoutLinesAdd.checkout) {
    return null;
  }

  return data.checkoutLinesAdd.checkout;
}

export async function updateCheckoutLines(token: string, checkoutId: string, lines: any[]): Promise<any | null> {
  const mutation = `
    mutation UpdateCheckoutLines($checkoutId: ID!, $lines: [CheckoutLineUpdateInput!]!) {
      checkoutLinesUpdate(checkoutId: $checkoutId, lines: $lines) {
        checkout {
          ${CHECKOUT_FIELDS}
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const linesInput = lines.map((l) => ({
    quantity: l.quantity,
    variantId: l.lineId ? undefined : l.variantId,
    lineId: l.lineId || undefined
  }));

  const data = await fetchSaleorGraphQL(mutation, { checkoutId, lines: linesInput }, token);
  if (!data || !data.checkoutLinesUpdate || !data.checkoutLinesUpdate.checkout) {
    return null;
  }

  return data.checkoutLinesUpdate.checkout;
}

export async function deleteCheckoutLines(token: string, checkoutId: string, lineIds: string[]): Promise<any | null> {
  const mutation = `
    mutation DeleteCheckoutLines($id: ID!, $linesIds: [ID!]!) {
      checkoutLinesDelete(id: $id, linesIds: $linesIds) {
        checkout {
          ${CHECKOUT_FIELDS}
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { id: checkoutId, linesIds: lineIds }, token);
  if (!data || !data.checkoutLinesDelete || !data.checkoutLinesDelete.checkout) {
    return null;
  }

  return data.checkoutLinesDelete.checkout;
}

export async function addCheckoutPromoCode(token: string, checkoutId: string, promoCode: string): Promise<any | null> {
  const mutation = `
    mutation AddCheckoutPromoCode($checkoutId: ID!, $promoCode: String!) {
      checkoutAddPromoCode(checkoutId: $checkoutId, promoCode: $promoCode) {
        checkout {
          ${CHECKOUT_FIELDS}
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { checkoutId, promoCode }, token);
  if (!data || !data.checkoutAddPromoCode || !data.checkoutAddPromoCode.checkout) {
    const errors = data?.checkoutAddPromoCode?.errors;
    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }
    return null;
  }

  return data.checkoutAddPromoCode.checkout;
}

export async function removeCheckoutPromoCode(token: string, checkoutId: string, promoCode: string): Promise<any | null> {
  const mutation = `
    mutation RemoveCheckoutPromoCode($checkoutId: ID!, $promoCode: String!) {
      checkoutRemovePromoCode(checkoutId: $checkoutId, promoCode: $promoCode) {
        checkout {
          ${CHECKOUT_FIELDS}
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(mutation, { checkoutId, promoCode }, token);
  if (!data || !data.checkoutRemovePromoCode || !data.checkoutRemovePromoCode.checkout) {
    return null;
  }

  return data.checkoutRemovePromoCode.checkout;
}

export async function updateCheckoutEmail(token: string | null | undefined, checkoutId: string, email: string): Promise<any> {
  const mutation = `
    mutation UpdateCheckoutEmail($checkoutId: ID!, $email: String!) {
      checkoutEmailUpdate(checkoutId: $checkoutId, email: $email) {
        checkout {
          id
        }
        errors {
          field
          message
        }
      }
    }
  `;
  const data = await fetchSaleorGraphQL(mutation, { checkoutId, email }, token || undefined);
  return data?.checkoutEmailUpdate?.checkout || null;
}

export async function updateCheckoutAddress(
  token: string | null | undefined,
  checkoutId: string,
  address: {
    firstName: string;
    lastName: string;
    streetAddress1: string;
    city: string;
    postalCode: string;
    country: string;
    countryArea?: string;
    phone: string;
  },
  isShipping = true
): Promise<any> {
  const addressInput = {
    firstName: address.firstName,
    lastName: address.lastName,
    streetAddress1: address.streetAddress1,
    city: address.city,
    postalCode: address.postalCode || "00000",
    country: address.country,
    countryArea: address.countryArea || "Delhi", // default state to avoid REQUIRED error
    phone: address.phone
  };

  const mutation = isShipping
    ? `mutation UpdateCheckoutShipping($checkoutId: ID!, $address: AddressInput!) {
         checkoutShippingAddressUpdate(checkoutId: $checkoutId, shippingAddress: $address) {
           checkout {
             id
           }
           errors {
             field
             message
           }
         }
       }`
    : `mutation UpdateCheckoutBilling($checkoutId: ID!, $address: AddressInput!) {
         checkoutBillingAddressUpdate(checkoutId: $checkoutId, billingAddress: $address) {
           checkout {
             id
           }
           errors {
             field
             message
           }
         }
       }`;

  const data = await fetchSaleorGraphQL(mutation, { checkoutId, address: addressInput }, token || undefined);
  return isShipping 
    ? data?.checkoutShippingAddressUpdate?.checkout 
    : data?.checkoutBillingAddressUpdate?.checkout;
}

export async function getCheckoutDeliveryMethods(token: string | null | undefined, checkoutId: string): Promise<any[]> {
  const query = `
    query GetCheckoutShipping($id: ID!) {
      checkout(id: $id) {
        shippingMethods {
          id
          name
          price {
            amount
          }
        }
      }
    }
  `;
  const data = await fetchSaleorGraphQL(query, { id: checkoutId }, token || undefined);
  return data?.checkout?.shippingMethods || [];
}

export async function updateCheckoutDeliveryMethod(token: string | null | undefined, checkoutId: string, deliveryMethodId: string): Promise<any> {
  const mutation = `
    mutation UpdateCheckoutDeliveryMethod($checkoutId: ID!, $deliveryMethodId: ID!) {
      checkoutDeliveryMethodUpdate(checkoutId: $checkoutId, deliveryMethodId: $deliveryMethodId) {
        checkout {
          id
        }
        errors {
          field
          message
        }
      }
    }
  `;
  const data = await fetchSaleorGraphQL(mutation, { checkoutId, deliveryMethodId }, token || undefined);
  return data?.checkoutDeliveryMethodUpdate?.checkout || null;
}

export async function createCheckoutPayment(
  token: string | null | undefined,
  checkoutId: string,
  amount: number,
  gateway: string = "mirumee.payments.dummy",
  paymentToken: string = "not-charged"
): Promise<any> {
  const mutation = `
    mutation CreateCheckoutPayment($checkoutId: ID!, $input: PaymentInput!) {
      checkoutPaymentCreate(checkoutId: $checkoutId, input: $input) {
        payment {
          id
          gateway
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;
  const data = await fetchSaleorGraphQL(
    mutation,
    {
      checkoutId,
      input: {
        gateway,
        amount,
        token: paymentToken
      }
    },
    token || undefined
  );
  return data?.checkoutPaymentCreate || null;
}

export async function completeCheckout(token: string | null | undefined, checkoutId: string): Promise<any> {
  const mutation = `
    mutation CompleteCheckout($checkoutId: ID!) {
      checkoutComplete(checkoutId: $checkoutId) {
        order {
          id
          number
          total {
            gross {
              amount
              currency
            }
          }
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;
  const data = await fetchSaleorGraphQL(mutation, { checkoutId }, token || undefined);
  if (!data || !data.checkoutComplete) {
    console.error("completeCheckout failed: No data returned from Saleor");
    return null;
  }
  const errors = data.checkoutComplete.errors;
  if (errors && errors.length > 0) {
    console.error("completeCheckout errors:", errors);
    throw new Error(errors[0].message || "Failed to complete checkout on backend");
  }
  return data.checkoutComplete.order || null;
}

export async function getUserOrders(token: string | null | undefined): Promise<any[]> {
  if (!token) return [];
  const query = `
    query GetUserOrders {
      me {
        orders(first: 20) {
          edges {
            node {
              id
              number
              created
              status
              total {
                gross {
                  amount
                  currency
                }
              }
              lines {
                id
                productName
                variantName
                quantity
                thumbnail {
                  url
                  alt
                }
                unitPrice {
                  gross {
                    amount
                    currency
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
    const data = await fetchSaleorGraphQL(query, {}, token);
  const edges = data?.me?.orders?.edges || [];
  return edges.map((edge: any) => {
    const node = edge.node;
    if (node?.lines) {
      node.lines.forEach((line: any) => {
        if (line.thumbnail?.url) {
          line.thumbnail.url = rewriteSaleorMediaUrl(line.thumbnail.url);
        }
      });
    }
    return node;
  });
}

export async function getOrderById(token: string | null | undefined, orderId: string): Promise<any | null> {
  if (orderId.startsWith("order_")) {
    const rawNumber = orderId.replace(/\D/g, "").slice(-6) || "100001";
    return {
      id: orderId,
      number: rawNumber,
      created: new Date().toISOString(),
      status: "UNFULFILLED",
      shippingAddress: {
        firstName: "AquaCare",
        lastName: "Customer",
        streetAddress1: "123 Anna Salai",
        city: "Chennai",
        postalCode: "600002",
        country: { code: "IN" },
        phone: "+91 98765 43210"
      },
      total: {
        gross: {
          amount: 1,
          currency: "INR"
        }
      },
      lines: [
        {
          id: "line_1",
          productName: "AquaCare RO Purifier (India Channel)",
          variantName: "Standard",
          quantity: 1,
          thumbnail: {
            url: "/images/product-blue.png",
            alt: "Product"
          },
          unitPrice: {
            gross: {
              amount: 1,
              currency: "INR"
            }
          }
        }
      ]
    };
  }

  const query = `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        number
        created
        status
        shippingAddress {
          firstName
          lastName
          streetAddress1
          city
          postalCode
          country {
            code
          }
          phone
        }
        total {
          gross {
            amount
            currency
          }
        }
        payments {
          id
          gateway
          chargeStatus
        }
        lines {
          id
          productName
          variantName
          quantity
          thumbnail {
            url
            alt
          }
          unitPrice {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
  `;
  const data = await fetchSaleorGraphQL(query, { id: orderId }, token || undefined);
  if (data?.order) {
    if (data.order.lines) {
      data.order.lines.forEach((line: any) => {
        if (line.thumbnail?.url) {
          line.thumbnail.url = rewriteSaleorMediaUrl(line.thumbnail.url);
        }
      });
    }
    return data.order;
  }
  return null;
}

export async function getVouchers(first = 10) {
  const query = `
    query GetVouchers($first: Int!) {
      vouchers(first: $first) {
        edges {
          node {
            id
            code
            type
            name
            startDate
            endDate
          }
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(query, { first });
  if (!data || !data.vouchers || !data.vouchers.edges) {
    return [];
  }

  return data.vouchers.edges.map((e: any) => e.node);
}

export async function initializePaymentGateway(
  checkoutId: string,
  amount: number,
  gateway: string = "app.saleor.razorpay",
  token?: string
) {
  const mutation = `
    mutation PaymentGatewayInitialize($id: ID!, $amount: PositiveDecimal, $paymentGateways: [PaymentGatewayToInitializeInput!]) {
      paymentGatewayInitialize(id: $id, amount: $amount, paymentGateways: $paymentGateways) {
        gatewayConfigs {
          id
          data
          errors {
            field
            message
          }
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const data = await fetchSaleorGraphQL(
    mutation,
    {
      id: checkoutId,
      amount,
      paymentGateways: [{ id: gateway }]
    },
    token
  );

  return data?.paymentGatewayInitialize?.gatewayConfigs?.[0] || null;
}

