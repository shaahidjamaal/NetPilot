
export type Package = {
  name: string;
  description?: string;
  price: number;
  validity: number;
  downloadSpeed: number;
  uploadSpeed: number;
  dataLimit: string;
  users?: string;
  burstEnabled?: boolean;
  burstDownloadSpeed?: number;
  burstUploadSpeed?: number;
  burstThresholdDownload?: number;
  burstThresholdUpload?: number;
  burstTime?: number;
}

export type CustomerStatus = "Active" | "Suspended" | "Inactive";

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  servicePackage: string;
  status: CustomerStatus;
  joined: string; // Should be ISO date string
  permanentAddress: string;
  installationAddress: string;
  aadharNumber: string;
  zone?: string;
};

export type Zone = {
  id: string;
  name: string;
};
