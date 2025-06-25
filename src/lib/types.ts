
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
