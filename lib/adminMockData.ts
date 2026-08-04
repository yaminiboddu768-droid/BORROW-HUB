export interface AdminPartnerKYC {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  gstin: string;
  registrationNumber: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Correction';
  riskScore: 'Low' | 'Medium' | 'High';
  storeAddress: string;
  city: string;
  documents: {
    gstCertificate: string;
    tradeLicense: string;
    identityProof: string;
    storefrontPhoto: string;
  };
  rejectionReason?: string;
  verifiedAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Borrower' | 'Lender' | 'Business Partner' | 'Admin';
  status: 'Active' | 'Suspended' | 'Flagged' | 'Pending KYC';
  joinDate: string;
  totalBorrows: number;
  totalLends: number;
  trustScore: number;
  avatarUrl?: string;
  location: string;
  idVerified: boolean;
}

export interface AdminBusinessPartner {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  totalListings: number;
  totalRentalsCompleted: number;
  gmvGenerated: number;
  commissionRate: number; // e.g. 8.5%
  verificationStatus: 'Verified' | 'Pending Review' | 'Frozen';
  payoutStatus: 'Up to Date' | 'Pending Payout';
  joinedDate: string;
}

export interface AdminListing {
  id: string;
  title: string;
  type: 'Neighbourhood' | 'Partner Rental';
  category: string;
  ownerOrStore: string;
  pricePerDay: number;
  depositAmount: number;
  status: 'Active' | 'Flagged' | 'Paused' | 'Removed';
  totalBorrows: number;
  rating: number;
  createdAt: string;
  flagReason?: string;
  isFeatured: boolean;
  imageUrl: string;
}

export interface AdminRequestOrder {
  id: string;
  type: 'Neighbourhood Borrow' | 'Partner Rental';
  itemTitle: string;
  borrowerName: string;
  lenderOrStore: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount: number;
  orderStatus: 'Requested' | 'Approved' | 'Out for Delivery' | 'Active' | 'Returned' | 'Disputed';
  depositStatus: 'Held' | 'Refunded' | 'Deducted' | 'Pending';
  createdAt: string;
}

export interface AdminReportDispute {
  id: string;
  ticketNumber: string;
  type: 'Damaged Item' | 'Overdue Return' | 'Fraudulent Listing' | 'Harassment' | 'Payment Issue';
  reporterName: string;
  reportedTarget: string;
  itemTitle?: string;
  description: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  createdAt: string;
  resolutionNotes?: string;
}

export interface AdminAnalyticsData {
  monthlyGMV: { month: string; gmv: number; revenue: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  topLocations: { city: string; activeUsers: number; totalBorrows: number }[];
}

export interface AdminSystemSettings {
  platformCommissionRate: number; // percentage
  defaultSecurityDepositPct: number;
  autoApproveNeighbourListings: boolean;
  autoKycValidation: boolean;
  maintenanceMode: boolean;
  notifyOnDispute: boolean;
  requireIdForRentals: boolean;
  maxBorrowDaysLimit: number;
  supportEmail: string;
  systemVersion: string;
}

// ----------------------------------------------------
// SAMPLE DEMO DATA FOR ADMIN PORTAL
// ----------------------------------------------------

export const INITIAL_ADMIN_KYC_REQUESTS: AdminPartnerKYC[] = [
  {
    id: 'kyc-201',
    businessName: 'Apex Camera & Rig Rentals',
    ownerName: 'Vikram Sethi',
    email: 'vikram@apexcamera.com',
    phone: '+91 98765 43210',
    category: 'Cameras & Audio',
    gstin: '29ABCDE1234F1Z5',
    registrationNumber: 'KA-BLR-2023-8849',
    appliedDate: '2026-08-02',
    status: 'Pending',
    riskScore: 'Low',
    storeAddress: '104, 100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    documents: {
      gstCertificate: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600',
      tradeLicense: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600',
      identityProof: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600',
      storefrontPhoto: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600',
    },
  },
  {
    id: 'kyc-202',
    businessName: 'GearQuest Outdoor Equipment',
    ownerName: 'Neha Sharma',
    email: 'contact@gearquest.in',
    phone: '+91 91234 56789',
    category: 'Outdoors & Camping',
    gstin: '27XYZAB9876C1Z2',
    registrationNumber: 'MH-MUM-2024-1102',
    appliedDate: '2026-08-01',
    status: 'Pending',
    riskScore: 'Low',
    storeAddress: '24, Bandra Kurla Complex',
    city: 'Mumbai',
    documents: {
      gstCertificate: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600',
      tradeLicense: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600',
      identityProof: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600',
      storefrontPhoto: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600',
    },
  },
  {
    id: 'kyc-203',
    businessName: 'Electra Tools & Machinery',
    ownerName: 'Rajesh Verma',
    email: 'sales@electratools.com',
    phone: '+91 99887 76655',
    category: 'Tools & Construction',
    gstin: '07QQWEE4455R1Z9',
    registrationNumber: 'DL-ND-2022-7741',
    appliedDate: '2026-07-29',
    status: 'Pending',
    riskScore: 'Medium',
    storeAddress: '88, Nehru Place Market',
    city: 'New Delhi',
    documents: {
      gstCertificate: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600',
      tradeLicense: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600',
      identityProof: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600',
      storefrontPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600',
    },
  },
  {
    id: 'kyc-204',
    businessName: 'RentMyGear Partner Store',
    ownerName: 'Amitabh Roy',
    email: 'partner@rentmygear.com',
    phone: '+91 98450 11223',
    category: 'Electronics & Audio',
    gstin: '29AAACR5566K1Z1',
    registrationNumber: 'KA-BLR-2021-0092',
    appliedDate: '2026-06-15',
    status: 'Approved',
    riskScore: 'Low',
    storeAddress: '12, MG Road Plaza',
    city: 'Bengaluru',
    documents: {
      gstCertificate: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600',
      tradeLicense: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600',
      identityProof: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600',
      storefrontPhoto: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600',
    },
    verifiedAt: '2026-06-18',
  },
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-101',
    name: 'Aarav Mehta',
    email: 'aarav.m@gmail.com',
    phone: '+91 98112 33445',
    role: 'Borrower',
    status: 'Active',
    joinDate: '2026-01-12',
    totalBorrows: 14,
    totalLends: 2,
    trustScore: 4.9,
    location: 'Koramangala, Bengaluru',
    idVerified: true,
  },
  {
    id: 'usr-102',
    name: 'Priya Sundaram',
    email: 'priya.sun@outlook.com',
    phone: '+91 97445 66778',
    role: 'Lender',
    status: 'Active',
    joinDate: '2025-11-04',
    totalBorrows: 5,
    totalLends: 29,
    trustScore: 4.95,
    location: 'HSR Layout, Bengaluru',
    idVerified: true,
  },
  {
    id: 'usr-103',
    name: 'GamerRent Official',
    email: 'contact@gamerrent.io',
    phone: '+91 99001 88223',
    role: 'Business Partner',
    status: 'Active',
    joinDate: '2025-09-20',
    totalBorrows: 0,
    totalLends: 142,
    trustScore: 4.8,
    location: 'Whitefield, Bengaluru',
    idVerified: true,
  },
  {
    id: 'usr-104',
    name: 'Karan Malhotra',
    email: 'karan.malhotra99@yahoo.com',
    phone: '+91 93221 44556',
    role: 'Borrower',
    status: 'Flagged',
    joinDate: '2026-05-18',
    totalBorrows: 3,
    totalLends: 0,
    trustScore: 3.2,
    location: 'Powai, Mumbai',
    idVerified: false,
  },
  {
    id: 'usr-105',
    name: 'Rohan Gupta',
    email: 'rohan.g@techcorp.com',
    phone: '+91 98760 12345',
    role: 'Borrower',
    status: 'Suspended',
    joinDate: '2026-03-01',
    totalBorrows: 1,
    totalLends: 0,
    trustScore: 2.1,
    location: 'Cyber City, Gurugram',
    idVerified: true,
  },
];

export const INITIAL_ADMIN_BUSINESS_PARTNERS: AdminBusinessPartner[] = [
  {
    id: 'bp-301',
    storeName: 'RentMyGear Partner',
    ownerName: 'Amitabh Roy',
    email: 'partner@rentmygear.com',
    phone: '+91 98450 11223',
    category: 'Electronics & Cameras',
    rating: 4.9,
    totalListings: 24,
    totalRentalsCompleted: 186,
    gmvGenerated: 245000,
    commissionRate: 8.5,
    verificationStatus: 'Verified',
    payoutStatus: 'Up to Date',
    joinedDate: '2025-08-10',
  },
  {
    id: 'bp-302',
    storeName: 'GamerRent Partner',
    ownerName: 'Siddharth Nair',
    email: 'admin@gamerrent.io',
    phone: '+91 99001 88223',
    category: 'Gaming Consoles & VR',
    rating: 4.8,
    totalListings: 18,
    totalRentalsCompleted: 142,
    gmvGenerated: 189000,
    commissionRate: 10.0,
    verificationStatus: 'Verified',
    payoutStatus: 'Up to Date',
    joinedDate: '2025-09-20',
  },
  {
    id: 'bp-303',
    storeName: 'ProTools Commercial Hub',
    ownerName: 'Vikramaditya Rao',
    email: 'info@protoolshub.com',
    phone: '+91 91122 33445',
    category: 'Construction & Power Tools',
    rating: 4.7,
    totalListings: 42,
    totalRentalsCompleted: 98,
    gmvGenerated: 156000,
    commissionRate: 7.5,
    verificationStatus: 'Verified',
    payoutStatus: 'Pending Payout',
    joinedDate: '2026-02-14',
  },
  {
    id: 'bp-304',
    storeName: 'Apex Camera & Rig Rentals',
    ownerName: 'Vikram Sethi',
    email: 'vikram@apexcamera.com',
    phone: '+91 98765 43210',
    category: 'Cameras & Audio',
    rating: 0.0,
    totalListings: 0,
    totalRentalsCompleted: 0,
    gmvGenerated: 0,
    commissionRate: 8.5,
    verificationStatus: 'Pending Review',
    payoutStatus: 'Up to Date',
    joinedDate: '2026-08-02',
  },
];

export const INITIAL_ADMIN_LISTINGS: AdminListing[] = [
  {
    id: 'item-online-1',
    title: 'DSLR Camera Canon 5D Mark IV',
    type: 'Partner Rental',
    category: 'Cameras',
    ownerOrStore: 'RentMyGear Partner',
    pricePerDay: 2000,
    depositAmount: 15000,
    status: 'Active',
    totalBorrows: 48,
    rating: 4.9,
    createdAt: '2025-10-12',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'item-online-2',
    title: 'Sony PS5 Console + 2 Controllers',
    type: 'Partner Rental',
    category: 'Electronics',
    ownerOrStore: 'GamerRent Partner',
    pricePerDay: 1250,
    depositAmount: 8000,
    status: 'Active',
    totalBorrows: 62,
    rating: 4.8,
    createdAt: '2025-11-01',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'item-1',
    title: 'Bosch Professional Cordless Drill Set 18V',
    type: 'Neighbourhood',
    category: 'Tools',
    ownerOrStore: 'Priya Sundaram (Neighbour)',
    pricePerDay: 350,
    depositAmount: 2000,
    status: 'Active',
    totalBorrows: 19,
    rating: 4.9,
    createdAt: '2026-01-05',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'item-999',
    title: 'Industrial Heavy Jackhammer 3000W',
    type: 'Neighbourhood',
    category: 'Tools',
    ownerOrStore: 'Karan Malhotra',
    pricePerDay: 1800,
    depositAmount: 10000,
    status: 'Flagged',
    totalBorrows: 1,
    rating: 2.0,
    createdAt: '2026-05-20',
    flagReason: 'Reported: Unsafe condition & unregistered commercial seller',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
  },
];

export const INITIAL_ADMIN_REQUESTS: AdminRequestOrder[] = [
  {
    id: 'ord-1001',
    type: 'Partner Rental',
    itemTitle: 'DSLR Camera Canon 5D Mark IV',
    borrowerName: 'Aarav Mehta',
    lenderOrStore: 'RentMyGear Partner',
    startDate: '2026-08-02',
    endDate: '2026-08-07',
    totalAmount: 10099,
    depositAmount: 15000,
    orderStatus: 'Active',
    depositStatus: 'Held',
    createdAt: '2026-08-02',
  },
  {
    id: 'ord-1002',
    type: 'Partner Rental',
    itemTitle: 'Sony PS5 Console + 2 DualSense Controllers',
    borrowerName: 'Ananya Roy',
    lenderOrStore: 'GamerRent Partner',
    startDate: '2026-07-25',
    endDate: '2026-07-31',
    totalAmount: 7798,
    depositAmount: 8000,
    orderStatus: 'Returned',
    depositStatus: 'Refunded',
    createdAt: '2026-07-24',
  },
  {
    id: 'br-501',
    type: 'Neighbourhood Borrow',
    itemTitle: 'Bosch Professional Cordless Drill Set 18V',
    borrowerName: 'Rahul Verma',
    lenderOrStore: 'Priya Sundaram',
    startDate: '2026-08-03',
    endDate: '2026-08-05',
    totalAmount: 700,
    depositAmount: 2000,
    orderStatus: 'Approved',
    depositStatus: 'Held',
    createdAt: '2026-08-03',
  },
];

export const INITIAL_ADMIN_REPORTS: AdminReportDispute[] = [
  {
    id: 'rep-401',
    ticketNumber: 'DIS-2026-089',
    type: 'Damaged Item',
    reporterName: 'Priya Sundaram',
    reportedTarget: 'Karan Malhotra',
    itemTitle: 'Bosch Cordless Drill Set',
    description: 'Drill bit chuck returned broken and battery casing cracked after 2 days rental.',
    status: 'Open',
    severity: 'High',
    createdAt: '2026-08-03',
  },
  {
    id: 'rep-402',
    ticketNumber: 'DIS-2026-074',
    type: 'Overdue Return',
    reporterName: 'RentMyGear Partner',
    reportedTarget: 'Rohan Gupta',
    itemTitle: 'DJI Mavic 3 Pro Drone',
    description: 'Item overdue by 5 days. Borrower not answering calls or messages.',
    status: 'Under Investigation',
    severity: 'Critical',
    createdAt: '2026-07-30',
  },
  {
    id: 'rep-403',
    ticketNumber: 'DIS-2026-061',
    type: 'Fraudulent Listing',
    reporterName: 'System Auto-Flag',
    reportedTarget: 'Karan Malhotra',
    itemTitle: 'Industrial Heavy Jackhammer',
    description: 'Stock imagery detected with mismatched pricing and suspicious contact phone.',
    status: 'Resolved',
    severity: 'Medium',
    createdAt: '2026-07-28',
    resolutionNotes: 'Listing suspended and user warned.',
  },
];

export const INITIAL_ADMIN_ANALYTICS: AdminAnalyticsData = {
  monthlyGMV: [
    { month: 'Mar 2026', gmv: 280000, revenue: 23800 },
    { month: 'Apr 2026', gmv: 340000, revenue: 28900 },
    { month: 'May 2026', gmv: 395000, revenue: 33575 },
    { month: 'Jun 2026', gmv: 420000, revenue: 35700 },
    { month: 'Jul 2026', gmv: 465000, revenue: 39525 },
    { month: 'Aug 2026', gmv: 510000, revenue: 43350 },
  ],
  categoryDistribution: [
    { category: 'Electronics & Consoles', count: 320, percentage: 35 },
    { category: 'Cameras & Audio', count: 240, percentage: 26 },
    { category: 'Tools & Construction', count: 180, percentage: 20 },
    { category: 'Outdoors & Camping', count: 110, percentage: 12 },
    { category: 'Party & Appliances', count: 62, percentage: 7 },
  ],
  topLocations: [
    { city: 'Bengaluru', activeUsers: 840, totalBorrows: 3420 },
    { city: 'Mumbai', activeUsers: 390, totalBorrows: 1540 },
    { city: 'Delhi-NCR', activeUsers: 252, totalBorrows: 980 },
  ],
};

export const INITIAL_ADMIN_SETTINGS: AdminSystemSettings = {
  platformCommissionRate: 8.5,
  defaultSecurityDepositPct: 100,
  autoApproveNeighbourListings: true,
  autoKycValidation: false,
  maintenanceMode: false,
  notifyOnDispute: true,
  requireIdForRentals: true,
  maxBorrowDaysLimit: 30,
  supportEmail: 'admin-support@borrowhub.com',
  systemVersion: 'v2.4.0-admin',
};
