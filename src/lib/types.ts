
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
};

export type Zone = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  userType: 'Admin Staff' | 'Office Staff';
  designation: string;
  canViewInvoice: boolean;
  canReceivePayment: boolean;
  enabled: boolean;
};
