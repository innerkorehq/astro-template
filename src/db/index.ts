export {
  // Site layer
  getSiteConfig,
  getPageByPath,
  getPageTree,
  getChildPages,
  getMenu,
  getSeoMeta,
  // Content layer
  getDocument,
  getDocumentBySlug,
  listDocuments,
  listContentCards,
  getContentCollection,
  listContentCollections,
  getContentAuthor,
  listContentAuthors,
} from './client.js';

export type { ListDocumentsOptions } from './client.js';

export type {
  // Site layer
  SiteConfig,
  Page, PageType, PageStatus,
  PageContent, PageWithContent,
  ContentBlock, BodyFormat,
  SeoMeta,
  Menu, MenuItem, MenuItemType, MenuItemWithChildren, MenuWithItems,
  Media,
  User, UserRole,
  // Content layer
  ContentType, ContentStatus, AudienceLevel, SchemaOrgType,
  ContentDocument, ContentCard,
  ContentCollection,
  ContentAuthor,
  SocialMeta, ContentFeedback,
  BreadcrumbItem, TOCEntry,
  ContentRef, ContentVersion,
} from './types.js';
