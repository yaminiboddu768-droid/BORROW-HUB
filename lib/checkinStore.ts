export interface CheckInMedia {
  front: string | null; // base64
  side: string | null;
  top: string | null;
  video: string | null;
}

export interface CheckInData {
  media: CheckInMedia;
  condition: string;
  timestamp: string;
  gpsLocation: { lat: number, lng: number } | null;
  confirmedByOwner: boolean;
  confirmedByBorrower: boolean;
}

export interface BorrowRecord {
  before: CheckInData | null;
  after: CheckInData | null;
  dispute: boolean;
}

const STORAGE_KEY = 'borrow_hub_checkins';

export const getCheckInRecord = (borrowId: string): BorrowRecord => {
  if (typeof window === 'undefined') return { before: null, after: null, dispute: false };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { before: null, after: null, dispute: false };
  try {
    const data = JSON.parse(raw);
    return data[borrowId] || { before: null, after: null, dispute: false };
  } catch (e) {
    return { before: null, after: null, dispute: false };
  }
};

export const saveCheckInData = (borrowId: string, stage: 'before' | 'after', data: Partial<CheckInData>) => {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  let store: Record<string, BorrowRecord> = {};
  if (raw) {
    try {
      store = JSON.parse(raw);
    } catch (e) {
      store = {};
    }
  }

  const record = store[borrowId] || { before: null, after: null, dispute: false };
  
  if (stage === 'before') {
    record.before = { ...record.before, ...data } as CheckInData;
  } else {
    record.after = { ...record.after, ...data } as CheckInData;
  }

  store[borrowId] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const markDispute = (borrowId: string) => {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const store = JSON.parse(raw);
    if (store[borrowId]) {
      store[borrowId].dispute = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch (e) {}
};
