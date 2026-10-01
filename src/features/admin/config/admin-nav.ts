import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  Layers,
  MessageSquareQuote,
  Settings,
  ShoppingBag,
  Shirt,
  TicketPercent,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** False until the screen is built; shown as "Soon" and not clickable. */
  ready: boolean;
  badge?: string;
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

/** Remembers the desktop sidebar state ("collapsed" | "expanded") so the server renders it without a flash. */
export const ADMIN_SIDEBAR_COOKIE = "adm_sidebar";

export const adminNav: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, ready: true },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, ready: false },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag, ready: false, badge: "12" },
      { label: "Products", href: "/admin/products", icon: Shirt, ready: false },
      { label: "Collections", href: "/admin/collections", icon: Layers, ready: false },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes, ready: false },
      { label: "Customers", href: "/admin/customers", icon: Users, ready: false },
      { label: "Discounts", href: "/admin/discounts", icon: TicketPercent, ready: false },
    ],
  },
  {
    label: "Storefront",
    items: [
      { label: "Content", href: "/admin/content", icon: FileText, ready: false },
      { label: "Reviews", href: "/admin/reviews", icon: MessageSquareQuote, ready: false },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings, ready: false }],
  },
];
