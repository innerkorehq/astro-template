import { defineDb, defineTable, column, NOW } from 'astro:db';

// ── User ─────────────────────────────────────────────────────────────────────

const User = defineTable({
  columns: {
    id:            column.text({ primaryKey: true }),
    email:         column.text({ unique: true }),
    password_hash: column.text(),
    role:          column.text({ default: 'editor' }),   // admin | editor | viewer
    name:          column.text({ optional: true }),
    avatar_url:    column.text({ optional: true }),
    created_at:    column.text({ default: NOW }),
    updated_at:    column.text({ default: NOW }),
  },
});

// ── SiteConfig ───────────────────────────────────────────────────────────────

const SiteConfig = defineTable({
  columns: {
    id:               column.text({ primaryKey: true }),   // always 'main'
    name:             column.text(),
    domain:           column.text({ optional: true }),
    locale:           column.text({ default: 'en' }),
    timezone:         column.text({ default: 'UTC' }),
    status:           column.text({ default: 'active' }),  // active | maintenance | inactive
    tagline:          column.text({ optional: true }),
    description:      column.text({ optional: true }),
    base_url:         column.text({ optional: true }),
    theme:            column.text({ default: 'light' }),
    primary_color:    column.text({ optional: true }),
    secondary_color:  column.text({ optional: true }),
    logo_url:         column.text({ optional: true }),
    favicon_url:      column.text({ optional: true }),
    social_twitter:   column.text({ optional: true }),
    social_linkedin:  column.text({ optional: true }),
    social_github:    column.text({ optional: true }),
    social_youtube:   column.text({ optional: true }),
    social_instagram: column.text({ optional: true }),
    social_facebook:  column.text({ optional: true }),
    contact:          column.json({ optional: true }),     // ContactInfo
    meta:             column.json({ optional: true }),     // features, analytics, rss…
    // Layout control — drives PageLayout variant for all generated pages
    // One of: centered | full-width | sidebar-left | sidebar-right | sidebar-both | holy-grail | dashboard
    layout_variant:   column.text({ optional: true }),    // default resolved in client.ts as 'full-width'
    created_at:       column.text({ default: NOW }),
    updated_at:       column.text({ default: NOW }),
  },
});

// ── Media ─────────────────────────────────────────────────────────────────────

const Media = defineTable({
  columns: {
    id:          column.text({ primaryKey: true }),
    filename:    column.text(),
    mime_type:   column.text(),
    size_bytes:  column.number({ default: 0 }),
    url:         column.text(),
    alt_text:    column.text({ optional: true }),
    width:       column.number({ optional: true }),
    height:      column.number({ optional: true }),
    uploaded_at: column.text({ default: NOW }),
  },
});

// ── Page ─────────────────────────────────────────────────────────────────────
// Hierarchical page tree with materialised path.

const Page = defineTable({
  columns: {
    id:           column.text({ primaryKey: true }),
    parent_id:    column.text({ optional: true, references: () => Page.columns.id }),
    slug:         column.text(),
    path:         column.text({ unique: true }),
    type:         column.text({ default: 'page' }),      // page|post|landing|redirect|doc|blog
    template:     column.text({ optional: true }),        // registry hint e.g. 'product/detail'
    ref_type:     column.text({ optional: true }),        // product|service|document|category
    ref_id:       column.text({ optional: true }),        // slug / id of linked entity
    status:       column.text({ default: 'draft' }),      // draft|published|archived
    position:     column.number({ default: 0 }),
    published_at: column.text({ optional: true }),
    created_at:   column.text({ default: NOW }),
    updated_at:   column.text({ default: NOW }),
    deleted_at:   column.text({ optional: true }),
  },
});

// ── PageContent ───────────────────────────────────────────────────────────────

const PageContent = defineTable({
  columns: {
    id:          column.text({ primaryKey: true }),
    page_id:     column.text({ references: () => Page.columns.id }),
    locale:      column.text({ default: 'en' }),
    version:     column.number({ default: 1 }),
    is_current:  column.boolean({ default: true }),
    title:       column.text(),
    description: column.text({ optional: true }),
    body:        column.json({ default: [] }),             // Block[]
    body_format: column.text({ default: 'richtext' }),    // markdown|html|mdx|richtext|plain
    created_at:  column.text({ default: NOW }),
    created_by:  column.text({ optional: true, references: () => User.columns.id }),
  },
});

// ── SeoMeta ───────────────────────────────────────────────────────────────────

const SeoMeta = defineTable({
  columns: {
    id:               column.text({ primaryKey: true }),
    page_id:          column.text({ references: () => Page.columns.id }),
    locale:           column.text({ default: 'en' }),
    meta_title:       column.text({ optional: true }),
    meta_description: column.text({ optional: true }),
    canonical_url:    column.text({ optional: true }),
    og_title:         column.text({ optional: true }),
    og_description:   column.text({ optional: true }),
    og_image:         column.text({ optional: true }),
    noindex:          column.boolean({ default: false }),
    nofollow:         column.boolean({ default: false }),
    schema_org:       column.json({ optional: true }),     // JSON-LD blob
    updated_at:       column.text({ default: NOW }),
  },
});

// ── Menu ─────────────────────────────────────────────────────────────────────

const Menu = defineTable({
  columns: {
    id:         column.text({ primaryKey: true }),
    handle:     column.text({ unique: true }),
    name:       column.text({ default: '' }),
    locale:     column.text({ default: 'en' }),
    created_at: column.text({ default: NOW }),
    updated_at: column.text({ default: NOW }),
  },
});

// ── MenuItem ─────────────────────────────────────────────────────────────────

const MenuItem = defineTable({
  columns: {
    id:              column.text({ primaryKey: true }),
    menu_id:         column.text({ references: () => Menu.columns.id }),
    parent_id:       column.text({ optional: true, references: () => MenuItem.columns.id }),
    position:        column.number({ default: 0 }),
    label:           column.text(),
    page_id:         column.text({ optional: true, references: () => Page.columns.id }),
    url:             column.text({ optional: true }),
    target:          column.text({ optional: true }),
    type:            column.text({ default: 'link' }),   // link|dropdown|divider|button…
    icon:            column.text({ optional: true }),
    badge:           column.text({ optional: true }),
    badge_color:     column.text({ optional: true }),
    is_external:     column.boolean({ default: false }),
    open_in_new_tab: column.boolean({ default: false }),
    is_cta:          column.boolean({ default: false }),
  },
});

// ── ContentAuthor ─────────────────────────────────────────────────────────────

const ContentAuthor = defineTable({
  columns: {
    id:              column.text({ primaryKey: true }),
    name:            column.text(),
    slug:            column.text({ optional: true, unique: true }),
    bio:             column.text({ optional: true }),
    avatar:          column.json({ optional: true }),    // MediaAsset
    role:            column.text({ optional: true }),
    social_twitter:  column.text({ optional: true }),
    social_linkedin: column.text({ optional: true }),
    social_github:   column.text({ optional: true }),
    website:         column.text({ optional: true }),
    is_external:     column.boolean({ default: false }),
    contact:         column.json({ optional: true }),    // ContactInfo
    meta:            column.json({ optional: true }),
    created_at:      column.text({ default: NOW }),
    updated_at:      column.text({ default: NOW }),
  },
});

// ── ContentCollection ─────────────────────────────────────────────────────────

const ContentCollection = defineTable({
  columns: {
    id:           column.text({ primaryKey: true }),
    name:         column.text(),
    slug:         column.text({ optional: true }),
    description:  column.text({ optional: true }),
    parent_id:    column.text({ optional: true, references: () => ContentCollection.columns.id }),
    content_type: column.text({ optional: true }),
    icon:         column.text({ optional: true }),
    cover:        column.json({ optional: true }),       // MediaAsset
    color:        column.text({ optional: true }),
    sort_order:   column.number({ default: 0 }),
    is_featured:  column.boolean({ default: false }),
    path:         column.text({ optional: true }),
    depth:        column.number({ default: 0 }),
    seo:          column.json({ optional: true }),       // SEOMeta
    meta:         column.json({ optional: true }),
    created_at:   column.text({ default: NOW }),
    updated_at:   column.text({ default: NOW }),
  },
});

// ── ContentDocument ───────────────────────────────────────────────────────────

const ContentDocument = defineTable({
  columns: {
    id:                  column.text({ primaryKey: true }),
    content_type:        column.text({ default: 'blog_post' }),
    title:               column.text(),
    subtitle:            column.text({ optional: true }),
    excerpt:             column.text({ optional: true }),
    slug:                column.text({ optional: true }),
    locale:              column.text({ default: 'en' }),
    body:                column.text({ optional: true }),   // raw markdown/html
    body_format:         column.text({ default: 'markdown' }),
    blocks:              column.json({ default: [] }),      // ContentBlock[]
    word_count:          column.number({ optional: true }),
    reading_time_mins:   column.number({ optional: true }),
    cover_image:         column.json({ optional: true }),   // MediaAsset
    og_image:            column.json({ optional: true }),   // MediaAsset
    collection_ids:      column.json({ default: [] }),      // string[]
    tags:                column.json({ default: [] }),      // Tag[]
    topics:              column.json({ default: [] }),      // string[]
    content_series:      column.text({ optional: true }),
    series_order:        column.number({ optional: true }),
    authors:             column.json({ default: [] }),      // Author[]
    reviewers:           column.json({ default: [] }),      // Author[]
    organization:        column.text({ optional: true }),
    audience_level:      column.text({ default: 'all' }),
    target_roles:        column.json({ default: [] }),
    target_industries:   column.json({ default: [] }),
    status:              column.text({ default: 'draft' }), // draft|in_review|scheduled|published|…
    is_featured:         column.boolean({ default: false }),
    is_pinned:           column.boolean({ default: false }),
    is_premium:          column.boolean({ default: false }),
    is_sponsored:        column.boolean({ default: false }),
    noindex:             column.boolean({ default: false }),
    password:            column.text({ optional: true }),
    published_at:        column.text({ optional: true }),
    updated_at_display:  column.text({ optional: true }),
    expires_at:          column.text({ optional: true }),
    scheduled_at:        column.text({ optional: true }),
    version:             column.text({ optional: true }),
    versions:            column.json({ default: [] }),      // ContentVersion[]
    is_latest_version:   column.boolean({ default: true }),
    deprecated:          column.boolean({ default: false }),
    deprecation_notice:  column.text({ optional: true }),
    migration_guide_url: column.text({ optional: true }),
    breadcrumbs:         column.json({ default: [] }),
    toc:                 column.json({ default: [] }),
    prev_doc:            column.json({ optional: true }),
    next_doc:            column.json({ optional: true }),
    parent_doc:          column.json({ optional: true }),
    related:             column.json({ default: [] }),
    canonical_url:       column.text({ optional: true }),
    seo:                 column.json({ optional: true }),
    social:              column.json({ optional: true }),
    schema_org_type:     column.text({ optional: true }),
    feedback:            column.json({ optional: true }),
    allow_comments:      column.boolean({ default: true }),
    allow_reactions:     column.boolean({ default: true }),
    source_url:          column.text({ optional: true }),
    source_name:         column.text({ optional: true }),
    license:             column.text({ optional: true }),
    translations:        column.json({ optional: true }),
    is_translation:      column.boolean({ default: false }),
    original_id:         column.text({ optional: true, references: () => ContentDocument.columns.id }),
    custom_fields:       column.json({ optional: true }),
    meta:                column.json({ optional: true }),
    created_at:          column.text({ default: NOW }),
    updated_at:          column.text({ default: NOW }),
    deleted_at:          column.text({ optional: true }),
  },
});

// ── Redirect ─────────────────────────────────────────────────────────────────

const Redirect = defineTable({
  columns: {
    id:         column.text({ primaryKey: true }),
    from_path:  column.text({ unique: true }),
    to_path:    column.text(),
    type:       column.text({ default: '301' }),   // 301 | 302 | rewrite
    is_regex:   column.boolean({ default: false }),
    is_active:  column.boolean({ default: true }),
    note:       column.text({ optional: true }),
    hit_count:  column.number({ default: 0 }),
    created_at: column.text({ default: NOW }),
    updated_at: column.text({ default: NOW }),
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// Catalog layer
// ═════════════════════════════════════════════════════════════════════════════

// ── CatalogConfig ─────────────────────────────────────────────────────────────

const CatalogConfig = defineTable({
  columns: {
    id:                   column.text({ primaryKey: true }),  // always 'main'
    site_id:              column.text({ default: 'main' }),
    name:                 column.text({ default: '' }),
    tagline:              column.text({ optional: true }),
    description:          column.text({ optional: true }),
    mode:                 column.text({ default: 'hybrid' }),  // catalog_only|catalog_with_cart|service_only|hybrid
    default_currency:     column.text({ default: 'INR' }),
    locale:               column.text({ default: 'en-IN' }),
    timezone:             column.text({ default: 'Asia/Kolkata' }),
    industry:             column.text({ optional: true }),
    sub_industry:         column.text({ optional: true }),
    notify_email:         column.text({ optional: true }),
    notify_phone:         column.text({ optional: true }),
    notify_slack_webhook: column.text({ optional: true }),
    custom_domain:        column.text({ optional: true }),
    supported_currencies: column.json({ default: ['INR'] }),
    business:             column.json({ optional: true }),
    branding:             column.json({ optional: true }),
    contact:              column.json({ optional: true }),
    social:               column.json({ optional: true }),
    features:             column.json({ optional: true }),
    shipping_zones:       column.json({ default: [] }),
    tax_profiles:         column.json({ default: [] }),
    seo:                  column.json({ optional: true }),
    meta:                 column.json({ optional: true }),
    created_at:           column.text({ default: NOW }),
    updated_at:           column.text({ default: NOW }),
  },
});

// ── Products ─────────────────────────────────────────────────────────────────

const Products = defineTable({
  columns: {
    id:                column.text({ primaryKey: true }),
    name:              column.text(),
    slug:              column.text({ optional: true }),
    short_name:        column.text({ optional: true }),
    tagline:           column.text({ optional: true }),
    description:       column.text({ optional: true }),
    short_desc:        column.text({ optional: true }),
    sku:               column.text({ optional: true }),
    brand:             column.text({ optional: true }),
    model_number:      column.text({ optional: true }),
    country_of_origin: column.text({ optional: true }),
    product_type:      column.text({ default: 'physical' }),
    status:            column.text({ default: 'draft' }),
    is_featured:       column.boolean({ default: false }),
    is_new:            column.boolean({ default: false }),
    is_bestseller:     column.boolean({ default: false }),
    sort_order:        column.number({ default: 0 }),
    rating:            column.number({ optional: true }),
    review_count:      column.number({ optional: true }),
    vendor_name:       column.text({ optional: true }),
    warranty:          column.text({ optional: true }),
    pricing_note:      column.text({ optional: true }),
    has_variants:      column.boolean({ default: false }),
    category_ids:      column.json({ default: [] }),
    tags:              column.json({ default: [] }),
    collections:       column.json({ default: [] }),
    images:            column.json({ default: [] }),
    pricing:           column.json({ optional: true }),
    variant_options:   column.json({ default: [] }),
    variants:          column.json({ default: [] }),
    inventory:         column.json({ optional: true }),
    shipping:          column.json({ optional: true }),
    attributes:        column.json({ default: [] }),
    sections:          column.json({ default: [] }),
    highlights:        column.json({ default: [] }),
    related_ids:       column.json({ default: [] }),
    certifications:    column.json({ default: [] }),
    seo:               column.json({ optional: true }),
    created_at:        column.text({ default: NOW }),
    updated_at:        column.text({ default: NOW }),
  },
});

// ── Categories ───────────────────────────────────────────────────────────────

const Categories = defineTable({
  columns: {
    id:          column.text({ primaryKey: true }),
    name:        column.text(),
    slug:        column.text({ optional: true }),
    description: column.text({ optional: true }),
    parent_id:   column.text({ optional: true }),
    type:        column.text({ default: 'product' }),
    icon:        column.text({ optional: true }),
    color:       column.text({ optional: true }),
    status:      column.text({ default: 'active' }),
    is_featured: column.boolean({ default: false }),
    sort_order:  column.number({ default: 0 }),
    image:       column.json({ optional: true }),
    display:     column.json({ optional: true }),
    seo:         column.json({ optional: true }),
    created_at:  column.text({ default: NOW }),
    updated_at:  column.text({ default: NOW }),
  },
});

// ── Services ─────────────────────────────────────────────────────────────────

const Services = defineTable({
  columns: {
    id:                column.text({ primaryKey: true }),
    name:              column.text(),
    slug:              column.text({ optional: true }),
    tagline:           column.text({ optional: true }),
    description:       column.text({ optional: true }),
    short_desc:        column.text({ optional: true }),
    service_type:      column.text({ default: 'one_time' }),
    delivery_mode:     column.text({ default: 'online' }),
    status:            column.text({ default: 'draft' }),
    is_featured:       column.boolean({ default: false }),
    sort_order:        column.number({ default: 0 }),
    published_at:      column.text({ optional: true }),
    duration:          column.text({ optional: true }),
    revisions:         column.text({ optional: true }),
    is_remote:         column.boolean({ default: true }),
    location_address:  column.text({ optional: true }),
    availability_note: column.text({ optional: true }),
    provider_id:       column.text({ optional: true }),
    provider_name:     column.text({ optional: true }),
    team_size:         column.number({ optional: true }),
    years_experience:  column.number({ optional: true }),
    rating:            column.number({ optional: true }),
    review_count:      column.number({ optional: true }),
    category_ids:      column.json({ default: [] }),
    tags:              column.json({ default: [] }),
    images:            column.json({ default: [] }),
    videos:            column.json({ default: [] }),
    pricing:           column.json({ optional: true }),
    packages:          column.json({ default: [] }),
    addons:            column.json({ default: [] }),
    deliverables:      column.json({ default: [] }),
    process_steps:     column.json({ default: [] }),
    service_areas:     column.json({ default: [] }),
    booking:           column.json({ optional: true }),
    testimonials:      column.json({ default: [] }),
    faqs:              column.json({ default: [] }),
    certifications:    column.json({ default: [] }),
    portfolio_urls:    column.json({ default: [] }),
    attributes:        column.json({ default: [] }),
    related_ids:       column.json({ default: [] }),
    seo:               column.json({ optional: true }),
    meta:              column.json({ optional: true }),
    created_at:        column.text({ default: NOW }),
    updated_at:        column.text({ default: NOW }),
  },
});

// ── Cart ─────────────────────────────────────────────────────────────────────

const Cart = defineTable({
  columns: {
    id:          column.text({ primaryKey: true }),
    customer_id: column.text({ optional: true }),
    session_id:  column.text({ optional: true }),
    status:      column.text({ default: 'active' }),  // active|abandoned|merged|ordered
    currency:    column.text({ default: 'INR' }),
    order_note:  column.text({ optional: true }),
    meta:        column.json({ optional: true }),
    created_at:  column.text({ default: NOW }),
    updated_at:  column.text({ default: NOW }),
  },
});

// ── CartItem ─────────────────────────────────────────────────────────────────

const CartItem = defineTable({
  columns: {
    id:             column.text({ primaryKey: true }),
    cart_id:        column.text({ references: () => Cart.columns.id }),
    item_type:      column.text({ default: 'product' }),  // product|service|addon|fee|discount
    ref_id:         column.text(),
    variant_id:     column.text({ optional: true }),
    package_id:     column.text({ optional: true }),
    name:           column.text(),
    image_url:      column.text({ optional: true }),
    sku:            column.text({ optional: true }),
    slug:           column.text({ optional: true }),
    unit_price:     column.number(),
    compare_at:     column.number({ optional: true }),
    currency:       column.text({ default: 'INR' }),
    quantity:       column.number({ default: 1 }),
    tax_rate:       column.number({ default: 0 }),
    tax_inclusive:  column.boolean({ default: true }),
    custom_options: column.json({ optional: true }),
    note:           column.text({ optional: true }),
    created_at:     column.text({ default: NOW }),
  },
});

// ── Orders ───────────────────────────────────────────────────────────────────

const Orders = defineTable({
  columns: {
    id:               column.text({ primaryKey: true }),
    order_number:     column.text({ unique: true }),
    cart_id:          column.text({ optional: true }),
    customer_id:      column.text({ optional: true }),
    customer_email:   column.text({ optional: true }),
    customer_phone:   column.text({ optional: true }),
    status:           column.text({ default: 'pending' }),
    currency:         column.text({ default: 'INR' }),
    customer_note:    column.text({ optional: true }),
    internal_note:    column.text({ optional: true }),
    confirmed_at:     column.text({ optional: true }),
    shipped_at:       column.text({ optional: true }),
    delivered_at:     column.text({ optional: true }),
    completed_at:     column.text({ optional: true }),
    cancelled_at:     column.text({ optional: true }),
    contact:          column.json({ optional: true }),
    billing_address:  column.json({ optional: true }),
    shipping_address: column.json({ optional: true }),
    totals:           column.json({ optional: true }),
    applied_discounts:column.json({ default: [] }),
    shipping_method:  column.json({ optional: true }),
    payment:          column.json({ optional: true }),
    tracking_number:  column.text({ optional: true }),
    tracking_url:     column.text({ optional: true }),
    meta:             column.json({ optional: true }),
    created_at:       column.text({ default: NOW }),
    updated_at:       column.text({ default: NOW }),
  },
});

// ── OrderItem ─────────────────────────────────────────────────────────────────

const OrderItem = defineTable({
  columns: {
    id:             column.text({ primaryKey: true }),
    order_id:       column.text({ references: () => Orders.columns.id }),
    item_type:      column.text({ default: 'product' }),
    ref_id:         column.text(),
    variant_id:     column.text({ optional: true }),
    package_id:     column.text({ optional: true }),
    name:           column.text(),
    image_url:      column.text({ optional: true }),
    sku:            column.text({ optional: true }),
    slug:           column.text({ optional: true }),
    unit_price:     column.number(),
    compare_at:     column.number({ optional: true }),
    currency:       column.text({ default: 'INR' }),
    quantity:       column.number({ default: 1 }),
    tax_rate:       column.number({ default: 0 }),
    tax_inclusive:  column.boolean({ default: true }),
    custom_options: column.json({ optional: true }),
    note:           column.text({ optional: true }),
  },
});

// ── Inquiry ───────────────────────────────────────────────────────────────────

const Inquiry = defineTable({
  columns: {
    id:                column.text({ primaryKey: true }),
    company:           column.text({ optional: true }),
    gstin:             column.text({ optional: true }),
    message:           column.text({ optional: true }),
    budget:            column.text({ optional: true }),
    timeline:          column.text({ optional: true }),
    status:            column.text({ default: 'new' }),  // new|read|replied|converted|closed|spam
    assigned_to:       column.text({ optional: true }),
    source:            column.text({ optional: true }),
    currency:          column.text({ default: 'INR' }),
    quoted_amount:     column.number({ optional: true }),
    responded_at:      column.text({ optional: true }),
    quote_valid_until: column.text({ optional: true }),
    contact:           column.json({ optional: true }),
    address:           column.json({ optional: true }),
    requirements:      column.json({ optional: true }),
    meta:              column.json({ optional: true }),
    created_at:        column.text({ default: NOW }),
    updated_at:        column.text({ default: NOW }),
  },
});

// ── InquiryItem ───────────────────────────────────────────────────────────────

const InquiryItem = defineTable({
  columns: {
    id:         column.text({ primaryKey: true }),
    inquiry_id: column.text({ references: () => Inquiry.columns.id }),
    ref_type:   column.text(),   // product | service
    ref_id:     column.text(),
    name:       column.text(),
    quantity:   column.number({ optional: true }),
    note:       column.text({ optional: true }),
  },
});

// ── Export ────────────────────────────────────────────────────────────────────

export default defineDb({
  tables: {
    // Site layer
    User, SiteConfig, Media,
    Page, PageContent, SeoMeta,
    Menu, MenuItem,
    ContentAuthor, ContentCollection, ContentDocument,
    Redirect,
    // Catalog layer
    CatalogConfig,
    Products, Categories, Services,
    Cart, CartItem,
    Orders, OrderItem,
    Inquiry, InquiryItem,
  },
});
