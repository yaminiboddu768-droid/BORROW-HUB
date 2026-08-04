'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { X, Save, Tag, DollarSign, ShieldCheck, FileText, Globe, Check } from 'lucide-react';

interface Props {
  item: any;
  onClose: () => void;
  onSaved: () => void;
}

export function EditItemModal({ item, onClose, onSaved }: Props) {
  const [name, setName] = useState(item.name || '');
  const [category, setCategory] = useState(item.category || 'TOOLS');
  const [description, setDescription] = useState(item.description || '');
  const [marketPrice, setMarketPrice] = useState(item.marketPrice ? item.marketPrice.toString() : '');
  const [pricePerDay, setPricePerDay] = useState(item.pricePerDay ? item.pricePerDay.toString() : '');
  const [pricePerHour, setPricePerHour] = useState(item.pricePerHour ? item.pricePerHour.toString() : '');
  const [securityDeposit, setSecurityDeposit] = useState(item.securityDeposit ? item.securityDeposit.toString() : '');
  const [penaltyPerDay, setPenaltyPerDay] = useState(item.penaltyPerDay ? item.penaltyPerDay.toString() : '');
  const [penaltyPerHour, setPenaltyPerHour] = useState(item.penaltyPerHour ? item.penaltyPerHour.toString() : '');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(item.availabilityStatus || 'Available');
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'TOOLS', 'ELECTRONICS', 'SPORTS', 'COOKWARE', 'BOOKS', 'OUTDOORS', 
    'FURNITURE', 'TRAVEL', 'PARTY', 'FITNESS', 'VEHICLES', 'APPLIANCES', 'OTHER'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item title is required');
      return;
    }
    if (!pricePerDay || parseFloat(pricePerDay) <= 0) {
      setError('Price per day must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isAvailable = availabilityStatus === 'Available';
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          marketPrice: marketPrice ? parseFloat(marketPrice) : null,
          pricePerDay: parseFloat(pricePerDay),
          pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
          securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
          penaltyPerDay: penaltyPerDay ? parseFloat(penaltyPerDay) : null,
          penaltyPerHour: penaltyPerHour ? parseFloat(penaltyPerHour) : null,
          availabilityStatus,
          isAvailable,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to update item details');
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Update item error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col my-auto border border-ink/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-ink/10 flex items-center justify-between">
          <div>
            <Badge variant="moss" className="mb-1">Owner Controls</Badge>
            <h2 className="font-display font-bold text-2xl text-ink">Edit Item Listing</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate hover:text-ink rounded-full bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="editItemForm" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-grow">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Item Title *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <div className="space-y-1.5">
              <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-moss" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-moss" />
              <span>Availability & Listing Status</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Available', value: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { label: 'Rented', value: 'Rented', color: 'bg-blue-50 text-blue-700 border-blue-300' },
                { label: 'Unavailable', value: 'Unavailable', color: 'bg-amber-50 text-amber-700 border-amber-300' },
                { label: 'Sold Out', value: 'Sold Out', color: 'bg-red-50 text-red-700 border-red-300' },
              ].map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setAvailabilityStatus(st.value)}
                  className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                    availabilityStatus === st.value
                      ? `${st.color} shadow-sm ring-2 ring-moss/30`
                      : 'bg-white border-slate-200 text-slate hover:bg-slate-50'
                  }`}
                >
                  {availabilityStatus === st.value && <Check className="w-3.5 h-3.5" />}
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="bg-moss/5 p-4 rounded-xl border border-moss/20 space-y-4">
            <h3 className="text-sm font-display font-bold text-moss flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Pricing & Deposit Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price Per Day (₹) *"
                type="number"
                step="1"
                min="1"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
              />
              <Input
                label="Price Per Hour (₹)"
                type="number"
                step="1"
                min="0"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
              />
              <Input
                label="Market Price (₹)"
                type="number"
                step="1"
                min="0"
                value={marketPrice}
                onChange={(e) => setMarketPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Security Deposit (₹)"
                type="number"
                step="1"
                min="0"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
              />
              <Input
                label="Late Penalty / Day (₹)"
                type="number"
                step="1"
                min="0"
                value={penaltyPerDay}
                onChange={(e) => setPenaltyPerDay(e.target.value)}
              />
              <Input
                label="Late Penalty / Hour (₹)"
                type="number"
                step="1"
                min="0"
                value={penaltyPerHour}
                onChange={(e) => setPenaltyPerHour(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-moss" />
              <span>Item Description & Details</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your item..."
              className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          {/* Image URL */}
          <Input
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-ink/10 flex items-center justify-end gap-3 bg-slate-50">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="editItemForm" variant="primary" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
