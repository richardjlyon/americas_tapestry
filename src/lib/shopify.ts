import 'server-only';
import { GraphQLClient } from 'graphql-request';

/**
 * Storefront API client for the shared Shopify store (0fzpk4-z1.myshopify.com).
 *
 * The America's Tapestry products live in that store, segmented by the
 * "America's Tapestry" collection, and are published to the sales channel this
 * Storefront token reads. Server-only: the token must never reach the client
 * bundle.
 */
const API_VERSION = '2025-07';

const domain = process.env['NEXT_PUBLIC_SHOPIFY_DOMAIN'];
const token = process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'];

/** True once both env values are present — lets callers degrade gracefully. */
export const isShopifyConfigured = Boolean(domain && token);

const client =
  domain && token
    ? new GraphQLClient(`https://${domain}/api/${API_VERSION}/graphql.json`, {
        headers: {
          'X-Shopify-Storefront-Access-Token': token,
        },
      })
    : null;

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  price: { amount: string; currencyCode: string };
  maxPrice: { amount: string; currencyCode: string };
  variantId: string | null;
  availableForSale: boolean;
}

export interface RawProductNode {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants: { edges: Array<{ node: { id: string; availableForSale: boolean } }> };
}

/** Pure raw→typed mapping. Exported for unit testing; no I/O. */
export function mapProductNode(node: RawProductNode): ShopifyProduct {
  const variant = node.variants.edges[0]?.node ?? null;
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description ?? '',
    tags: node.tags ?? [],
    featuredImage: node.featuredImage,
    price: node.priceRange.minVariantPrice,
    maxPrice: node.priceRange.maxVariantPrice,
    variantId: variant?.id ?? null,
    availableForSale: variant?.availableForSale ?? false,
  };
}

interface CollectionProductsResponse {
  collection: {
    products: { edges: Array<{ node: RawProductNode }> };
  } | null;
}

const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch the products in a Shopify collection via the Storefront API.
 * Returns [] when Shopify isn't configured or on any error, so callers can
 * hide the section rather than crash the page.
 */
export async function getCollectionProducts(
  handle: string,
  first = 24,
): Promise<ShopifyProduct[]> {
  if (!client) return [];
  try {
    const data = await client.request<CollectionProductsResponse>(
      COLLECTION_PRODUCTS_QUERY,
      { handle, first },
    );

    const edges = data.collection?.products.edges ?? [];
    return edges.map(({ node }) => mapProductNode(node));
  } catch (error) {
    console.error('[shopify] getCollectionProducts failed:', error);
    return [];
  }
}

/** Extract the numeric variant id from a Storefront GID. */
function variantNumericId(gid: string | null): string | null {
  if (!gid) return null;
  const match = gid.match(/ProductVariant\/(\d+)/);
  return match ? match[1]! : null;
}

/**
 * Direct-to-checkout permalink that adds one of the variant to the cart and
 * lands the customer on Shopify's checkout. Returns null when unavailable.
 */
export function checkoutUrl(variantId: string | null): string | null {
  const id = variantNumericId(variantId);
  if (!id || !domain) return null;
  return `https://${domain}/cart/${id}:1`;
}

const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  query AllProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node {
          id title handle description tags
          featuredImage { url altText }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          variants(first: 1) { edges { node { id availableForSale } } }
        } }
      }
    }
  }
`;

/** Every product in the America's Tapestry collection, paginated. [] when unconfigured/on error. */
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  if (!client) return [];
  const out: ShopifyProduct[] = [];
  let after: string | null = null;
  try {
    for (let page = 0; page < 20; page++) {
      const data: {
        collection: { products: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          edges: Array<{ node: RawProductNode }>;
        } } | null;
      } = await client.request(ALL_PRODUCTS_QUERY, { handle: 'americas-tapestry', first: 50, after });
      const conn = data.collection?.products;
      if (!conn) break;
      for (const { node } of conn.edges) out.push(mapProductNode(node));
      if (!conn.pageInfo.hasNextPage) break;
      after = conn.pageInfo.endCursor;
    }
    return out;
  } catch (error) {
    console.error('[shopify] getAllProducts failed:', error);
    return [];
  }
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  selectedOptions: { name: string; value: string }[];
}
export interface ShopifyProductDetail extends ShopifyProduct {
  images: { url: string; altText: string | null }[];
  options: { name: string; values: string[] }[];
  variants: ShopifyVariant[];
}

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title handle description tags
      featuredImage { url altText }
      images(first: 12) { edges { node { url altText } } }
      options { name values }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 100) { edges { node {
        id title availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
      } } }
    }
  }
`;

/** Rich product detail by handle. null when unconfigured/not found/on error. */
export async function getProductByHandle(handle: string): Promise<ShopifyProductDetail | null> {
  if (!client) return null;
  try {
    const data: { product: (Omit<RawProductNode, 'variants'> & {
      images: { edges: Array<{ node: { url: string; altText: string | null } }> };
      options: { name: string; values: string[] }[];
      variants: { edges: Array<{ node: ShopifyVariant }> };
    }) | null } = await client.request(PRODUCT_BY_HANDLE_QUERY, { handle });
    const node = data.product;
    if (!node) return null;
    const base = mapProductNode({ ...node, variants: { edges: node.variants.edges.map((e) => ({ node: { id: e.node.id, availableForSale: e.node.availableForSale } })) } });
    return {
      ...base,
      availableForSale: node.variants.edges.some((e) => e.node.availableForSale),
      images: node.images.edges.map((e) => e.node),
      options: node.options,
      variants: node.variants.edges.map((e) => e.node),
    };
  } catch (error) {
    console.error('[shopify] getProductByHandle failed:', error);
    return null;
  }
}
