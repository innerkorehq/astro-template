import { defineCollection, z } from "astro:content";
import { sqliteProductLoader, sqliteCategoryLoader, sqliteServiceLoader } from "./lib/catalog/loaders.js";

// ── Reusable sub-schemas ──────────────────────────────────────────────────────

const mediaAsset = z.object({
  url: z.string(),
  alt: z.string().optional(),
  type: z.enum(["image", "video", "document", "3d_model"]).default("image"),
  is_primary: z.boolean().default(false),
  sort_order: z.number().default(0),
});

const seoMeta = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

const tag = z.object({
  name: z.string(),
  slug: z.string().optional(),
  color: z.string().optional(),
});

const pricing = z.object({
  price_type: z
    .enum(["fixed", "price_on_request", "free", "subscription", "tiered", "negotiable"])
    .default("fixed"),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "AED", "SGD"]).default("INR"),
  amount: z.number().optional(),
  compare_at: z.number().optional(),
  display_label: z.string().optional(),
  show_price: z.boolean().default(true),
  unit_label: z.string().optional(),
  minimum_order_qty: z.number().optional(),
  maximum_order_qty: z.number().optional(),
});

const stockStatus = z.enum([
  "in_stock",
  "out_of_stock",
  "backorder",
  "preorder",
  "discontinued",
  "on_request",
]);

const inventory = z
  .object({
    manage_stock: z.boolean().default(true),
    stock_qty: z.number().default(0),
    low_stock_threshold: z.number().optional(),
    backorder_allowed: z.boolean().default(false),
    preorder_allowed: z.boolean().default(false),
  })
  .default({});

const shipping = z
  .object({
    is_free_shipping: z.boolean().default(false),
    ships_in_days: z.number().optional(),
    ships_from: z.string().optional(),
    requires_shipping: z.boolean().default(true),
  })
  .default({});

const attribute = z.object({
  key: z.string(),
  label: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
  group: z.string().optional(),
  is_filterable: z.boolean().default(false),
  is_comparable: z.boolean().default(false),
});

const variantOptionValue = z.object({
  value: z.string(),
  label: z.string().optional(),
  swatch: z.string().optional(),
  is_default: z.boolean().default(false),
  in_stock: z.boolean().default(true),
});

const variantOption = z.object({
  name: z.string(),
  values: z.array(variantOptionValue),
});

const productVariant = z.object({
  sku: z.string().optional(),
  option_values: z.record(z.string()),
  pricing: pricing.optional(),
  stock_qty: z.number().optional(),
  stock_status: stockStatus.default("in_stock"),
  images: z.array(mediaAsset).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

const productSection = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().optional(),
  specs: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  default_open: z.boolean().default(false),
});

// ── Products collection ───────────────────────────────────────────────────────
// Maps from Python Product schema. Slug = filename (e.g. bosch-drill.json → id: "bosch-drill").

const products = defineCollection({
  loader: sqliteProductLoader(),
  schema: z.object({
    // Identity
    name: z.string(),
    short_name: z.string().optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    short_desc: z.string().optional(),
    sku: z.string().optional(),
    brand: z.string().optional(),
    model_number: z.string().optional(),
    country_of_origin: z.string().optional(),

    // Type — maps Python ProductType
    product_type: z
      .enum(["physical", "digital", "service", "bundle", "virtual"])
      .default("physical"),

    // Taxonomy
    category_ids: z.array(z.string()).default([]),
    tags: z.array(tag).default([]),
    collections: z.array(z.string()).default([]),

    // Media
    images: z.array(mediaAsset).default([]),

    // Pricing — maps Python Pricing
    pricing,
    pricing_note: z.string().optional(),

    // Variants — maps Python VariantOption / ProductVariant
    has_variants: z.boolean().default(false),
    variant_options: z.array(variantOption).default([]),
    variants: z.array(productVariant).default([]),

    // Inventory & shipping — maps Python Inventory / ShippingInfo
    inventory,
    shipping,

    // Attributes & specs — maps Python CustomAttribute
    attributes: z.array(attribute).default([]),

    // Explicit collapsible sections (alternative to auto-grouping from attributes)
    sections: z.array(productSection).default([]),

    // Bullet-point highlights shown in buy box
    highlights: z.array(z.string()).default([]),

    // Related products (reference by slug/id)
    related_ids: z.array(z.string()).default([]),

    // Status & merchandising flags
    status: z
      .enum(["draft", "active", "archived", "scheduled"])
      .default("draft"),
    is_featured: z.boolean().default(false),
    is_new: z.boolean().default(false),
    is_bestseller: z.boolean().default(false),
    sort_order: z.number().default(0),

    // Aggregated review data
    rating: z.number().min(0).max(5).optional(),
    review_count: z.number().optional(),

    // SEO (slug is derived from filename)
    seo: seoMeta.default({}),

    // Vendor / supplier
    vendor_name: z.string().optional(),

    // Compliance
    certifications: z.array(z.string()).default([]),
    warranty: z.string().optional(),
  }),
});

// ── Categories collection ─────────────────────────────────────────────────────
// Maps from Python Category schema.

const categories = defineCollection({
  loader: sqliteCategoryLoader(),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    parent_id: z.string().optional(),
    type: z.enum(["product", "service", "mixed"]).default("product"),
    icon: z.string().optional(),
    color: z.string().optional(),
    image: mediaAsset.optional(),

    // Maps CategoryDisplayConfig
    display: z
      .object({
        layout: z
          .enum(["grid", "list", "masonry", "carousel"])
          .default("grid"),
        columns: z.number().default(3),
        show_price: z.boolean().default(true),
        show_rating: z.boolean().default(true),
        show_add_to_cart: z.boolean().default(true),
        show_enquiry_btn: z.boolean().default(false),
        cta_label: z.string().optional(),
      })
      .default({}),

    seo: seoMeta.default({}),
    status: z
      .enum(["draft", "active", "archived", "scheduled"])
      .default("active"),
    is_featured: z.boolean().default(false),
    sort_order: z.number().default(0),
  }),
});

// ── Services collection ───────────────────────────────────────────────────────
// Maps from Python Service schema (service.py).

const deliverable = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  quantity: z.string().optional(),
  is_included: z.boolean().default(true),
});

const services = defineCollection({
  loader: sqliteServiceLoader(),
  schema: z.object({
    // Identity
    name: z.string(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    short_desc: z.string().optional(),

    // Classification — maps ServiceType / ServiceDeliveryMode
    service_type: z
      .enum(["one_time", "recurring", "project", "retainer", "hourly", "daily"])
      .default("one_time"),
    delivery_mode: z
      .enum(["in_person", "online", "hybrid", "at_client_location"])
      .default("online"),

    // Status & merchandising
    status: z
      .enum(["draft", "active", "archived", "scheduled"])
      .default("draft"),
    is_featured: z.boolean().default(false),
    sort_order: z.number().default(0),
    published_at: z.string().optional(),

    // Scope
    duration: z.string().optional(),
    revisions: z.string().optional(),
    is_remote: z.boolean().default(true),
    location_address: z.string().optional(),
    availability_note: z.string().optional(),

    // Provider info
    provider_id: z.string().optional(),
    provider_name: z.string().optional(),
    team_size: z.number().optional(),
    years_experience: z.number().optional(),
    certifications: z.array(z.string()).default([]),
    portfolio_urls: z.array(z.string()).default([]),

    // Taxonomy
    category_ids: z.array(z.string()).default([]),
    tags: z.array(tag).default([]),

    // Media
    images: z.array(mediaAsset).default([]),
    videos: z.array(mediaAsset).default([]),

    // Pricing — maps Pricing from pricing.py
    pricing: pricing.optional(),

    // Packages — maps ServicePackage (tiered: Basic / Standard / Premium)
    packages: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          tagline: z.string().optional(),
          description: z.string().optional(),
          pricing,
          deliverables: z.array(deliverable).default([]),
          duration: z.string().optional(),
          is_popular: z.boolean().default(false),
          is_custom: z.boolean().default(false),
          sort_order: z.number().default(0),
        })
      )
      .default([]),

    // Add-ons — maps ServiceAddon
    addons: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          pricing,
          is_popular: z.boolean().default(false),
        })
      )
      .default([]),

    // Base deliverables (outside packages)
    deliverables: z.array(deliverable).default([]),

    // Process steps — maps ProcessStep
    process_steps: z
      .array(
        z.object({
          id: z.string(),
          step_number: z.number(),
          title: z.string(),
          description: z.string().optional(),
          icon: z.string().optional(),
          duration: z.string().optional(),
        })
      )
      .default([]),

    // Location
    service_areas: z.array(z.string()).default([]),

    // Booking config — maps BookingConfig
    booking: z
      .object({
        type: z
          .enum(["none", "inquiry_form", "calendar", "instant"])
          .default("inquiry_form"),
        min_notice_hours: z.number().default(24),
        max_advance_days: z.number().default(90),
        slot_duration_mins: z.number().default(60),
        calendar_url: z.string().optional(),
        confirmation_message: z.string().optional(),
        auto_confirm: z.boolean().default(false),
      })
      .default({}),

    // Social proof — maps Testimonial[]
    testimonials: z
      .array(
        z.object({
          id: z.string(),
          author_name: z.string(),
          author_role: z.string().optional(),
          author_company: z.string().optional(),
          avatar_url: z.string().optional(),
          text: z.string(),
          rating: z.number().min(1).max(5).optional(),
        })
      )
      .default([]),

    // FAQs — maps FAQ[]
    faqs: z
      .array(
        z.object({
          id: z.string(),
          question: z.string(),
          answer: z.string(),
          sort_order: z.number().default(0),
        })
      )
      .default([]),

    // Specs — maps CustomAttribute[]
    attributes: z.array(attribute).default([]),

    // Related
    related_ids: z.array(z.string()).default([]),

    // Reviews (aggregated)
    rating: z.number().min(0).max(5).optional(),
    review_count: z.number().optional(),

    // SEO
    seo: seoMeta.default({}),
  }),
});

export const collections = { products, categories, services };
