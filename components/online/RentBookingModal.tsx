'use client';

import React, { useState } from 'react';
import { OnlineStoreItem, OnlineRentalOrder } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import {
  X,
  Calendar as CalendarIcon,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface RentBookingModalProps {
  item: OnlineStoreItem;
  onClose: () => void;
  onConfirmOrder: (order: OnlineRentalOrder) => void;
}

export function RentBookingModal({
  item,
  onClose,
  onConfirmOrder,
}: RentBookingModalProps) {
  // Dates calculation helper
  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [startDateStr, setStartDateStr] = useState(today);
  const [endDateStr, setEndDateStr] = useState(threeDaysLater);
  const [deliveryOption, setDeliveryOption] = useState<'doorstep' | 'pickup'>('doorstep');
  const [includeDamageWaiver, setIncludeDamageWaiver] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Sunshine Heights, Outer Ring Road, Bangalore - 560103');
  const [upiId, setUpiId] = useState('user@okicici');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Compute days
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const calculatedDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  // Pricing math
  const pricePerDay = item.pricePerDay || 500;
  const rawRentalFee = pricePerDay * calculatedDays;
  const multiDayDiscount = calculatedDays >= 3 ? Math.round(rawRentalFee * 0.1) : 0;
  const rentalFee = rawRentalFee - multiDayDiscount;

  const depositAmount = item.depositAmount || 0;
  const platformFee = 99;
  const deliveryFee = deliveryOption === 'doorstep' ? (rentalFee > 1500 ? 0 : 199) : 0;
  const damageWaiverFee = includeDamageWaiver ? 149 : 0;

  const totalPayableNow = rentalFee + depositAmount + platformFee + deliveryFee + damageWaiverFee;

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const order: OnlineRentalOrder = {
        id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
        itemId: item.id,
        itemName: item.name,
        itemImage: getItemImage(item),
        platformName: item.platformName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalDays: calculatedDays,
        pricePerDay,
        rentalFee,
        depositAmount,
        platformFee,
        deliveryFee,
        totalPaid: totalPayableNow,
        paymentMethod: selectedPaymentMethod === 'upi' ? `UPI (${upiId})` : selectedPaymentMethod === 'card' ? 'Credit / Debit Card' : 'Net Banking',
        paymentStatus: 'PAID',
        orderStatus: 'Payment Completed',
        depositStatus: depositAmount > 0 ? 'Held' : 'Refunded',
        createdAt: 'Just now',
        trackingNumber: 'TRK-LOOP-' + Math.floor(100000 + Math.random() * 900000),
      };

      setIsSubmitting(false);
      onConfirmOrder(order);
    }, 800);
  };

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-paper border-2 border-clay/30 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-paper/95 border-b border-ink/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-clay text-paper font-bold flex items-center justify-center font-display text-sm">
              {step}
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-ink">
                {step === 1 ? 'Configure Rental & Dates' : 'Review & Checkout'}
              </h2>
              <p className="text-xs text-slate font-data">Step {step} of 2 • Insured Partner Booking</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitBooking} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-xs font-data">
          {/* Summary Product Snippet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img
              src={getItemImage(item)}
              alt={item.name}
              onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item?.category, item?.name); }}
              className="w-14 h-14 rounded-xl object-cover border border-ink/10 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Badge variant="clay" size="sm" className="mb-1">{item.platformName}</Badge>
              <h4 className="font-bold text-ink text-sm font-display truncate">{item.name}</h4>
              <p className="text-slate text-[11px]">{formatRupee(pricePerDay)} / day • {item.deliveryEstimate || 'Delivered in 24h'}</p>
            </div>
          </div>

          {step === 1 ? (
            /* STEP 1: Date & Option Selection */
            <div className="space-y-6 animate-in fade-in">
              {/* Date Selection Grid */}
              <div className="space-y-3">
                <label className="font-bold text-ink text-sm font-display flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-clay" />
                  Select Rental Duration
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-slate font-medium">Start Date</span>
                    <input
                      type="date"
                      min={today}
                      value={startDateStr}
                      onChange={(e) => {
                        setStartDateStr(e.target.value);
                        if (new Date(e.target.value) >= new Date(endDateStr)) {
                          const nextDay = new Date(new Date(e.target.value).getTime() + 86400000);
                          setEndDateStr(nextDay.toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full p-3 rounded-xl border border-ink/20 bg-paper text-ink font-bold text-sm focus:outline-none focus:border-clay"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-slate font-medium">Return Date</span>
                    <input
                      type="date"
                      min={startDateStr}
                      value={endDateStr}
                      onChange={(e) => setEndDateStr(e.target.value)}
                      className="w-full p-3 rounded-xl border border-ink/20 bg-paper text-ink font-bold text-sm focus:outline-none focus:border-clay"
                      required
                    />
                  </div>
                </div>

                {/* Duration Banner */}
                <div className="p-3 rounded-xl bg-clay/10 border border-clay/30 flex items-center justify-between font-bold text-ink">
                  <span>Duration: <strong className="text-clay font-display text-sm">{calculatedDays} Day{calculatedDays > 1 ? 's' : ''}</strong></span>
                  {calculatedDays >= 3 && (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                      🎉 10% Multi-Day Discount Applied
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Option Selector */}
              <div className="space-y-2">
                <label className="font-bold text-ink text-sm font-display flex items-center gap-2">
                  <Truck className="w-4 h-4 text-clay" />
                  Delivery & Fulfillment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    onClick={() => setDeliveryOption('doorstep')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      deliveryOption === 'doorstep'
                        ? 'border-clay bg-clay/5 ring-1 ring-clay/20'
                        : 'border-ink/10 hover:border-ink/20 bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={deliveryOption === 'doorstep'}
                      onChange={() => setDeliveryOption('doorstep')}
                      className="mt-1 text-clay"
                    />
                    <div>
                      <p className="font-bold text-ink text-sm font-display">Insured Doorstep Shipping</p>
                      <p className="text-slate text-[11px] mt-0.5">Delivered & picked up from your address ({rentalFee > 1500 ? 'FREE' : '₹199'})</p>
                    </div>
                  </label>

                  <label 
                    onClick={() => setDeliveryOption('pickup')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      deliveryOption === 'pickup'
                        ? 'border-clay bg-clay/5 ring-1 ring-clay/20'
                        : 'border-ink/10 hover:border-ink/20 bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={deliveryOption === 'pickup'}
                      onChange={() => setDeliveryOption('pickup')}
                      className="mt-1 text-clay"
                    />
                    <div>
                      <p className="font-bold text-ink text-sm font-display">Self Pickup from Partner</p>
                      <p className="text-slate text-[11px] mt-0.5">Pick up from verified partner hub (FREE)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Damage Waiver Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDamageWaiver}
                    onChange={(e) => setIncludeDamageWaiver(e.target.checked)}
                    className="mt-1 accent-clay"
                  />
                  <div>
                    <span className="font-bold text-ink text-sm font-display flex items-center gap-1.5">
                      Add ₹50,000 Damage Protection Waiver (+₹149)
                    </span>
                    <p className="text-slate text-[11px] mt-0.5">
                      Covers accidental liquid spills, drops, and component failures. Zero deductible liability.
                    </p>
                  </div>
                </label>
              </div>

              {/* Live Cost Summary Preview */}
              <div className="p-4 rounded-2xl border border-ink/10 bg-paper space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate">
                  <span>Base Rental ({calculatedDays} days @ {formatRupee(pricePerDay)}/day)</span>
                  <span className="font-bold text-ink">{formatRupee(rawRentalFee)}</span>
                </div>

                {multiDayDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Multi-Day Discount</span>
                    <span className="font-bold">- {formatRupee(multiDayDiscount)}</span>
                  </div>
                )}

                {depositAmount > 0 && (
                  <div className="flex items-center justify-between text-slate">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-clay" />
                      Refundable Security Deposit
                    </span>
                    <span className="font-bold text-ink">{formatRupee(depositAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate">
                  <span>Platform & Sanitation Fee</span>
                  <span className="font-bold text-ink">{formatRupee(platformFee)}</span>
                </div>

                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-slate">
                    <span>Insured Doorstep Shipping</span>
                    <span className="font-bold text-ink">{formatRupee(deliveryFee)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-ink/10 flex items-center justify-between text-sm font-bold text-ink">
                  <span>Total Amount Payable Now</span>
                  <span className="font-display font-bold text-lg text-clay">{formatRupee(totalPayableNow)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Delivery Address & Payment */
            <div className="space-y-6 animate-in fade-in">
              {/* Delivery Address Input */}
              {deliveryOption === 'doorstep' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-ink text-sm font-display flex items-center gap-2">
                    <Truck className="w-4 h-4 text-clay" />
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-3 rounded-xl border border-ink/20 bg-paper text-ink font-data text-xs focus:outline-none focus:border-clay"
                    placeholder="Enter full street address, landmark, pincode"
                    required
                  />
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="font-bold text-ink text-sm font-display flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-clay" />
                  Select Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'upi', label: 'UPI / GPay / PhonePe' },
                    { id: 'card', label: 'Credit / Debit Card' },
                    { id: 'netbanking', label: 'Net Banking' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedPaymentMethod === pm.id
                          ? 'border-clay bg-clay/10 text-clay font-bold'
                          : 'border-ink/10 text-slate hover:border-ink/20'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>

                {selectedPaymentMethod === 'upi' && (
                  <Input
                    label="UPI ID / VPA"
                    placeholder="yourname@okicici or mobile@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                )}
              </div>

              {/* Refund Guarantee Explanation */}
              {depositAmount > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-900">
                  <p className="font-bold text-sm flex items-center gap-1.5 font-display">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    100% Refundable Security Deposit Guarantee
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Your deposit of <strong>{formatRupee(depositAmount)}</strong> will be automatically refunded back to your payment account within 4 hours after your rental return inspection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-ink/10 flex items-center justify-between gap-3">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}

            <Button
              type="submit"
              variant="clay"
              size="lg"
              className="ml-auto font-bold font-display px-8 shadow-lg hover:shadow-xl"
              isLoading={isSubmitting}
            >
              {step === 1 ? (
                <>
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </>
              ) : (
                `Pay ${formatRupee(totalPayableNow)} & Confirm Rental`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
