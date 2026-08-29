import type { IconName } from "../icons";

export type ToolStatus = "Live" | "Preview" | "Service" | "Internal";
export type ToolVisibility = "public" | "protected" | "local";

export interface ToolDefinition {
  id: string;
  name: string;
  icon: IconName;
  status: ToolStatus;
  visibility: ToolVisibility;
  audience: string;
  summary: string;
  value: string;
  sitePath?: string;
  sourceUrl?: string;
  clientBrandMode: "dinero-hwy" | "client-with-dinero-credit";
  dataClass: "public" | "lead" | "client" | "operations";
}

export interface ServiceDefinition {
  id: string;
  name: string;
  icon: IconName;
  path: string;
  promise: string;
  description: string;
  toolIds: string[];
}

const REPO = "https://github.com/seabassbroil-star/dinerohwy/tree/main";

export const toolPortfolio: ToolDefinition[] = [
  {
    id: "report-card",
    name: "Website Report Card",
    icon: "seo",
    status: "Live",
    visibility: "public",
    audience: "Business owners",
    summary: "Grades the trust, mobile, search, content, and performance basics of a business website.",
    value: "Turns a vague website concern into a short, useful fix list.",
    sitePath: "/report-card",
    sourceUrl: `${REPO}/site/src/lib/report.ts`,
    clientBrandMode: "dinero-hwy",
    dataClass: "lead",
  },
  {
    id: "ai-copy",
    name: "AI Copy Assistant",
    icon: "assistant",
    status: "Live",
    visibility: "public",
    audience: "Local businesses",
    summary: "Drafts search descriptions, Google Business posts, and review replies after verified access.",
    value: "Creates useful marketing copy before the first meeting.",
    sitePath: "/tools/ai-copy",
    sourceUrl: `${REPO}/site/src/pages/api/ai-draft.ts`,
    clientBrandMode: "dinero-hwy",
    dataClass: "lead",
  },
  {
    id: "markup",
    name: "Markup Visual Review",
    icon: "review",
    status: "Preview",
    visibility: "public",
    audience: "Clients and reviewers",
    summary: "Annotates a screenshot and exports clear visual feedback without uploading the image.",
    value: "Replaces scattered notes with feedback tied to the exact spot being discussed.",
    sitePath: "/tools/markup",
    clientBrandMode: "dinero-hwy",
    dataClass: "lead",
  },
  {
    id: "menu-builder",
    name: "Menu & Checkout Builder",
    icon: "ordering",
    status: "Preview",
    visibility: "public",
    audience: "Food, retail, and product businesses",
    summary: "Turns a menu image, PDF, or CSV into an editable catalog and safe cart preview.",
    value: "Lets an owner see their own products in an ordering experience before commissioning the build.",
    sitePath: "/tools/menu",
    clientBrandMode: "client-with-dinero-credit",
    dataClass: "client",
  },
  {
    id: "booking",
    name: "Real-time Booking",
    icon: "book",
    status: "Live",
    visibility: "public",
    audience: "Appointment businesses",
    summary: "Demonstrates coordinated availability and double-booking protection in real time.",
    value: "Shows how scheduling can live directly on a client's website.",
    sitePath: "/booking-demo",
    sourceUrl: `${REPO}/workers/booking`,
    clientBrandMode: "client-with-dinero-credit",
    dataClass: "client",
  },
  {
    id: "site-kit",
    name: "Site Kit",
    icon: "website",
    status: "Service",
    visibility: "public",
    audience: "Owner-operated local businesses",
    summary: "A delivery system for building the right website around an owner's goals and budget.",
    value: "Starts with affordable digital real estate and grows only when the business needs more.",
    sitePath: "/services/websites",
    clientBrandMode: "client-with-dinero-credit",
    dataClass: "client",
  },
  {
    id: "quote-capture",
    name: "Quote Capture",
    icon: "quote",
    status: "Service",
    visibility: "public",
    audience: "Service and custom-order businesses",
    summary: "Collects job details and photos so an owner can respond with a responsible quote faster.",
    value: "Reduces back-and-forth and qualifies the opportunity before the owner travels.",
    sitePath: "/services/quotes",
    clientBrandMode: "client-with-dinero-credit",
    dataClass: "client",
  },
  {
    id: "follow-up",
    name: "Lead & Follow-up Engine",
    icon: "email",
    status: "Service",
    visibility: "protected",
    audience: "Dinero Hwy clients",
    summary: "Captures consented leads, routes them to the owner, and runs a managed follow-up sequence.",
    value: "Keeps a useful conversation moving after the first visit.",
    sitePath: "/services/automation",
    sourceUrl: `${REPO}/workers/mailer`,
    clientBrandMode: "client-with-dinero-credit",
    dataClass: "lead",
  },
  {
    id: "seo-lab",
    name: "SEO Workflow Lab",
    icon: "seo",
    status: "Internal",
    visibility: "protected",
    audience: "Dinero Hwy operators and approved clients",
    summary: "Plans and validates search work without exposing client operations publicly.",
    value: "Turns local visibility work into a repeatable, reviewable delivery process.",
    sitePath: "/services/visibility",
    clientBrandMode: "dinero-hwy",
    dataClass: "client",
  },
  {
    id: "fieldwork",
    name: "Fieldwork",
    icon: "route",
    status: "Internal",
    visibility: "local",
    audience: "Dinero Hwy operators",
    summary: "Organizes prospects, local outreach, opportunities, and revenue follow-through.",
    value: "Supports the in-person sales motion without exposing prospect data.",
    clientBrandMode: "dinero-hwy",
    dataClass: "operations",
  },
  {
    id: "research-desk",
    name: "Research Desk",
    icon: "intel",
    status: "Internal",
    visibility: "local",
    audience: "Dinero Hwy operators",
    summary: "Coordinates research and content preparation for client and publishing work.",
    value: "Makes evidence-backed content easier to prepare and review.",
    sitePath: "/services/visibility",
    clientBrandMode: "dinero-hwy",
    dataClass: "operations",
  },
  {
    id: "campaign-desk",
    name: "Campaign Desk",
    icon: "assistant",
    status: "Internal",
    visibility: "local",
    audience: "Dinero Hwy operators",
    summary: "Prepares and schedules approved campaign work while account controls stay private.",
    value: "Keeps a business visible without requiring the owner to live in social apps.",
    sitePath: "/services/visibility",
    clientBrandMode: "dinero-hwy",
    dataClass: "operations",
  },
  {
    id: "tools-dashboard",
    name: "Tools Dashboard",
    icon: "menu",
    status: "Internal",
    visibility: "local",
    audience: "Dinero Hwy operators",
    summary: "A local control room for starting, checking, and coordinating the tool portfolio.",
    value: "Reduces operational friction as the number of tools grows.",
    clientBrandMode: "dinero-hwy",
    dataClass: "operations",
  },
  {
    id: "workspace-mcp",
    name: "Workspace MCP",
    icon: "code",
    status: "Internal",
    visibility: "local",
    audience: "Dinero Hwy automation",
    summary: "Gives approved AI workflows a narrow, controlled doorway into workspace actions and information.",
    value: "Connects automation to real work without turning the workspace into a public application.",
    clientBrandMode: "dinero-hwy",
    dataClass: "operations",
  },
  {
    id: "shared-foundations",
    name: "Shared Platform Foundations",
    icon: "cloud",
    status: "Internal",
    visibility: "protected",
    audience: "Dinero Hwy engineering",
    summary: "Shared branding, email, storage, security, and deployment patterns used across tools.",
    value: "Makes client builds faster and more consistent without duplicating sensitive infrastructure.",
    clientBrandMode: "dinero-hwy",
    dataClass: "operations",
  },
];

export const servicePortfolio: ServiceDefinition[] = [
  {
    id: "websites",
    name: "Websites & Digital Real Estate",
    icon: "website",
    path: "/services/websites",
    promise: "Start with the site the business actually needs.",
    description: "A live hours-and-about site is a different job from a storefront, booking system, or ordering operation. Scope and price follow the owner's real expectations.",
    toolIds: ["site-kit", "report-card"],
  },
  {
    id: "ordering",
    name: "Menus, Carts & Ordering",
    icon: "ordering",
    path: "/services/ordering",
    promise: "Build the order flow around the way the business fulfills it.",
    description: "Made-to-order food, stocked products, deposits, and approval-first work require different checkout, notification, and owner workflows.",
    toolIds: ["menu-builder"],
  },
  {
    id: "quotes",
    name: "Fast Quote Intake",
    icon: "quote",
    path: "/services/quotes",
    promise: "Give the owner enough context to quote responsibly.",
    description: "Customers can describe the work and provide photos while the owner keeps control of pricing, availability, and the final promise.",
    toolIds: ["quote-capture"],
  },
  {
    id: "visibility",
    name: "Visibility & Content",
    icon: "seo",
    path: "/services/visibility",
    promise: "Make useful local visibility work repeatable.",
    description: "Research, search planning, content preparation, and approved campaign work operate as one managed Dinero Hwy delivery system.",
    toolIds: ["seo-lab", "research-desk", "campaign-desk", "ai-copy"],
  },
  {
    id: "automation",
    name: "Business Workflow Automation",
    icon: "route",
    path: "/services/automation",
    promise: "Streamline the bottleneck after the digital foundation is working.",
    description: "Lead follow-up, booking, intake, reporting, and custom workflows are configured around the owner's operation instead of forcing a generic SaaS process.",
    toolIds: ["follow-up", "booking", "workspace-mcp", "shared-foundations"],
  },
];

export function toolsByStatus(status: ToolStatus): ToolDefinition[] {
  return toolPortfolio.filter((tool) => tool.status === status);
}

export function toolsForService(service: ServiceDefinition): ToolDefinition[] {
  return service.toolIds
    .map((id) => toolPortfolio.find((tool) => tool.id === id))
    .filter((tool): tool is ToolDefinition => Boolean(tool));
}
