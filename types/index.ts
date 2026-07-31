export type ItemCategory = 
  | 'Tools' 
  | 'Electronics' 
  | 'Sports' 
  | 'Books' 
  | 'Cookware' 
  | 'Outdoors'
  | 'Cameras'
  | 'Party'
  | 'Appliances'
  | 'Vehicles'
  | 'Furniture';

export interface NeighbourhoodItem {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  pricePerDay: number;
  pricePerHour?: number;
  marketPrice?: number;
  securityDeposit?: number;
  lateReturnPenalty?: string | number;
  penaltyPerHour?: number;
  penaltyPerDay?: number;
  availabilityStatus?: 'Available' | 'Borrowed' | 'Maintenance' | string;
  ownerName: string;
  ownerRating: number;
  timesBorrowed: number;
  iconName: string;
  description?: string;
  availableToNeighbours: boolean;
  isCustom?: boolean;
  imageUrl?: string;
  imageUrls?: string[] | string;
}

export interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedRenter: boolean;
  helpfulCount: number;
}

export interface OnlineStoreItem {
  id: string;
  name: string;
  category: string;
  platformName: string;
  brand?: string;
  pricePerHour?: number;
  pricePerDay: number;
  pricePerWeek?: number;
  marketPrice?: number;
  depositAmount?: number;
  securityDeposit?: number;
  lateReturnPenalty?: string | number;
  penaltyPerHour?: number;
  penaltyPerDay?: number;
  availabilityStatus?: 'Available' | 'Borrowed' | 'Maintenance' | string;
  timesRented: number;
  timesBorrowed?: number;
  iconName: string;
  deliveryEstimate: string;
  rating: number;
  reviewCount?: number;
  description?: string;
  imageUrls?: string[];
  imageUrl?: string;
  condition?: string;
  specifications?: Record<string, string>;
  features?: string[];
  ownerVerified?: boolean;
  availableToShip?: boolean;
  pickupAvailable?: boolean;
  reviews?: ReviewItem[];
  cancellationPolicy?: string;
  damagePolicy?: string;
  latePenaltyFee?: string;
}

export type BorrowStatus = 'Requested' | 'Accepted' | 'Picked up' | 'Returned';

export type OnlineRentalStage =
  | 'Request Sent'
  | 'Owner Approved'
  | 'Payment Completed'
  | 'Sanitized & Packed'
  | 'Out for Delivery'
  | 'Borrowing Active'
  | 'Return Scheduled'
  | 'Item Returned'
  | 'Deposit Refunded';

export type DepositStatus = 'Held' | 'Refund Pending' | 'Refunded' | 'Deducted';

export interface OnlineRentalOrder {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  platformName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  rentalFee: number;
  depositAmount: number;
  platformFee: number;
  deliveryFee: number;
  totalPaid: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'REFUNDED';
  orderStatus: OnlineRentalStage;
  depositStatus: DepositStatus;
  createdAt: string;
  trackingNumber: string;
}

export interface BorrowRequest {
  id: string;
  itemId: string;
  itemName: string;
  lenderName: string;
  borrowerName: string;
  price: string;
  status: BorrowStatus;
  requestedAt: string;
  isOnlineRental?: boolean;
}

export interface LendItem {
  id: string;
  itemId: string;
  itemName: string;
  borrowerName: string;
  price: string;
  status: BorrowStatus;
  requestedAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}
