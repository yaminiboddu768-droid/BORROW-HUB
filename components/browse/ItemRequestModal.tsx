'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import { X, Calendar, Clock, AlertTriangle, ChevronLeft, ChevronRight, Check, Tag } from 'lucide-react';

interface Props {
  item: any;
  onClose: () => void;
  onSubmit: (startDate: Date, endDate: Date, estimatedCost: number) => Promise<void>;
  isLoading: boolean;
}

export function ItemRequestModal({ item, onClose, onSubmit, isLoading }: Props) {
  let rawImages: string[] = [];
  if (Array.isArray(item.imageUrls)) {
    rawImages = item.imageUrls;
  } else if (typeof item.imageUrls === 'string') {
    try {
      const parsed = JSON.parse(item.imageUrls);
      rawImages = Array.isArray(parsed) ? parsed : [item.imageUrls];
    } catch {
      rawImages = [item.imageUrls];
    }
  } else if (item.imageUrl) {
    rawImages = [item.imageUrl];
  }
  const images: string[] = rawImages.length > 0 ? rawImages : [getItemImage(item)];
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [durationText, setDurationText] = useState('');

  useEffect(() => {
    if (!startDate || !endDate) {
      setEstimatedCost(0);
      setDurationText('');
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      setEstimatedCost(0);
      setDurationText('End time must be after start time');
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffHours / 24);

    if (diffHours < 24 && item.pricePerHour) {
      setEstimatedCost(diffHours * item.pricePerHour);
      setDurationText(`${diffHours} hours`);
    } else {
      const daysToCharge = Math.max(1, diffDays);
      setEstimatedCost(daysToCharge * item.pricePerDay);
      setDurationText(`${daysToCharge} day${daysToCharge > 1 ? 's' : ''}`);
    }
  }, [startDate, startTime, endDate, endTime, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (end <= start) return;
    
    onSubmit(start, end, estimatedCost);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6 bg-ink/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] md:h-[85vh] max-h-[90vh] flex flex-col md:flex-row overflow-hidden my-auto border border-ink/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Side: Image Gallery */}
        <div className="w-full md:w-1/2 bg-ink/5 p-5 md:p-6 flex flex-col shrink-0 min-h-0 overflow-y-auto max-h-[35vh] md:max-h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-ink leading-tight line-clamp-1">{item.name}</h2>
            <button onClick={onClose} className="md:hidden p-2 -mr-2 text-slate hover:text-ink">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-grow rounded-2xl overflow-hidden bg-ink/10 aspect-square md:aspect-auto">
            {images.length > 0 ? (
              <>
                <img src={images[currentImageIdx]} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item?.category, item?.name); }} className="w-full h-full object-cover transition-opacity duration-300" />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5 text-ink" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5 text-ink" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate">No Image</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImageIdx(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${currentImageIdx === i ? 'border-moss' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Request Details & Form */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col min-h-0 overflow-y-auto h-full">
          <div className="hidden md:flex justify-end mb-2">
            <button onClick={onClose} className="p-2 -mr-2 text-slate hover:text-ink bg-slate-50 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 flex-grow">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">Request to Borrow</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="moss">{item.distanceKm} km</Badge>
                {item.marketPrice && (
                  <div className="flex items-center gap-1 text-[10px] text-slate font-data bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>Value: <strong>{formatRupee(item.marketPrice)}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {item.description && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
                <p className="text-[11px] uppercase font-data font-bold text-slate">Description & Details</p>
                <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-moss/5 border border-moss/20">
              {item.pricePerHour && (
                <div>
                  <p className="text-[10px] uppercase font-data text-slate font-bold">Hourly Rate</p>
                  <p className="font-data font-bold text-lg text-moss">{formatRupee(item.pricePerHour)}<span className="text-sm font-normal text-slate">/hr</span></p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase font-data text-slate font-bold">Daily Rate</p>
                <p className="font-data font-bold text-lg text-moss">{formatRupee(item.pricePerDay)}<span className="text-sm font-normal text-slate">/day</span></p>
              </div>
            </div>

            <form id="requestForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-moss" />
                  <span>Borrow Duration</span>
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate font-semibold uppercase">Start</span>
                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-ink/20 text-sm focus:ring-2 focus:ring-moss outline-none" min={new Date().toISOString().split('T')[0]} />
                    <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-ink/20 text-sm focus:ring-2 focus:ring-moss outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate font-semibold uppercase">End</span>
                    <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-ink/20 text-sm focus:ring-2 focus:ring-moss outline-none" min={startDate || new Date().toISOString().split('T')[0]} />
                    <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-ink/20 text-sm focus:ring-2 focus:ring-moss outline-none" />
                  </div>
                </div>
              </div>
            </form>

            {(item.penaltyPerHour || item.penaltyPerDay) && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-semibold mb-0.5">Late Return Penalties Apply</p>
                  <p>Returning this item late will incur a fee of {item.penaltyPerHour ? `${formatRupee(item.penaltyPerHour)}/hr` : ''} {item.penaltyPerHour && item.penaltyPerDay ? ' up to ' : ''} {item.penaltyPerDay ? `${formatRupee(item.penaltyPerDay)}/day` : ''}.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-ink/10">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Estimated Cost</p>
                {durationText ? (
                  <p className="text-sm font-data text-ink">For {durationText}</p>
                ) : (
                  <p className="text-sm text-slate italic">Select dates to calculate</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-3xl text-moss">{formatRupee(estimatedCost)}</p>
              </div>
            </div>

            <Button 
              type="submit" 
              form="requestForm" 
              variant="primary" 
              className="w-full" 
              size="lg"
              isLoading={isLoading}
              disabled={!startDate || !endDate || estimatedCost <= 0}
            >
              <Check className="w-5 h-5" />
              <span>Confirm Request</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
