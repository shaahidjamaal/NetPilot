

export const allPermissions = [
  "manage_users",
  "manage_roles",
  "view_invoices",
  "generate_invoices",
  "receive_payments",
  "edit_customers",
  "renew_customers",
  "terminate_customers",
  "manage_packages",
  "manage_zones",
] as const;

export type Permission = (typeof allPermissions)[number];

export const permissionLabels: Record<Permission, string> = {
    manage_users: "Manage Users",
    manage_roles: "Manage Roles",
    view_invoices: "View Invoices",
    generate_invoices: "Generate Invoices",
    receive_payments: "Receive Payments",
    edit_customers: "Edit Customers",
    renew_customers: "Renew Customers",
    terminate_customers: "Terminate Customers",
    manage_packages: "Manage Packages",
    manage_zones: "Manage Zones",
};


export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
};

export type PackageType = "Home Package" | "Business Package" | "Wireless Package";

export type Package = {
  name: string;
  description?: string;
  price: number;
  validity: number;
  downloadSpeed: number;
  uploadSpeed: number;
  dataLimit: string;
  packageType: PackageType;
  users?: string;
  burstEnabled?: boolean;
  burstDownloadSpeed?: number;
  burstUploadSpeed?: number;
  burstThresholdDownload?: number;
  burstThresholdUpload?: number;
  burstTime?: number;
}

export type CustomerStatus = "Active" | "Suspended" | "Inactive";
export type CustomerType = "Home User" | "Business User" | "Wireless User";

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  servicePackage: string;
  status: CustomerStatus;
  customerType: CustomerType;
  joined: string; // Should be ISO date string
  permanentAddress: string;
  installationAddress: string;
  aadharNumber: string;
  zone?: string;
  dataTopUp?: number;
  lastRechargeDate?: string; // Should be ISO date string
  expiryDate?: string; // Should be ISO date string
  gstNumber?: string;
  pppoeUsername?: string;
  pppoePassword?: string;
  discount?: number;
};

export type Zone = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  password?: string;
  userType: 'Admin Staff' | 'Office Staff';
  designation: string;
  roleId: string;
  enabled: boolean;
};

export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue";

export type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: string; // ISO date string
  generatedDate: string; // ISO date string
  status: InvoiceStatus;
  packageName: string;
  packagePrice: number;
  discount: number;
  additionalCharges: number;
  // New fields for tax breakdown. Optional for backward compatibility.
  subtotal?: number;
  cgstAmount?: number;
  sgstAmount?: number;
};

export const inventoryCategories = ["Routers", "Switches", "Cabling", "Accessories"] as const;
export type InventoryCategory = (typeof inventoryCategories)[number];

export type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

export type PaymentStatus = "Completed" | "Pending" | "Failed";
export type PaymentMethod = "Online Gateway" | "Admin Renewal" | "Cash" | "Bank Transfer" | "Admin-Recorded";

export type Payment = {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string; // ISO Date String
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
};


export const idSuffixOptions = ['timestamp', 'date', 'month_year', 'year', 'random_4', 'none'] as const;
export type IdSuffixType = (typeof idSuffixOptions)[number];

export const idSuffixLabels: Record<IdSuffixType, string> = {
    timestamp: "Timestamp (e.g., 1672531200000)",
    date: "Date (e.g., 20230101)",
    month_year: "Month & Year (e.g., 012023)",
    year: "Year (e.g., 2023)",
    random_4: "4 Random Digits",
    none: "None"
};

export type AppSettings = {
  invoicePrefix: string;
  invoiceSuffix: IdSuffixType;
  customerIdPrefix: string;
  customerIdSuffix: IdSuffixType;
};

export type BillingProfile = {
  profileName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  gstNumber?: string;
  cgstRate: number;
  sgstRate: number;
  invoiceTerms?: string;
};

export const ticketStatuses = ["Open", "In Progress", "Closed"] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketPriorities = ["Low", "Medium", "High"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  customerId: string;
  customerName: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string; // Optional user ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export const leadStatuses = ["New", "Contacted", "Qualified", "Lost", "Converted"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leadSources = ["Walk-in", "Phone Call", "Website", "Referral", "Other"] as const;
export type LeadSource = (typeof leadSources)[number];

export type Lead = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assigneeId?: string; // Optional user ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};
