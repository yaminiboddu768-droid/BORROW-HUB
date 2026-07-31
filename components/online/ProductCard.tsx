import React from 'react';
import { OnlineStoreItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import { Heart, Star, ShieldCheck, Truck, Store, Camera, Tent, Gift, Compass, Gamepad2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ProductCardProps {
  item: OnlineStoreItem;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onView: () => void;
  onRent: (e: React.MouseEvent) => void;
}

export function ProductCard({ item, isWishlisted, onToggleWishlist, onView, onRent }: ProductCardProps) {
  const thumbnail = getItemImage(item);

  const getStoreIcon = (iconName: string, className = "w-12 h-12 text-slate-300") => {
    switch (iconName) {
      case 'Camera': return <Camera className={className} />;
      case 'Tent': return <Tent className={className} />;
      case 'Gift': return <Gift className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Gamepad2': return <Gamepad2 className={className} />;
      default: return <Store className={className} />;
    }
  };

  return (
    <Card
      variant="interactive"
      className="flex flex-col overflow-hidden p-0 rounded-2xl group border border-slate-200/60 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1"
      onClick={onView}
    >
      {/* Image Container with precise aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-slate-50 flex-shrink-0 cursor-pointer overflow-hidden border-b border-slate-100">
        <img
          src={thumbnail}
          alt={item.name}
          onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name); }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Top Badges overlay */}
        <div className="absolute top-3 inset-x-3 flex justify-between items-start">
          <Badge variant="clay" className="shadow-sm backdrop-blur-md bg-white/95 text-clay border-none font-semibold text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            {item.platformName}
          </Badge>

          <button
            onClick={onToggleWishlist}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-sm border transition-all duration-300 ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500 scale-105 hover:bg-rose-100 hover:scale-110'
                : 'bg-white/90 border-slate-100 text-slate-400 hover:bg-white hover:text-rose-500 hover:border-slate-200 hover:scale-110'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Bottom Delivery Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[11px] font-semibold text-slate-700 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-1.5 transition-transform duration-300 group-hover:-translate-y-1">
          <Truck className="w-3.5 h-3.5 text-blue-500" />
          {item.deliveryEstimate || 'Next Day Delivery'}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-5 bg-white">
        <div className="space-y-3">
          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 border-slate-200 bg-slate-50 px-2 py-0.5 rounded-md">
              {item.category}
            </Badge>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-amber-700 font-bold text-xs">{item.rating || 4.9}</span>
              <span className="text-amber-700/60 text-[10px] font-medium">({item.reviewCount || 30})</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-[17px] text-slate-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
            <p className="text-slate-500 text-[13px] line-clamp-2 leading-relaxed">
              {item.description || 'Premium equipment available for immediate rental. Maintained and verified.'}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          {item.depositAmount && item.depositAmount > 0 ? (
             <div className="flex items-center justify-between text-[12px] text-slate-600 bg-slate-50/80 rounded-lg px-3 py-2 border border-slate-100">
               <span className="flex items-center gap-1.5 font-medium">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 Refundable Deposit
               </span>
               <strong className="text-slate-900 font-semibold">{formatRupee(item.depositAmount)}</strong>
             </div>
          ) : (
            <div className="flex items-center justify-between text-[12px] text-emerald-700 bg-emerald-50/80 rounded-lg px-3 py-2 border border-emerald-100/50">
               <span className="flex items-center gap-1.5 font-medium">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 Zero Deposit
               </span>
               <span className="font-semibold">No deposit required</span>
             </div>
          )}

          <div className="flex items-end justify-between gap-3 pt-1">
            <div>
              <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 block mb-0.5">Rental Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
                  {formatRupee(item.pricePerDay)}
                </span>
                <span className="text-slate-500 text-[13px] font-medium">/ day</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="font-bold text-[13px] h-10 px-3 hover:bg-slate-50 border-slate-200 text-slate-700"
              >
                <Eye className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Details</span>
              </Button>

              <Button
                variant="clay"
                onClick={onRent}
                className="font-bold text-[13px] h-10 px-5 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Rent Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
