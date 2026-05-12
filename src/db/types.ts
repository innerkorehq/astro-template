// TypeScript interfaces for all site DB rows.

// ── Scalar rows ───────────────────────────────────────────────────────────────

export interface SiteConfig {
  id: string;
  // master spec core
  name: string;
  domain: string | null;
  locale: string;
  timezone: string;
  status: 'active' | 'maintenance' | 'inactive';
  meta: Record<string, unknown>;        // parsed JSON (features, analytics, rss…)
  // extra scalar fields
  tagline: string | null;
  description: string | null;
  base_url: string | null;
  theme: string;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_github: string | null;
  social_youtube: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  contact: Record<string, unknown>;     // parsed JSON
  /** PageLayout variant — drives layout for all generated pages.
   *  One of: 'centered' | 'full-width' | 'sidebar-left' | 'sidebar-right' | 'sidebar-both' | 'holy-grail' | 'dashboard'
   *  Defaults to 'full-width' when null/undefined. */
  layout_variant: string | null;
  created_at: string;
  updated_at: string;
}

export type PageType   = 'page' | 'post' | 'landing' | 'redirect' | 'doc' | 'blog';
export type PageStatus = 'draft' | 'published' | 'archived';

export interface Page {
  id: string;
  parent_id: string | null;
  slug: string;
  path: string;
  type: PageType;
  template: string | null;
  status: PageStatus;
  position: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BodyFormat = 'markdown' | 'html' | 'mdx' | 'richtext' | 'plain';

export interface ContentBlock {
  id: string;
  type: string;
  content?: string;
  attrs?: Record<string, unknown>;
  children?: ContentBlock[];
}

export interface PageContent {
  id: string;
  page_id: string;
  locale: string;
  version: number;
  is_current: number;        // 0 | 1
  title: string;
  description: string | null;
  body: ContentBlock[];      // parsed JSON
  body_format: BodyFormat;
  created_at: string;
  created_by: string | null;
}

export interface SeoMeta {
  id: string;
  page_id: string;
  locale: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  noindex: number;           // 0 | 1
  nofollow: number;          // 0 | 1
  schema_org: string | null; // raw JSON-LD string
  updated_at: string;
}

export type MenuItemType =
  | 'link' | 'doc' | 'collection' | 'dropdown' | 'mega_menu' | 'divider' | 'button';

export interface Menu {
  id: string;
  handle: string;
  name: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  position: number;
  label: string;
  page_id: string | null;
  url: string | null;
  target: string | null;
  type: MenuItemType;
  icon: string | null;
  badge: string | null;
  badge_color: string | null;
  is_external: number;        // 0 | 1
  open_in_new_tab: number;    // 0 | 1
  is_cta: number;             // 0 | 1
  /** Joined from page.path — present in getMenu() results. */
  page_path?: string | null;
}

export interface Media {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  uploaded_at: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ── Composite types ───────────────────────────────────────────────────────────

/** Page joined with its current locale content. */
export interface PageWithContent extends Page {
  content: PageContent | null;
}

/** MenuItem with resolved children (tree built in app layer). */
export interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

/** Menu with its full item tree. */
export interface MenuWithItems extends Menu {
  items: MenuItemWithChildren[];
}

// ── Content layer types (document.py) ────────────────────────────────────────

// Maps ContentType enum from base.py
export type ContentType =
  | 'blog_post' | 'news_article' | 'press_release' | 'announcement'
  | 'doc_page' | 'guide' | 'tutorial' | 'knowledge_base' | 'faq_page' | 'glossary_term'
  | 'case_study' | 'white_paper' | 'landing_page' | 'pillar_page' | 'comparison'
  | 'changelog' | 'release_notes' | 'roadmap_item'
  | 'legal_page' | 'policy' | 'compliance_doc'
  | 'podcast_episode' | 'video' | 'webinar'
  | 'event' | 'newsletter' | 'job_listing'
  | 'custom';

// Maps ContentStatus enum from base.py
export type ContentStatus =
  | 'draft' | 'in_review' | 'scheduled' | 'published'
  | 'unlisted' | 'archived' | 'deleted';

// Maps AudienceLevel enum from base.py
export type AudienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all';

// Maps SchemaOrgType enum from base.py
export type SchemaOrgType =
  | 'Article' | 'NewsArticle' | 'BlogPosting' | 'HowTo' | 'FAQPage'
  | 'Event' | 'JobPosting' | 'Course' | 'VideoObject' | 'PodcastEpisode'
  | 'TechArticle' | 'Product' | 'Organization';

/** Maps SocialMeta from base.py */
export interface SocialMeta {
  og_title?: string;
  og_description?: string;
  og_image?: { url: string; alt?: string };
  twitter_card?: string;
  twitter_title?: string;
  twitter_desc?: string;
  twitter_image?: { url: string; alt?: string };
}

/** Maps ContentFeedback from base.py */
export interface ContentFeedback {
  helpful_count: number;
  not_helpful_count: number;
  view_count: number;
  share_count: number;
  comment_count: number;
  avg_rating: number | null;
  rating_count: number;
}

/** Maps BreadcrumbItem from base.py */
export interface BreadcrumbItem {
  label: string;
  url?: string | null;
}

/** Maps TOCEntry from base.py */
export interface TOCEntry {
  id: string;
  text: string;
  level: number;
  children: TOCEntry[];
}

/** Maps ContentRef from base.py (cross-document reference) */
export interface ContentRef {
  id: string;
  type: ContentType;
  title: string;
  slug?: string | null;
  image_url?: string | null;
  published_at?: string | null;
}

/** Maps ContentVersion from base.py */
export interface ContentVersion {
  version: string;
  label?: string | null;
  is_latest: boolean;
  is_deprecated: boolean;
  published_at?: string | null;
  changelog_url?: string | null;
}

/** Maps Author from base.py */
export interface ContentAuthor {
  id: string;
  name: string;
  slug: string | null;
  bio: string | null;
  avatar: { url: string; alt?: string } | null; // parsed JSON: MediaAsset
  role: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_github: string | null;
  website: string | null;
  is_external: number;               // 0 | 1
  contact: Record<string, unknown>;  // parsed JSON: ContactInfo
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Maps ContentCollection from document.py */
export interface ContentCollection {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  parent_id: string | null;
  content_type: ContentType | null;
  icon: string | null;
  cover: { url: string; alt?: string } | null; // parsed JSON: MediaAsset
  color: string | null;
  sort_order: number;
  is_featured: number;               // 0 | 1
  path: string | null;
  depth: number;
  seo: Record<string, unknown>;      // parsed JSON: SEOMeta
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Maps ContentDocument from document.py — universal CMS document. */
export interface ContentDocument {
  id: string;
  // Core identity
  content_type: ContentType;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  slug: string | null;
  locale: string;
  // Body
  body: string | null;
  body_format: BodyFormat;
  blocks: ContentBlock[];             // parsed JSON
  word_count: number | null;
  reading_time_mins: number | null;
  // Media
  cover_image: { url: string; alt?: string; aspectRatio?: number } | null; // parsed JSON
  og_image: { url: string; alt?: string } | null;                          // parsed JSON
  // Taxonomy
  collection_ids: string[];           // parsed JSON
  tags: { name: string; slug?: string; color?: string }[]; // parsed JSON
  topics: string[];                   // parsed JSON
  content_series: string | null;
  series_order: number | null;
  // Authorship
  authors: ContentAuthor[];           // parsed JSON (denormalised snapshot)
  reviewers: ContentAuthor[];         // parsed JSON
  organization: string | null;
  // Audience
  audience_level: AudienceLevel;
  target_roles: string[];             // parsed JSON
  target_industries: string[];        // parsed JSON
  // Status & visibility
  status: ContentStatus;
  is_featured: number;                // 0 | 1
  is_pinned: number;                  // 0 | 1
  is_premium: number;                 // 0 | 1
  is_sponsored: number;               // 0 | 1
  noindex: number;                    // 0 | 1
  password: string | null;
  // Scheduling
  published_at: string | null;
  updated_at_display: string | null;
  expires_at: string | null;
  scheduled_at: string | null;
  // Versioning
  version: string | null;
  versions: ContentVersion[];         // parsed JSON
  is_latest_version: number;          // 0 | 1
  deprecated: number;                 // 0 | 1
  deprecation_notice: string | null;
  migration_guide_url: string | null;
  // Navigation / structure
  breadcrumbs: BreadcrumbItem[];      // parsed JSON
  toc: TOCEntry[];                    // parsed JSON
  prev_doc: ContentRef | null;        // parsed JSON
  next_doc: ContentRef | null;        // parsed JSON
  parent_doc: ContentRef | null;      // parsed JSON
  // Related
  related: ContentRef[];              // parsed JSON
  canonical_url: string | null;
  // SEO & social
  seo: Record<string, unknown>;       // parsed JSON: SEOMeta
  social: SocialMeta;                 // parsed JSON
  schema_org_type: SchemaOrgType | null;
  // Feedback & engagement
  feedback: ContentFeedback;          // parsed JSON
  allow_comments: number;             // 0 | 1
  allow_reactions: number;            // 0 | 1
  // Source / attribution
  source_url: string | null;
  source_name: string | null;
  license: string | null;
  // Localisation
  translations: Record<string, string>; // parsed JSON: {locale: doc_id}
  is_translation: number;             // 0 | 1
  original_id: string | null;
  // Extension
  custom_fields: Record<string, unknown>;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Lightweight projection for list/grid views. Maps ContentCard from document.py. */
export interface ContentCard {
  id: string;
  content_type: ContentType;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  slug: string | null;
  locale: string;
  cover_url: string | null;
  status: ContentStatus;
  is_featured: number;
  is_premium: number;
  published_at: string | null;
  reading_time_mins: number | null;
  word_count: number | null;
  tags: { name: string; slug?: string; color?: string }[];
  collection_ids: string[];
  author_name: string | null;
  author_avatar: string | null;
  schema_org_type: SchemaOrgType | null;
}
