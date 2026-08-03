'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import { Plus, Search, MoreVertical, Edit, Trash2, Copy, PauseCircle, PlayCircle, Filter, Package } from 'lucide-react';

export default function InventoryPage() {
  const { addToast } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', category: '', brand: '', model: '', description: '', condition: 'Excellent',
    marketPrice: '', pricePerDay: '', pricePerHour: '', securityDeposit: '', damagePolicy: 'Minor',
    quantity: '1', deliveryType: 'Pickup Only', isAvailable: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/partner/products?filter=${filter}`);
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

  const handleAction = async (id: string, action: string, currentData?: any) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this product?')) return;
        await fetch(`/api/partner/products/${id}`, { method: 'DELETE' });
        addToast('Deleted', 'Product deleted successfully.');
        fetchProducts();
      } else if (action === 'toggleStatus') {
        await fetch(`/api/partner/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAvailable: !currentData.isAvailable }),
        });
        addToast('Updated', `Product is now ${!currentData.isAvailable ? 'Active' : 'Paused'}.`);
        fetchProducts();
      } else if (action === 'edit') {
        setFormData({
          name: currentData.name, category: currentData.category, brand: currentData.brand || '',
          model: currentData.model || '', description: currentData.description || '', condition: currentData.condition || 'Excellent',
          marketPrice: currentData.marketPrice || '', pricePerDay: currentData.pricePerDay || '',
          pricePerHour: currentData.pricePerHour || '', securityDeposit: currentData.securityDeposit || '',
          damagePolicy: currentData.damagePolicy || 'Minor', quantity: currentData.quantity || '1',
          deliveryType: currentData.deliveryType || 'Pickup Only', isAvailable: currentData.isAvailable,
        });
        setEditingId(id);
        setView('form');
      }
    } catch (error) {
      addToast('Error', 'Action failed.', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/partner/products/${editingId}` : '/api/partner/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast('Success', `Product ${editingId ? 'updated' : 'created'} successfully.`);
        setView('list');
        setEditingId(null);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      addToast('Error', 'Failed to save product.', 'error');
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">{editingId ? 'Edit Product' : 'Add New Product'}</h1>
          <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
        </div>
        
        <Card variant="default" className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Product Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <Input label="Category *" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                <Input label="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <Input label="Model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink">Condition</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                    <option>Brand New</option><option>Like New</option><option>Excellent</option><option>Good</option><option>Fair</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-ink">Description</label>
                <textarea className="w-full p-3 rounded-lg border border-slate-200 h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Market Price (₹)" type="number" value={formData.marketPrice} onChange={e => setFormData({...formData, marketPrice: e.target.value})} />
                <Input label="Per Day Rent (₹) *" type="number" required value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} />
                <Input label="Per Hour Rent (₹)" type="number" value={formData.pricePerHour} onChange={e => setFormData({...formData, pricePerHour: e.target.value})} />
                <Input label="Security Deposit (₹)" type="number" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink">Damage Policy</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200" value={formData.damagePolicy} onChange={e => setFormData({...formData, damagePolicy: e.target.value})}>
                    <option>Minor</option><option>Major</option><option>Replacement</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2">Availability & Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Quantity" type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink">Delivery Options</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200" value={formData.deliveryType} onChange={e => setFormData({...formData, deliveryType: e.target.value})}>
                    <option>Pickup Only</option><option>Delivery Available</option><option>Pickup + Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button type="button" variant="outline" onClick={(e) => { setFormData({...formData, isAvailable: false}); handleFormSubmit(e); }}>Save Draft</Button>
              <Button type="submit" variant="accent">{editingId ? 'Update Product' : 'Publish Product'}</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-display text-ink">Inventory Management</h1>
        <Button variant="accent" onClick={() => {
          setEditingId(null);
          setFormData({ name: '', category: '', brand: '', model: '', description: '', condition: 'Excellent', marketPrice: '', pricePerDay: '', pricePerHour: '', securityDeposit: '', damagePolicy: 'Minor', quantity: '1', deliveryType: 'Pickup Only', isAvailable: true });
          setView('form');
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <Card variant="default" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['All', 'Active', 'Out of Stock', 'Unavailable'].map((f) => (
              <button
                key={f}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-white shadow text-ink' : 'text-slate-500 hover:text-ink'}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search inventory..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-marigold" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate">Loading inventory...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-ink font-medium">No products found.</p>
            <p className="text-slate text-sm">Add your first product to start earning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Product Name</th>
                  <th className="px-4 py-3">Price / Day</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{item.name}</td>
                    <td className="px-4 py-3">₹{item.pricePerDay}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isAvailable && item.quantity > 0 ? 'bg-green-100 text-green-700' : item.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {item.isAvailable && item.quantity > 0 ? 'Active' : item.quantity === 0 ? 'Out of Stock' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleAction(item.id, 'toggleStatus', item)} className="text-slate-400 hover:text-ink p-1">
                        {item.isAvailable ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleAction(item.id, 'edit', item)} className="text-slate-400 hover:text-ink p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleAction(item.id, 'delete')} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
