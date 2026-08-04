'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import { X, ShieldCheck, Tag, Sparkles, Box, Truck, DollarSign, Calendar, Info, Layers } from 'lucide-react';

interface Props {
  product: any;
  onClose: () => void;
  onEdit: () => void;
}

export function PartnerProductDetailModal({ product, onClose, onEdit }: Props) {
  let rawImages: string[] = [];
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    rawImages = product.imageUrls;
  } else if (typeof product.imageUrls === 'string') {
    try {
      const parsed = JSON.parse(product.imageUrls);
      rawImages = Array.isArray(parsed) && parsed.length > 0 ? parsed : [product.imageUrls];
    } catch {
      rawImages = [product.imageUrls];
    }
  } else if (product.imageUrl) {
    rawImages = [product.imageUrl];
  }

  const images: string[] = rawImages.length > 0 ? rawImages : [getItemImage(product)];
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  const status = product.availabilityStatus || (product.isAvailable && product.quantity > 0 ? 'Available' : 'Unavailable');

  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'Available': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Rented': case 'Currently Rented': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Reserved': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Maintenance': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-data">
              Partner Inventory Item
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900">{product.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/60 text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Gallery Column */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={images[selectedImgIdx]}
                  alt={product.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name); }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getBadgeStyle(status)}`}>
                    {status}
                  </span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIdx(idx)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        selectedImgIdx === idx ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(product.category, product.name); }} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Column */}
            <div className="md:col-span-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-bold text-slate-600 bg-slate-50">
                    {product.category}
                  </Badge>
                  {product.brand && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Brand: {product.brand}
                    </span>
                  )}
                  {product.model && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Model: {product.model}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900">{product.name}</h3>
              </div>

              {/* Rates & Deposits Box */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-500 block">Daily Rental Rate</span>
                    <span className="text-3xl font-extrabold text-slate-900 font-display">
                      {formatRupee(product.pricePerDay)}
                      <span className="text-xs font-medium text-slate-500"> / day</span>
                    </span>
                  </div>
                  {product.pricePerHour && (
                    <div className="text-right">
                      <span className="text-[11px] uppercase font-bold text-slate-500 block">Hourly Rate</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatRupee(product.pricePerHour)}
                        <span className="text-xs font-normal text-slate-500"> / hr</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>Refundable Security Deposit:</span>
                  <strong className="text-slate-900 font-bold bg-white px-2.5 py-0.5 rounded border border-amber-300">
                    {product.securityDeposit ? formatRupee(product.securityDeposit) : 'No Deposit'}
                  </strong>
                </div>

                {product.marketPrice && (
                  <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                    <span>Estimated Market Value:</span>
                    <strong className="text-slate-900">{formatRupee(product.marketPrice)}</strong>
                  </div>
                )}
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Condition</span>
                  <span className="font-bold text-slate-800">{product.condition || 'Excellent'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Available Stock</span>
                  <span className="font-bold text-slate-800">{product.quantity || 1} unit(s)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Delivery Type</span>
                  <span className="font-bold text-slate-800">{product.deliveryType || 'Pickup Only'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Damage Policy</span>
                  <span className="font-bold text-slate-800">{product.damagePolicy || 'Standard'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                Product Description & Notes
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="accent" onClick={onEdit} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold">
            Edit This Product
          </Button>
        </div>
      </div>
    </div>
  );
}
