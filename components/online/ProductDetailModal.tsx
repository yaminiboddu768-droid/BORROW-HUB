'use client';

import React, { useState } from 'react';
import { OnlineStoreItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
  Calendar,
  Share2
} from 'lucide-react';

interface ProductDetailModalProps {
  item: OnlineStoreItem;
  onClose: () => void;
  onProceedToBooking: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export function ProductDetailModal({
  item,
  onClose,
  onProceedToBooking,
  isWishlisted,
  onToggleWishlist,
}: ProductDetailModalProps) {
  let rawImages: string[] = [];
  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    rawImages = item.imageUrls;
  } else if (typeof item.imageUrls === 'string') {
    try {
      const parsed = JSON.parse(item.imageUrls);
      rawImages = Array.isArray(parsed) && parsed.length > 0 ? parsed : [item.imageUrls];
    } catch {
      rawImages = [item.imageUrls];
    }
  } else if (item.imageUrl) {
    rawImages = [item.imageUrl];
  }
  const images: string[] = rawImages.length > 0 ? rawImages : [getItemImage(item)];

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'reviews' | 'faq'>('overview');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleHelpfulClick = (revId: string) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [revId]: (prev[revId] || 0) + 1
    }));
  };

  const reviewsList = item.reviews || [
    {
      id: 'r-default-1',
      userName: 'Verified Renter',
      rating: 5,
      date: '3 days ago',
      comment: 'Item arrived in immaculate, sanitized condition. Delivery partner was polite and picked it up right on time.',
      verifiedRenter: true,
      helpfulCount: 12
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-paper border-2 border-clay/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-20 bg-paper/95 backdrop-blur-md border-b border-ink/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-data text-slate overflow-x-auto no-scrollbar">
            <span>Online Store</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-clay font-medium">{item.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-ink font-semibold truncate max-w-[180px] sm:max-w-xs">{item.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-ink/5 text-slate hover:text-ink transition-colors relative"
              title="Share item"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute top-10 right-0 text-[10px] font-bold font-data bg-ink text-paper px-2 py-1 rounded shadow">
                  Link copied!
                </span>
              )}
            </button>
            <button
              onClick={onToggleWishlist}
              className={`p-2 rounded-full transition-all ${
                isWishlisted
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'hover:bg-ink/5 text-slate hover:text-ink'
              }`}
              title={isWishlisted ? 'Saved in wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-8 flex-1">
          {/* Top Main Section: Image Gallery (Left) & Key Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-4/3 w-full bg-ink/5 border border-ink/10 rounded-2xl overflow-hidden group shadow-inner">
                <img
                  src={images[selectedImgIndex]}
                  alt={item.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item?.category, item?.name); }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Partner Verification & Condition Badge */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <Badge variant="clay" className="shadow-md bg-white/90 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-clay inline mr-1" />
                    {item.platformName}
                  </Badge>
                </div>

                {item.condition && (
                  <div className="absolute bottom-3 left-3 bg-ink/80 text-paper text-[11px] font-data px-3 py-1 rounded-full backdrop-blur-md shadow flex items-center gap-1.5 border border-paper/20">
                    <Sparkles className="w-3 h-3 text-marigold" />
                    <span>{item.condition}</span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 bg-white/90 text-ink text-[10px] font-data font-bold px-2.5 py-1 rounded-full shadow border border-ink/10">
                  {selectedImgIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        selectedImgIndex === idx
                          ? 'border-clay shadow-md ring-2 ring-clay/30 scale-105'
                          : 'border-ink/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item?.category, item?.name); }} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Pricing, Rating & Quick Action */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-data font-bold uppercase tracking-wider text-slate">
                      {item.brand ? `${item.brand} • ` : ''}{item.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-data text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      In Stock & Ready for Dispatch
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-tight">
                    {item.name}
                  </h1>
                </div>

                {/* Rating & Reviews Bar */}
                <div className="flex items-center gap-4 text-xs font-data border-y border-ink/10 py-3">
                  <div className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{item.rating || 4.9}</span>
                  </div>
                  <span className="text-slate">({item.reviewCount || 38} verified reviews)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-ink font-semibold">{item.timesBorrowed || item.timesRented || 184} rentals completed</span>
                </div>

                {/* Pricing Box */}
                <div className="bg-clay/5 border-2 border-clay/20 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase font-data text-slate block font-semibold">Rental Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-3xl text-clay">
                          {formatRupee(item.pricePerDay)}
                        </span>
                        <span className="text-slate text-xs font-data">/ day</span>
                      </div>
                    </div>
                    {item.pricePerHour && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-data text-slate block">Hourly Option</span>
                        <span className="font-data font-bold text-base text-ink">
                          {formatRupee(item.pricePerHour)} <span className="text-xs text-slate font-normal">/ hr</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {item.marketPrice && (
                    <div className="flex items-center justify-between text-xs font-data pt-2 border-t border-clay/10 text-slate">
                      <span>Market Value: <strong className="text-ink">{formatRupee(item.marketPrice)}</strong></span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Save {Math.round((1 - item.pricePerDay / (item.marketPrice / 30)) * 100)}% vs buying
                      </span>
                    </div>
                  )}

                  {item.depositAmount && item.depositAmount > 0 && (
                    <div className="bg-white/80 border border-clay/20 rounded-xl p-3 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-ink font-medium">
                        <ShieldCheck className="w-4 h-4 text-clay shrink-0" />
                        <span>Refundable Security Deposit:</span>
                      </div>
                      <span className="font-data font-bold text-ink bg-clay/10 px-2.5 py-0.5 rounded-full border border-clay/30">
                        {formatRupee(item.depositAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delivery & Trust Highlights */}
                <div className="grid grid-cols-2 gap-3 text-xs font-data">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-clay shrink-0" />
                    <div>
                      <p className="font-bold text-ink">Doorstep Delivery</p>
                      <p className="text-[11px] text-slate">{item.deliveryEstimate || 'Delivered in 24h'}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-moss shrink-0" />
                    <div>
                      <p className="font-bold text-ink">Easy Return Pickup</p>
                      <p className="text-[11px] text-slate">Free doorstep return</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-ink/10 flex items-center gap-3">
                <Button
                  variant="clay"
                  size="lg"
                  className="flex-1 py-3.5 text-base font-bold font-display shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
                  onClick={onProceedToBooking}
                >
                  <Calendar className="w-5 h-5 mr-2 inline" />
                  Rent Now & Select Dates
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-ink/10 pt-4">
            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview & Specs' },
                { id: 'policies', label: 'Terms & Policies' },
                { id: 'reviews', label: `Reviews (${reviewsList.length})` },
                { id: 'faq', label: 'FAQs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-display font-bold border-b-2 transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'border-clay text-clay'
                      : 'border-transparent text-slate hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Overview & Specs */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="prose prose-slate max-w-none text-slate text-sm leading-relaxed">
                <h3 className="text-base font-bold font-display text-ink mb-2">Product Description</h3>
                <p>{item.description || 'High quality commercial rental product provided by our verified rental partner.'}</p>
              </div>

              {/* Key Features */}
              {item.features && item.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-display text-ink">Key Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-data flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-ink font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Table */}
              {item.specifications && Object.keys(item.specifications).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-display text-ink">Technical Specifications</h3>
                  <div className="border border-ink/10 rounded-2xl overflow-hidden text-xs font-data">
                    {Object.entries(item.specifications).map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3.5 ${
                          idx % 2 === 0 ? 'bg-slate-50' : 'bg-paper'
                        }`}
                      >
                        <span className="text-slate font-medium">{key}</span>
                        <span className="text-ink font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Terms & Policies */}
          {activeTab === 'policies' && (
            <div className="space-y-4 animate-in fade-in text-xs font-data">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Rental Terms & Transparency Guarantee</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  All rentals through our online partner network include insured doorstep delivery, sanitized gear checks, and transparent refund policies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-ink/10 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-ink text-sm flex items-center gap-2 font-display">
                    <Clock className="w-4 h-4 text-clay" />
                    Cancellation Policy
                  </h4>
                  <p className="text-slate leading-relaxed">
                    {item.cancellationPolicy || 'Free cancellation up to 24 hours prior to delivery. 50% refund thereafter.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-ink/10 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-ink text-sm flex items-center gap-2 font-display">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Damage Waiver & Coverage
                  </h4>
                  <p className="text-slate leading-relaxed">
                    {item.damagePolicy || 'Insured against accidental liquid or drop damage. Normal wear and tear is not penalized.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-ink/10 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-ink text-sm flex items-center gap-2 font-display">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Overtime & Late Return Charges
                  </h4>
                  <p className="text-slate leading-relaxed">
                    {item.latePenaltyFee || '₹300/hour or ₹2,000/day for overdue unreturned items without prior extension.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-ink/10 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-ink text-sm flex items-center gap-2 font-display">
                    <RotateCcw className="w-4 h-4 text-moss" />
                    Security Deposit Refund Timeline
                  </h4>
                  <p className="text-slate leading-relaxed">
                    Deposit is refunded to your original UPI/bank account within 4-24 hours after return inspection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews & Ratings */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Rating Summary Bar */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="font-display font-bold text-4xl text-ink">{item.rating || 4.9}</span>
                    <span className="text-slate text-sm font-data">out of 5.0</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-slate font-data">{reviewsList.length} verified renter reviews</p>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs font-data">
                  {[
                    { stars: 5, pct: 88 },
                    { stars: 4, pct: 10 },
                    { stars: 3, pct: 2 },
                    { stars: 2, pct: 0 },
                    { stars: 1, pct: 0 },
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-2">
                      <span className="w-3 text-slate">{row.stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-slate">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-ink/10 bg-paper space-y-2 text-xs font-data">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-clay text-paper font-bold flex items-center justify-center font-display">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-ink text-sm flex items-center gap-1.5">
                            {rev.userName}
                            {rev.verifiedRenter && (
                              <span className="text-[10px] font-data bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                                ✓ Verified Renter
                              </span>
                            )}
                          </p>
                          <p className="text-slate text-[10px]">{rev.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate text-sm leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate border-t border-ink/5">
                      <span>Was this review helpful?</span>
                      <button
                        onClick={() => handleHelpfulClick(rev.id)}
                        className="flex items-center gap-1 text-ink font-semibold hover:text-clay transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({rev.helpfulCount + (helpfulVotes[rev.id] || 0)})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: FAQ Accordion */}
          {activeTab === 'faq' && (
            <div className="space-y-3 animate-in fade-in text-xs font-data">
              {[
                {
                  q: 'How does the security deposit work?',
                  a: 'For high-value items, a refundable security deposit is temporarily held during the rental period. Once the item is returned and passes a quick inspection, the full deposit is refunded to your original payment account within 4-24 hours.'
                },
                {
                  q: 'What happens if I accidentally damage the item?',
                  a: 'All rentals are covered under our partner protection guarantee. Normal wear and tear is never charged. For accidental drops or liquid spills, our damage waiver covers repairs up to ₹50,000.'
                },
                {
                  q: 'How is doorstep delivery and return handled?',
                  a: 'Our logistics partner delivers the sanitized item in a protective case to your address. On your scheduled return date, a rider arrives at your doorstep to inspect and collect the item. No trip to the post office required!'
                },
                {
                  q: 'Can I extend my rental period?',
                  a: 'Yes! You can extend your rental anytime before the return date directly from your "My Activity" dashboard at standard daily rates.'
                }
              ].map((faq, i) => (
                <details key={i} className="group border border-ink/10 rounded-2xl bg-slate-50 p-4 transition-all">
                  <summary className="font-bold text-ink text-sm font-display cursor-pointer flex items-center justify-between list-none">
                    <span>{faq.q}</span>
                    <HelpCircle className="w-4 h-4 text-clay shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-slate leading-relaxed border-t border-ink/5 pt-2.5">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Footer Bar */}
        <div className="sticky bottom-0 bg-paper/95 backdrop-blur-md border-t border-ink/10 p-4 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-data text-slate block">Total Daily Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-2xl text-clay">{formatRupee(item.pricePerDay)}</span>
              <span className="text-slate text-xs font-data">/ day</span>
            </div>
          </div>

          <Button
            variant="clay"
            size="lg"
            className="font-bold font-display px-8 shadow-lg hover:shadow-xl"
            onClick={onProceedToBooking}
          >
            Rent Now
          </Button>
        </div>
      </div>
    </div>
  );
}
