'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import { ShieldCheck, LogOut, Save, ShieldAlert, CreditCard, LifeBuoy, Bell } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function ProfileSettingsPage() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Business Details');
  
  const [formData, setFormData] = useState({
    businessName: '', ownerName: '', address: '', gstNumber: '',
    aadhaarUrl: '', panUrl: '', shopLicenseUrl: '',
    bankAccount: '', upiId: '',
    rentalPolicy: '', damagePolicy: '', returnPolicy: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/partner/profile');
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/partner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast('Success', 'Profile settings updated successfully.');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      addToast('Error', 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const SETTING_TABS = ['Business Details', 'Documents', 'Payment Settings', 'Policies', 'Security & Notifications', 'Help & Support'];

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-2">
          Profile & Settings
          <ShieldCheck className="w-6 h-6 text-green-500" />
        </h1>
        <p className="text-slate text-sm">Manage your business profile, documents, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav for Settings */}
        <div className="md:w-64 shrink-0">
          <Card variant="default" className="p-2 overflow-hidden">
            <div className="flex flex-col space-y-1">
              {SETTING_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-marigold/10 text-ink' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
              <div className="my-2 border-t border-slate-100"></div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card variant="default" className="p-6 sm:p-8">
            {loading ? (
              <div className="text-center py-12 text-slate">Loading profile...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {activeTab === 'Business Details' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2">Business Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Business Name" name="businessName" value={formData.businessName || ''} onChange={handleChange} required />
                      <Input label="Owner Name" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} required />
                      <div className="md:col-span-2">
                        <Input label="Business Address" name="address" value={formData.address || ''} onChange={handleChange} required />
                      </div>
                      <Input label="GST Number" name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {activeTab === 'Documents' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2">Verification Documents</h2>
                    <div className="space-y-4">
                      <Input label="Aadhaar URL / Number" name="aadhaarUrl" value={formData.aadhaarUrl || ''} onChange={handleChange} />
                      <Input label="PAN URL / Number" name="panUrl" value={formData.panUrl || ''} onChange={handleChange} />
                      <Input label="Shop License URL" name="shopLicenseUrl" value={formData.shopLicenseUrl || ''} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {activeTab === 'Payment Settings' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2 flex items-center justify-between">
                      Bank Details
                      <Button type="button" variant="outline" size="sm">
                        <CreditCard className="w-4 h-4 mr-2" /> Request Withdrawal
                      </Button>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Bank Account Number" name="bankAccount" value={formData.bankAccount || ''} onChange={handleChange} />
                      <Input label="UPI ID" name="upiId" value={formData.upiId || ''} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {activeTab === 'Policies' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2">Store Policies</h2>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-ink">Rental Policy</label>
                      <textarea name="rentalPolicy" className="w-full p-3 rounded-lg border border-slate-200 h-24" value={formData.rentalPolicy || ''} onChange={handleChange} />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-ink">Damage Policy</label>
                      <textarea name="damagePolicy" className="w-full p-3 rounded-lg border border-slate-200 h-24" value={formData.damagePolicy || ''} onChange={handleChange} />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-ink">Return Policy</label>
                      <textarea name="returnPolicy" className="w-full p-3 rounded-lg border border-slate-200 h-24" value={formData.returnPolicy || ''} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {activeTab === 'Security & Notifications' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2 flex items-center gap-2"><Bell className="w-5 h-5"/> Notifications</h2>
                      <div className="mt-4 space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                          <div>
                            <p className="font-medium text-ink text-sm">New Request Alerts</p>
                            <p className="text-xs text-slate">Get notified when a customer makes a booking.</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-marigold focus:ring-marigold rounded" />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                          <div>
                            <p className="font-medium text-ink text-sm">Earnings Summary</p>
                            <p className="text-xs text-slate">Weekly digest of your performance.</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-marigold focus:ring-marigold rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Security</h2>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Button type="button" variant="outline">Change Password</Button>
                        <Button type="button" variant="outline">Enable Two-Factor Auth (2FA)</Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Help & Support' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h2 className="text-lg font-bold text-ink border-b border-slate-100 pb-2 flex items-center gap-2"><LifeBuoy className="w-5 h-5"/> Help & Support</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 hover:border-marigold cursor-pointer transition-colors">
                        <p className="font-bold text-ink mb-1">Contact Admin</p>
                        <p className="text-xs text-slate">Get direct help from our team.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 hover:border-marigold cursor-pointer transition-colors">
                        <p className="font-bold text-ink mb-1">Knowledge Base</p>
                        <p className="text-xs text-slate">Read FAQs and tutorials.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 hover:border-marigold cursor-pointer transition-colors md:col-span-2">
                        <p className="font-bold text-ink mb-1 text-red-600">Report an Issue</p>
                        <p className="text-xs text-slate">Is something broken? Let us know.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Save Button only on editable tabs */}
                {['Business Details', 'Documents', 'Payment Settings', 'Policies'].includes(activeTab) && (
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <Button type="submit" variant="accent" isLoading={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
