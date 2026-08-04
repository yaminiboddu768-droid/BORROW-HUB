'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  PauseCircle,
  PlayCircle,
  Filter,
  Package,
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  Camera,
  Layers,
  Check,
  RotateCcw
} from 'lucide-react';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import { PartnerProductDetailModal } from '@/components/partner/PartnerProductDetailModal';

export default function InventoryPage() {
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);

  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tools',
    brand: '',
    model: '',
    description: '',
    condition: 'Excellent',
    marketPrice: '',
    pricePerDay: '',
    pricePerHour: '',
    securityDeposit: '',
    damagePolicy: 'Minor',
    quantity: '1',
    deliveryType: 'Pickup Only',
    isAvailable: true,
    availabilityStatus: 'Available',
  });

  const categories = [
    'Power Tools',
    'Hand Tools',
    'Tools',
    'Cameras',
    'Electronics',
    'Party',
    'Outdoors',
    'Sports',
    'Cookware',
    'Books',
    'Furniture',
    'Fitness',
    'Construction',
    'Cleaning Equipment',
    'Vehicles',
    'Other',
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/partner/products?filter=${encodeURIComponent(filter)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchProducts();
    }
  }, [view, filter]);

  // Image upload handler supporting file picker, camera & drag/drop
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    const fileToDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const newUrls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('One or more images exceed 5MB limit.');
        continue;
      }

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            newUrls.push(data.url);
            continue;
          }
        }
      } catch {
        console.warn('API upload failed, using DataURL fallback');
      }

      // Reliable DataURL fallback
      try {
        const dataUrl = await fileToDataUrl(file);
        newUrls.push(dataUrl);
      } catch (err) {
        console.error('Failed to convert image:', err);
      }
    }

    if (newUrls.length > 0) {
      setUploadedImages((prev) => [...prev, ...newUrls].slice(0, 8)); // Support up to 8 product photos
    }
    setIsUploading(false);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplaceImage = (index: number) => {
    // Open file picker to replace specific index
    handleRemoveImage(index);
    fileInputRef.current?.click();
  };

  const handleAction = async (id: string, action: string, currentData?: any) => {
    try {
      if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete "${currentData?.name || 'this product'}"?`)) return;
        const res = await fetch(`/api/partner/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          addToast('Product Deleted', 'Item removed from your inventory.');
          fetchProducts();
        }
      } else if (action === 'toggleStatus') {
        const nextAvailable = !currentData.isAvailable;
        const nextStatus = nextAvailable ? 'Available' : 'Unavailable';
        await fetch(`/api/partner/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAvailable: nextAvailable, availabilityStatus: nextStatus }),
        });
        addToast('Status Updated', `Listing is now ${nextAvailable ? 'Active & Available' : 'Paused/Unavailable'}.`);
        fetchProducts();
      } else if (action === 'setStatus') {
        const isAvailable = currentData.status === 'Available';
        await fetch(`/api/partner/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ availabilityStatus: currentData.status, isAvailable }),
        });
        addToast('Status Updated', `Listing status changed to "${currentData.status}".`);
        fetchProducts();
      } else if (action === 'edit') {
        let existingImages: string[] = [];
        if (Array.isArray(currentData.imageUrls)) {
          existingImages = currentData.imageUrls;
        } else if (typeof currentData.imageUrls === 'string') {
          try {
            const parsed = JSON.parse(currentData.imageUrls);
            if (Array.isArray(parsed)) existingImages = parsed;
          } catch {
            if (currentData.imageUrls) existingImages = [currentData.imageUrls];
          }
        } else if (currentData.imageUrl) {
          existingImages = [currentData.imageUrl];
        }

        setUploadedImages(existingImages);
        setFormData({
          name: currentData.name || '',
          category: currentData.category || 'Tools',
          brand: currentData.brand || '',
          model: currentData.model || '',
          description: currentData.description || '',
          condition: currentData.condition || 'Excellent',
          marketPrice: currentData.marketPrice ? currentData.marketPrice.toString() : '',
          pricePerDay: currentData.pricePerDay ? currentData.pricePerDay.toString() : '',
          pricePerHour: currentData.pricePerHour ? currentData.pricePerHour.toString() : '',
          securityDeposit: currentData.securityDeposit ? currentData.securityDeposit.toString() : '',
          damagePolicy: currentData.damagePolicy || 'Minor',
          quantity: currentData.quantity ? currentData.quantity.toString() : '1',
          deliveryType: currentData.deliveryType || 'Pickup Only',
          isAvailable: currentData.isAvailable !== false,
          availabilityStatus: currentData.availabilityStatus || 'Available',
        });
        setEditingId(id);
        setView('form');
      } else if (action === 'duplicate') {
        const payload = {
          name: `${currentData.name} (Copy)`,
          category: currentData.category,
          brand: currentData.brand || '',
          model: currentData.model || '',
          description: currentData.description || '',
          condition: currentData.condition || 'Excellent',
          marketPrice: currentData.marketPrice || '',
          pricePerDay: currentData.pricePerDay || '',
          pricePerHour: currentData.pricePerHour || '',
          securityDeposit: currentData.securityDeposit || '',
          damagePolicy: currentData.damagePolicy || 'Minor',
          quantity: currentData.quantity || '1',
          deliveryType: currentData.deliveryType || 'Pickup Only',
          isAvailable: true,
          images: currentData.imageUrls ? (typeof currentData.imageUrls === 'string' ? JSON.parse(currentData.imageUrls) : currentData.imageUrls) : [],
        };

        const res = await fetch('/api/partner/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          addToast('Duplicated', 'Product listing duplicated successfully.');
          fetchProducts();
        }
      }
    } catch (error) {
      addToast('Error', 'Action failed.', 'warning');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Validation Error', 'Product name is required.', 'warning');
      return;
    }
    if (!formData.pricePerDay || parseFloat(formData.pricePerDay) <= 0) {
      addToast('Validation Error', 'Per day rent rate is required.', 'warning');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/partner/products/${editingId}` : '/api/partner/products';

      const payload = {
        ...formData,
        images: uploadedImages,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast('Success', `Product ${editingId ? 'updated' : 'published'} successfully.`);
        setView('list');
        setEditingId(null);
        setUploadedImages([]);
        fetchProducts();
      } else {
        const errData = await res.json();
        addToast('Error', errData.error || 'Failed to save product.', 'warning');
      }
    } catch (error) {
      addToast('Error', 'Failed to save product.', 'warning');
    }
  };

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const getStatusBadgeStyle = (st: string, isAvailable: boolean) => {
    if (st === 'Rented' || st === 'Currently Rented') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (st === 'Reserved') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (st === 'Maintenance') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (st === 'Sold Out' || st === 'Out of Stock') return 'bg-red-100 text-red-800 border-red-200';
    if (!isAvailable || st === 'Unavailable' || st === 'Paused') return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  // FORM VIEW: ADD / EDIT PRODUCT
  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
        {/* Detail View Modal */}
        {viewingProduct && (
          <PartnerProductDetailModal
            product={viewingProduct}
            onClose={() => setViewingProduct(null)}
            onEdit={() => {
              const target = viewingProduct;
              setViewingProduct(null);
              handleAction(target.id, 'edit', target);
            }}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-data">
              Partner Inventory
            </span>
            <h1 className="text-2xl font-bold font-display text-ink">
              {editingId ? 'Edit Inventory Item' : 'Add New Item to Inventory'}
            </h1>
          </div>
          <Button variant="outline" onClick={() => setView('list')}>
            Cancel & Return
          </Button>
        </div>

        <Card variant="default" className="p-6 sm:p-8 space-y-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            
            {/* ISSUE 1: IMAGE UPLOAD SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-amber-500" />
                    Product Images & Gallery *
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload high-resolution pictures of your rental gear. The first image will be used as the cover thumbnail.
                  </p>
                </div>
                <span className="text-xs font-bold font-data text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {uploadedImages.length} / 8 photos
                </span>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Click to upload product photos, or drag & drop files here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP up to 5MB each. Up to 8 clear photos recommended.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-slate-50 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                  >
                    <Camera className="w-4 h-4 mr-1.5 text-amber-600" />
                    <span>Take Photo with Camera</span>
                  </Button>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5" />
                    <span>Browse Image Files</span>
                  </Button>
                </div>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />

              {isUploading && (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing and uploading images...</span>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Uploaded Image Previews Grid */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 font-data">Image Previews:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {uploadedImages.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group bg-slate-100 shadow-xs"
                      >
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Cover Badge for 1st image */}
                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                            COVER
                          </div>
                        )}

                        {/* Image Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReplaceImage(idx)}
                            className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 transition-transform hover:scale-110"
                            title="Replace / Change Image"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-transform hover:scale-110"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-display text-ink border-b border-slate-100 pb-2">
                Basic Product Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name *"
                  required
                  placeholder="e.g. Sony FX3 Cinema Camera Kit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Category *</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Brand Name"
                  placeholder="e.g. Sony, DeWalt, Bosch"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
                <Input
                  label="Model Number / Series"
                  placeholder="e.g. FX3 / Mark IV"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Item Condition</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  >
                    <option>Brand New</option>
                    <option>Like New</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Listing Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    value={formData.availabilityStatus}
                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value, isAvailable: e.target.value === 'Available' })}
                  >
                    <option value="Available">Available for Rent</option>
                    <option value="Currently Rented">Currently Rented</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Unavailable">Unavailable / Paused</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Item Description & Specifications</label>
                <textarea
                  className="w-full p-3.5 rounded-xl border border-slate-200 h-28 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Describe included accessories, technical specs, condition details, and usage instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-display text-ink border-b border-slate-100 pb-2">
                Rental Pricing & Deposit Terms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Per Day Rent (₹) *"
                  type="number"
                  required
                  step="1"
                  min="1"
                  placeholder="2400"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                />
                <Input
                  label="Per Hour Rent (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="350"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                />
                <Input
                  label="Estimated Market Value (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="250000"
                  value={formData.marketPrice}
                  onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                />
                <Input
                  label="Security Deposit (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="25000"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Damage Policy</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    value={formData.damagePolicy}
                    onChange={(e) => setFormData({ ...formData, damagePolicy: e.target.value })}
                  >
                    <option value="Minor">Minor Scratch Coverage Included</option>
                    <option value="Major">Deductible Deposit Coverage</option>
                    <option value="Replacement">Full Replacement Value</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Availability & Delivery */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-display text-ink border-b border-slate-100 pb-2">
                Inventory Stock & Delivery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Available Quantity / Units"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Delivery Options</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    value={formData.deliveryType}
                    onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                  >
                    <option>Pickup Only</option>
                    <option>Doorstep Delivery Available</option>
                    <option>Pickup + Doorstep Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setView('list')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8"
              >
                {editingId ? 'Update Product Details' : 'Publish Product to Inventory'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // LIST VIEW: MY PRODUCTS INVENTORY
  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Product Detail Modal */}
      {viewingProduct && (
        <PartnerProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {
            const target = viewingProduct;
            setViewingProduct(null);
            handleAction(target.id, 'edit', target);
          }}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Inventory Management</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage your partner listings, edit prices, upload images, and control rental availability.
          </p>
        </div>

        <Button
          variant="accent"
          className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold shadow-xs"
          onClick={() => {
            setEditingId(null);
            setUploadedImages([]);
            setFormData({
              name: '',
              category: 'Tools',
              brand: '',
              model: '',
              description: '',
              condition: 'Excellent',
              marketPrice: '',
              pricePerDay: '',
              pricePerHour: '',
              securityDeposit: '',
              damagePolicy: 'Minor',
              quantity: '1',
              deliveryType: 'Pickup Only',
              isAvailable: true,
              availabilityStatus: 'Available',
            });
            setView('form');
          }}
        >
          <Plus className="w-4 h-4 mr-2 stroke-[3]" />
          Add New Item
        </Button>
      </div>

      <Card variant="default" className="p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        
        {/* Filters & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {['All', 'Active', 'Currently Rented', 'Reserved', 'Unavailable', 'Maintenance'].map((f) => (
              <button
                key={f}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === f ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <Package className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ISSUE 2: PUBLISHED ITEMS INVENTORY PRODUCTS LISTING */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm animate-pulse">
            Loading your inventory items...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-slate-900 font-bold text-base">No inventory products found</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {searchQuery || filter !== 'All'
                ? 'No items match your selected filter criteria. Try clearing search filters.'
                : 'You have not added any products yet. Click "Add New Item" above to publish your first listing.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold"
            >
              Clear Search Filters
            </Button>
          </div>
        ) : displayMode === 'grid' ? (
          /* GRID CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => {
              const thumbnail = getItemImage(item);
              const status = item.availabilityStatus || (item.isAvailable && item.quantity > 0 ? 'Available' : 'Unavailable');

              return (
                <Card
                  key={item.id}
                  variant="interactive"
                  className="flex flex-col justify-between overflow-hidden p-0 rounded-2xl border border-slate-200/80 bg-white group hover:shadow-md transition-all"
                >
                  <div className="relative h-48 w-full bg-slate-100 border-b border-slate-100 overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={item.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name); }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-xs ${getStatusBadgeStyle(status, item.isAvailable)}`}>
                        {status}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-data">
                        <span>{item.brand ? `Brand: ${item.brand}` : item.category}</span>
                        {item.model && <span>Model: {item.model}</span>}
                      </div>

                      <h3 className="font-display font-bold text-lg text-slate-900 leading-tight line-clamp-2">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      {/* Price & Deposit Summary */}
                      <div className="flex items-center justify-between text-xs font-data">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Rate</span>
                          <span className="font-bold text-base text-slate-900">{formatRupee(item.pricePerDay)}</span>
                        </div>
                        {item.securityDeposit ? (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deposit</span>
                            <span className="font-bold text-xs text-slate-700">{formatRupee(item.securityDeposit)}</span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Deposit</span>
                            <span className="font-bold text-xs text-emerald-700">No Deposit</span>
                          </div>
                        )}
                      </div>

                      {/* Owner Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => setViewingProduct(item)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Details</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => handleAction(item.id, 'edit', item)}
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                          </Button>

                          <button
                            onClick={() => handleAction(item.id, 'delete', item)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quick Status Control Buttons */}
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAction(item.id, 'setStatus', { status: 'Available' })}
                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              status === 'Available'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            Available
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction(item.id, 'setStatus', { status: 'Currently Rented' })}
                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              status === 'Currently Rented' || status === 'Rented'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            Rented
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction(item.id, 'setStatus', { status: 'Unavailable' })}
                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              status === 'Unavailable' || status === 'Paused'
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            Pause
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Product Image & Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Per Day Rent</th>
                    <th className="px-4 py-3">Security Deposit</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((item) => {
                    const thumbnail = getItemImage(item);
                    const status = item.availabilityStatus || (item.isAvailable && item.quantity > 0 ? 'Available' : 'Unavailable');

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img src={thumbnail} alt={item.name} onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name); }} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                              {item.brand && <p className="text-[11px] text-slate-400 font-data">{item.brand} {item.model ? `• ${item.model}` : ''}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium text-xs">{item.category}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{formatRupee(item.pricePerDay)}</td>
                        <td className="px-4 py-3 text-slate-700 text-xs font-semibold">{item.securityDeposit ? formatRupee(item.securityDeposit) : 'No Deposit'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(status, item.isAvailable)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => setViewingProduct(item)}
                            className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(item.id, 'toggleStatus', item)}
                            className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Pause / Resume"
                          >
                            {item.isAvailable ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleAction(item.id, 'edit', item)}
                            className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(item.id, 'delete', item)}
                            className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Card>
    </div>
  );
}
