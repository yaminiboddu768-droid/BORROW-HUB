'use client';

import React, { useEffect, useState } from 'react';
import { getCheckInRecord, markDispute, BorrowRecord } from '@/lib/checkinStore';
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, Gavel, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ComparisonViewProps {
  borrowId: string;
  onClose: () => void;
}

export function ComparisonView({ borrowId, onClose }: ComparisonViewProps) {
  const [record, setRecord] = useState<BorrowRecord | null>(null);
  const [viewIndex, setViewIndex] = useState(0); // 0: front, 1: side, 2: top

  useEffect(() => {
    setRecord(getCheckInRecord(borrowId));
  }, [borrowId]);

  if (!record || !record.before || !record.after) {
    return (
      <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-ink">Incomplete Data</h2>
          <p className="text-slate mt-2 mb-6">Both Before Pickup and After Return check-ins must be completed to view the comparison.</p>
          <Button onClick={onClose} variant="primary" className="w-full">Close</Button>
        </div>
      </div>
    );
  }

  const views = ['front', 'side', 'top'] as const;
  const currentView = views[viewIndex];

  const beforeImg = record.before.media[currentView];
  const afterImg = record.after.media[currentView];

  const handleDispute = () => {
    if (confirm("Are you sure you want to report damage and open a dispute? This will freeze the rental transaction.")) {
      markDispute(borrowId);
      setRecord(getCheckInRecord(borrowId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-ink text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display font-bold text-xl">Condition Comparison</h2>
            <p className="text-xs text-slate-300 font-data opacity-80">Borrow Ref: {borrowId}</p>
          </div>
          <Button onClick={onClose} variant="primary" className="bg-white/10 hover:bg-white/20 border-0 text-white">Close View</Button>
        </div>

        {/* Dispute Banner */}
        {record.dispute && (
          <div className="bg-red-500 text-white px-6 py-3 font-bold text-sm flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            DAMAGE DISPUTE OPEN: This rental is currently under review by Borrow Hub Support.
          </div>
        )}

        {/* Main Split Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Before */}
          <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50 relative group">
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
              BEFORE PICKUP
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {beforeImg ? (
                <img src={beforeImg} alt="Before" className="max-w-full max-h-full object-contain rounded-lg shadow-sm transition-transform hover:scale-[1.5] cursor-zoom-in" />
              ) : (
                <span className="text-slate-400">No {currentView} photo captured</span>
              )}
            </div>
            <div className="bg-white p-4 shrink-0 border-t border-slate-200 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate"><Calendar className="w-3 h-3 inline mr-1"/>{new Date(record.before.timestamp).toLocaleString()}</div>
                <div className="text-slate text-right"><MapPin className="w-3 h-3 inline mr-1"/>{record.before.gpsLocation ? 'GPS Verified' : 'No GPS'}</div>
              </div>
              <div className="mt-2 font-bold text-ink flex justify-between items-center">
                <span>Condition: {record.before.condition}</span>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="flex-1 flex flex-col bg-slate-50 relative group">
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
              AFTER RETURN
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {afterImg ? (
                <img src={afterImg} alt="After" className="max-w-full max-h-full object-contain rounded-lg shadow-sm transition-transform hover:scale-[1.5] cursor-zoom-in" />
              ) : (
                <span className="text-slate-400">No {currentView} photo captured</span>
              )}
            </div>
            <div className="bg-white p-4 shrink-0 border-t border-slate-200 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate"><Calendar className="w-3 h-3 inline mr-1"/>{new Date(record.after.timestamp).toLocaleString()}</div>
                <div className="text-slate text-right"><MapPin className="w-3 h-3 inline mr-1"/>{record.after.gpsLocation ? 'GPS Verified' : 'No GPS'}</div>
              </div>
              <div className="mt-2 font-bold text-ink flex justify-between items-center">
                <span>Condition: {record.after.condition}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="bg-white p-4 shrink-0 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewIndex(Math.max(0, viewIndex - 1))}
              disabled={viewIndex === 0}
              className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-ink" />
            </button>
            <span className="font-bold font-display w-24 text-center capitalize">{currentView} View</span>
            <button 
              onClick={() => setViewIndex(Math.min(2, viewIndex + 1))}
              disabled={viewIndex === 2}
              className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5 text-ink" />
            </button>
          </div>

          {!record.dispute && record.before.condition !== record.after.condition && (
            <Button onClick={handleDispute} variant="primary" className="bg-red-500 hover:bg-red-600 border-red-500 shadow-red-500/30">
              <AlertTriangle className="w-4 h-4 mr-2" /> Report Damage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
