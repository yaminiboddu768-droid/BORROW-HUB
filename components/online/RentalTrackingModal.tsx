'use client';

import React from 'react';
import { OnlineRentalOrder, OnlineRentalStage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupee } from '@/lib/format';
import {
  X,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  PackageCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface RentalTrackingModalProps {
  order: OnlineRentalOrder;
  onClose: () => void;
  onAdvanceStage?: (orderId: string) => void;
}

export function RentalTrackingModal({
  order,
  onClose,
  onAdvanceStage,
}: RentalTrackingModalProps) {
  const STAGES: OnlineRentalStage[] = [
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

  const currentStageIndex = STAGES.indexOf(order.orderStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-paper border-2 border-clay/30 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-paper/95 border-b border-ink/10 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="clay">Online Partner Order</Badge>
              <span className="text-xs font-data text-slate">ID: {order.id}</span>
            </div>
            <h2 className="font-display font-bold text-xl text-ink mt-1">
              Rental Order & Deposit Tracker
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Tracking Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-xs font-data">
          {/* Item & Tracking Header Card */}
          <div className="p-4 rounded-2xl bg-clay/10 border border-clay/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={order.itemImage}
                alt={order.itemName}
                className="w-16 h-16 rounded-xl object-cover border border-ink/10 shrink-0"
              />
              <div>
                <p className="text-[10px] font-bold uppercase text-clay">{order.platformName}</p>
                <h3 className="font-bold text-ink text-base font-display">{order.itemName}</h3>
                <p className="text-slate text-[11px]">
                  Tracking: <strong className="text-ink">{order.trackingNumber}</strong>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right bg-white/80 p-3 rounded-xl border border-clay/20 shrink-0 w-full sm:w-auto">
              <p className="text-[10px] text-slate font-medium">Deposit Refund Status</p>
              <span className={`inline-block font-bold text-xs px-2.5 py-0.5 rounded-full mt-0.5 ${
                order.depositStatus === 'Refunded'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {order.depositStatus === 'Refunded' ? '✓ Refunded to UPI' : `Held (${formatRupee(order.depositAmount)})`}
              </span>
            </div>
          </div>

          {/* 9-Stage Progress Pipeline */}
          <div className="space-y-4">
            <h4 className="font-bold text-ink text-sm font-display flex items-center gap-2">
              <Truck className="w-4 h-4 text-clay" />
              Live Order Progress Pipeline
            </h4>

            <div className="relative pl-6 space-y-6 border-l-2 border-clay/30 my-2">
              {STAGES.map((stg, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stg} className="relative group">
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow transition-all ${
                      isCurrent
                        ? 'bg-clay text-paper ring-4 ring-clay/20 scale-110'
                        : isPassed
                        ? 'bg-emerald-600 text-paper'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>

                    <div className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-clay/10 border-clay/40 font-bold text-ink'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200 text-ink'
                        : 'bg-paper border-ink/10 text-slate opacity-60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm">{stg}</span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold bg-clay text-paper px-2 py-0.5 rounded-full animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate font-normal mt-0.5">
                        {idx === 0 && 'Order registered in system with seller.'}
                        {idx === 1 && 'Partner verified gear availability.'}
                        {idx === 2 && `Payment of ${formatRupee(order.totalPaid)} verified.`}
                        {idx === 3 && 'Sanitized & packed in protective travel hardcase.'}
                        {idx === 4 && 'Handed to doorstep express rider.'}
                        {idx === 5 && 'Item is currently with you. Enjoy your rental!'}
                        {idx === 6 && 'Return courier scheduled for pickup.'}
                        {idx === 7 && 'Item returned & completed technical inspection.'}
                        {idx === 8 && `Security deposit of ${formatRupee(order.depositAmount)} credited back.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Deposit Summary */}
          <div className="p-4 rounded-2xl border border-ink/10 bg-slate-50 space-y-2 text-xs">
            <h5 className="font-bold text-ink font-display text-sm">Payment & Financial Summary</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
              <div>
                <span className="text-slate block">Rental Charge</span>
                <span className="font-bold text-ink">{formatRupee(order.rentalFee)}</span>
              </div>
              <div>
                <span className="text-slate block">Security Deposit</span>
                <span className="font-bold text-ink">{formatRupee(order.depositAmount)}</span>
              </div>
              <div>
                <span className="text-slate block">Payment Method</span>
                <span className="font-bold text-ink">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate block">Total Paid</span>
                <span className="font-bold text-clay">{formatRupee(order.totalPaid)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-paper/95 border-t border-ink/10 p-4 flex items-center justify-between gap-3">
          {onAdvanceStage && currentStageIndex < STAGES.length - 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdvanceStage(order.id)}
              className="text-xs font-bold font-data"
            >
              Simulate Next Stage →
            </Button>
          )}

          <Button
            variant="clay"
            onClick={onClose}
            className="ml-auto font-bold font-display px-6"
          >
            Close Tracker
          </Button>
        </div>
      </div>
    </div>
  );
}
