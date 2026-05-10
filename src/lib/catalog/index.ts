// Direct query helpers (non-collection tables)
export {
  getCatalogConfig,
  getCart, getActiveCart, createCart,
  addCartItem, updateCartItemQty, removeCartItem, computeCartTotals,
  getOrder, getOrderByNumber, listOrders,
  getInquiry, createInquiry, listInquiries, updateInquiryStatus,
} from './client.js';

// Types
export type {
  CurrencyCode, PriceType, PublishStatus, StockStatus, Pricing,
  SiteMode, CatalogConfig,
  CartStatus, CartItemType, CartItem, Cart, AppliedDiscount, CartTotals,
  OrderStatus, PaymentMethod, PaymentStatus, OrderItem, Order,
  InquiryStatus, InquiryItem, Inquiry,
} from './types.js';

// Loaders (used by content.config.ts — re-exported for convenience)
export { sqliteProductLoader, sqliteCategoryLoader, sqliteServiceLoader } from './loaders.js';
