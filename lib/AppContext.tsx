'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NeighbourhoodItem,
  OnlineStoreItem,
  BorrowRequest,
  LendItem,
  ToastMessage,
  BorrowStatus,
  OnlineRentalOrder,
  OnlineRentalStage,
} from '@/types';
import {
  INITIAL_NEIGHBOURHOOD_ITEMS,
  INITIAL_ONLINE_STORE_ITEMS,
  INITIAL_BORROW_REQUESTS,
  INITIAL_LEND_ITEMS,
} from './mockData';

interface AppContextType {
  neighbourhoodItems: NeighbourhoodItem[];
  onlineStoreItems: OnlineStoreItem[];
  borrowRequests: BorrowRequest[];
  lendItems: LendItem[];
  onlineRentalOrders: OnlineRentalOrder[];
  wishlistIds: string[];
  toasts: ToastMessage[];
  addNeighbourhoodItem: (item: Omit<NeighbourhoodItem, 'id' | 'distanceKm' | 'ownerName' | 'ownerRating' | 'timesBorrowed'> & { ownerName?: string }) => NeighbourhoodItem;
  addOnlineStoreItem: (item: Partial<OnlineStoreItem>) => OnlineStoreItem;
  updateNeighbourhoodItem: (id: string, updatedFields: Partial<NeighbourhoodItem>) => void;
  deleteNeighbourhoodItem: (id: string) => void;
  requestBorrowItem: (item: NeighbourhoodItem) => void;
  rentOnlineItem: (item: OnlineStoreItem) => void;
  placeOnlineRentalOrder: (orderData: Omit<OnlineRentalOrder, 'id' | 'createdAt' | 'trackingNumber'>) => OnlineRentalOrder;
  advanceOnlineRentalStage: (orderId: string) => void;
  toggleWishlist: (itemId: string) => void;
  isWishlisted: (itemId: string) => boolean;
  advanceBorrowStatus: (requestId: string) => void;
  acceptLendRequest: (lendId: string) => void;
  declineLendRequest: (lendId: string) => void;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [neighbourhoodItems, setNeighbourhoodItems] = useState<NeighbourhoodItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('loop_neighbourhood_items');
        return saved ? JSON.parse(saved) : INITIAL_NEIGHBOURHOOD_ITEMS;
      } catch {
        return INITIAL_NEIGHBOURHOOD_ITEMS;
      }
    }
    return INITIAL_NEIGHBOURHOOD_ITEMS;
  });

  const [onlineStoreItems, setOnlineStoreItems] = useState<OnlineStoreItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('loop_online_store_items');
        return saved ? JSON.parse(saved) : INITIAL_ONLINE_STORE_ITEMS;
      } catch {
        return INITIAL_ONLINE_STORE_ITEMS;
      }
    }
    return INITIAL_ONLINE_STORE_ITEMS;
  });

  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>(INITIAL_BORROW_REQUESTS);
  const [lendItems, setLendItems] = useState<LendItem[]>(INITIAL_LEND_ITEMS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('loop_neighbourhood_items', JSON.stringify(neighbourhoodItems));
      } catch (e) {
        console.error('Failed to save neighbourhood items to localStorage', e);
      }
    }
  }, [neighbourhoodItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('loop_online_store_items', JSON.stringify(onlineStoreItems));
      } catch (e) {
        console.error('Failed to save online store items to localStorage', e);
      }
    }
  }, [onlineStoreItems]);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('loop_wishlist');
        return saved ? JSON.parse(saved) : ['item-online-1', 'item-online-3'];
      } catch {
        return ['item-online-1', 'item-online-3'];
      }
    }
    return ['item-online-1', 'item-online-3'];
  });

  // Online Rental Orders state
  const [onlineRentalOrders, setOnlineRentalOrders] = useState<OnlineRentalOrder[]>([
    {
      id: 'ord-1001',
      itemId: 'item-online-1',
      itemName: 'DSLR Camera Canon 5D Mark IV',
      itemImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
      platformName: 'RentMyGear Partner',
      startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      totalDays: 5,
      pricePerDay: 2000,
      rentalFee: 10000,
      depositAmount: 15000,
      platformFee: 99,
      deliveryFee: 0,
      totalPaid: 25099,
      paymentMethod: 'UPI (Google Pay)',
      paymentStatus: 'PAID',
      orderStatus: 'Borrowing Active',
      depositStatus: 'Held',
      createdAt: '2 days ago',
      trackingNumber: 'TRK-LOOP-883921',
    },
    {
      id: 'ord-1002',
      itemId: 'item-online-2',
      itemName: 'Sony PS5 Console + 2 DualSense Controllers',
      itemImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400',
      platformName: 'GamerRent Partner',
      startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 4).toISOString(),
      totalDays: 6,
      pricePerDay: 1250,
      rentalFee: 7500,
      depositAmount: 8000,
      platformFee: 99,
      deliveryFee: 199,
      totalPaid: 15798,
      paymentMethod: 'Credit Card',
      paymentStatus: 'REFUNDED',
      orderStatus: 'Deposit Refunded',
      depositStatus: 'Refunded',
      createdAt: '10 days ago',
      trackingNumber: 'TRK-LOOP-774019',
    }
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('loop_wishlist', JSON.stringify(wishlistIds));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
    }
  }, [wishlistIds]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleWishlist = (itemId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(itemId);
      if (exists) {
        addToast('Removed from Wishlist', 'Item has been removed from your saved items.', 'info');
        return prev.filter((id) => id !== itemId);
      } else {
        addToast('Saved to Wishlist', 'Item added to your saved wishlist.', 'success');
        return [...prev, itemId];
      }
    });
  };

  const isWishlisted = (itemId: string) => wishlistIds.includes(itemId);

  const placeOnlineRentalOrder = (orderData: Omit<OnlineRentalOrder, 'id' | 'createdAt' | 'trackingNumber'>): OnlineRentalOrder => {
    const newOrder: OnlineRentalOrder = {
      ...orderData,
      id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: 'Just now',
      trackingNumber: 'TRK-LOOP-' + Math.floor(100000 + Math.random() * 900000),
    };

    setOnlineRentalOrders((prev) => [newOrder, ...prev]);

    // Also add to borrowRequests for unified tracking
    const newBorrowReq: BorrowRequest = {
      id: 'br-online-' + Date.now(),
      itemId: newOrder.itemId,
      itemName: newOrder.itemName,
      lenderName: newOrder.platformName,
      borrowerName: 'You',
      price: `₹${newOrder.rentalFee} (${newOrder.totalDays} days)`,
      status: 'Requested',
      requestedAt: 'Just now',
      isOnlineRental: true,
    };
    setBorrowRequests((prev) => [newBorrowReq, ...prev]);

    addToast('Rental Confirmed!', `Order #${newOrder.id} placed for ${newOrder.itemName}. Track shipping in My Activity.`);
    return newOrder;
  };

  const advanceOnlineRentalStage = (orderId: string) => {
    const stages: OnlineRentalStage[] = [
      'Request Sent',
      'Owner Approved',
      'Payment Completed',
      'Sanitized & Packed',
      'Out for Delivery',
      'Borrowing Active',
      'Return Scheduled',
      'Item Returned',
      'Deposit Refunded',
    ];

    setOnlineRentalOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const currIndex = stages.indexOf(ord.orderStatus);
        if (currIndex < stages.length - 1) {
          const nextStage = stages[currIndex + 1];
          const updatedDepositStatus =
            nextStage === 'Deposit Refunded'
              ? 'Refunded'
              : nextStage === 'Item Returned'
              ? 'Refund Pending'
              : ord.depositStatus;

          addToast('Rental Status Updated', `Order ${ord.id} status is now "${nextStage}".`);
          return {
            ...ord,
            orderStatus: nextStage,
            depositStatus: updatedDepositStatus,
            paymentStatus: nextStage === 'Deposit Refunded' ? 'REFUNDED' : ord.paymentStatus,
          };
        }
        return ord;
      })
    );
  };

  const addNeighbourhoodItem = (
    itemData: Omit<NeighbourhoodItem, 'id' | 'distanceKm' | 'ownerName' | 'ownerRating' | 'timesBorrowed'> & { ownerName?: string }
  ): NeighbourhoodItem => {
    const newItem: NeighbourhoodItem = {
      ...itemData,
      id: 'item-n-' + Date.now(),
      distanceKm: 0.1,
      ownerId: 'usr-you',
      ownerName: itemData.ownerName || 'You',
      ownerRating: 5.0,
      timesBorrowed: 0,
      isCustom: true,
      availabilityStatus: itemData.availabilityStatus || 'Available',
      imageUrls: itemData.imageUrls && itemData.imageUrls.length > 0 ? itemData.imageUrls : (itemData.imageUrl ? [itemData.imageUrl] : []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNeighbourhoodItems((prev) => [newItem, ...prev]);
    addToast('Item listed successfully!', `"${newItem.name}" is now visible to neighbours within your range.`);
    return newItem;
  };

  const addOnlineStoreItem = (itemData: Partial<OnlineStoreItem>): OnlineStoreItem => {
    const newItem: OnlineStoreItem = {
      id: 'item-online-' + Date.now(),
      name: itemData.name || 'New Rental Item',
      category: itemData.category || 'Tools',
      platformName: itemData.platformName || 'Your Partner Store',
      ownerId: 'usr-you',
      pricePerDay: itemData.pricePerDay || 500,
      pricePerHour: itemData.pricePerHour || 100,
      marketPrice: itemData.marketPrice || 5000,
      depositAmount: itemData.depositAmount || 1000,
      securityDeposit: itemData.securityDeposit || 1000,
      timesRented: 0,
      iconName: itemData.iconName || 'Package',
      deliveryEstimate: '1-2 Days Express',
      rating: 5.0,
      reviewCount: 0,
      description: itemData.description || '',
      imageUrl: itemData.imageUrl || '',
      imageUrls: itemData.imageUrls && itemData.imageUrls.length > 0 ? itemData.imageUrls : (itemData.imageUrl ? [itemData.imageUrl] : []),
      condition: itemData.condition || 'Like New',
      availableToShip: true,
      pickupAvailable: true,
    };
    setOnlineStoreItems((prev) => [newItem, ...prev]);
    addToast('Partner Rental Published!', `"${newItem.name}" is now live on the Online Store.`);
    return newItem;
  };

  const updateNeighbourhoodItem = (id: string, updatedFields: Partial<NeighbourhoodItem>) => {
    setNeighbourhoodItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
        addToast('Listing Updated', `"${updated.name}" has been updated.`);
        return updated;
      })
    );
  };

  const deleteNeighbourhoodItem = (id: string) => {
    const target = neighbourhoodItems.find((i) => i.id === id);
    setNeighbourhoodItems((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      addToast('Listing Deleted', `"${target.name}" was removed from your listings.`, 'info');
    }
  };

  const requestBorrowItem = (item: NeighbourhoodItem) => {
    const existing = borrowRequests.find((r) => r.itemId === item.id);
    if (existing) {
      addToast('Already requested', `You already have an active request for "${item.name}".`, 'info');
      return;
    }

    const newRequest: BorrowRequest = {
      id: 'br-' + Date.now(),
      itemId: item.id,
      itemName: item.name,
      lenderName: item.ownerName,
      borrowerName: 'You',
      price: `₹${item.pricePerDay}/day`,
      status: 'Requested',
      requestedAt: 'Just now',
    };

    setBorrowRequests((prev) => [newRequest, ...prev]);
    setNeighbourhoodItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, timesBorrowed: i.timesBorrowed + 1 } : i))
    );
    addToast('Borrow Request Sent', `Request sent to ${item.ownerName} for ${item.name}. Check My Activity for updates.`);
  };

  const rentOnlineItem = (item: OnlineStoreItem) => {
    placeOnlineRentalOrder({
      itemId: item.id,
      itemName: item.name,
      itemImage: item.imageUrl || (item.imageUrls ? item.imageUrls[0] : ''),
      platformName: item.platformName,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      totalDays: 3,
      pricePerDay: item.pricePerDay,
      rentalFee: item.pricePerDay * 3,
      depositAmount: item.depositAmount || 0,
      platformFee: 99,
      deliveryFee: 199,
      totalPaid: item.pricePerDay * 3 + (item.depositAmount || 0) + 99 + 199,
      paymentMethod: 'UPI (GPay)',
      paymentStatus: 'PAID',
      orderStatus: 'Payment Completed',
      depositStatus: 'Held',
    });
  };

  const advanceBorrowStatus = (requestId: string) => {
    const statusFlow: BorrowStatus[] = ['Requested', 'Accepted', 'Picked up', 'Returned'];
    setBorrowRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        const currentIndex = statusFlow.indexOf(req.status);
        if (currentIndex < statusFlow.length - 1) {
          const nextStatus = statusFlow[currentIndex + 1];
          addToast('Status Updated', `"${req.itemName}" status changed to ${nextStatus}.`);
          return { ...req, status: nextStatus };
        }
        return req;
      })
    );
  };

  const acceptLendRequest = (lendId: string) => {
    setLendItems((prev) =>
      prev.map((item) => {
        if (item.id !== lendId) return item;
        addToast('Request Accepted', `You accepted ${item.borrowerName}'s request for "${item.itemName}".`);
        return { ...item, status: 'Accepted' };
      })
    );
  };

  const declineLendRequest = (lendId: string) => {
    const target = lendItems.find((i) => i.id === lendId);
    setLendItems((prev) => prev.filter((item) => item.id !== lendId));
    if (target) {
      addToast('Request Declined', `Declined request for "${target.itemName}".`, 'info');
    }
  };

  return (
    <AppContext.Provider
      value={{
        neighbourhoodItems,
        onlineStoreItems,
        borrowRequests,
        lendItems,
        onlineRentalOrders,
        wishlistIds,
        toasts,
        addNeighbourhoodItem,
        addOnlineStoreItem,
        updateNeighbourhoodItem,
        deleteNeighbourhoodItem,
        requestBorrowItem,
        rentOnlineItem,
        placeOnlineRentalOrder,
        advanceOnlineRentalStage,
        toggleWishlist,
        isWishlisted,
        advanceBorrowStatus,
        acceptLendRequest,
        declineLendRequest,
        addToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-ink text-paper border border-marigold/40 p-4 rounded-xl shadow-xl transition-all duration-300 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-3"
          >
            <div>
              <h4 className="font-display font-semibold text-marigold text-sm">{toast.title}</h4>
              <p className="text-xs text-paper/80 mt-1 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-paper/60 hover:text-marigold text-xs transition-colors p-1"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
