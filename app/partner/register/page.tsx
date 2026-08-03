'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import { CheckCircle2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';

const STEPS = [
  'Business Details',
  'Documents',
  'Payment Settings',
  'Policies & Terms',
];

export default function PartnerRegistrationPage() {
  const router = useRouter();
  const { addToast } = useApp();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    address: '',
    gstNumber: '',
    logoUrl: '',
    aadhaarUrl: '',
    panUrl: '',
    shopLicenseUrl: '',
    bankAccount: '',
    upiId: '',
    rentalPolicy: 'Standard 24-hour rental period.',
    damagePolicy: 'Renter is liable for repair costs.',
    returnPolicy: 'Must be returned by 5 PM on the end date.',
    agreedToTerms: false,
  });

  const updateForm = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.businessName || !formData.ownerName || !formData.address) {
      addToast('Error', 'Please fill all required fields.', 'error');
      return;
    }
    if (!formData.agreedToTerms) {
      addToast('Error', 'You must agree to the platform terms.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to register';
        try {
          const data = await res.json();
          if (data.error) errorMsg = data.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      // Auto login the user
      await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        loginType: 'partner',
        redirect: false,
      });

      addToast('Success!', 'Your business profile is ready.');
      router.push('/partner/dashboard');
      router.refresh();
    } catch (error: any) {
      addToast('Registration Failed', error.message || 'Please try again later.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-ink">Become a Business Partner</h1>
          <p className="text-slate text-sm mt-2">
            Join Borrow Hub as a partner to list your inventory and reach more customers.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/login')}>
          Back to Login
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1 relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                index <= currentStep ? 'bg-marigold text-ink' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                index <= currentStep ? 'text-ink' : 'text-slate-400'
              }`}
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-1 -z-0 ${
                  index < currentStep ? 'bg-marigold' : 'bg-slate-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {/* Step 1: Business Details */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Account & Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                placeholder="you@business.com"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />
              <Input
                label="Password *"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />
              <Input
                label="Business Name *"
                placeholder="e.g. Ace Rentals"
                value={formData.businessName}
                onChange={(e) => updateForm('businessName', e.target.value)}
              />
              <Input
                label="Owner Name *"
                placeholder="Your full name"
                value={formData.ownerName}
                onChange={(e) => updateForm('ownerName', e.target.value)}
              />
            </div>
            <Input
              label="Business Address *"
              placeholder="Full street address"
              value={formData.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />
            <Input
              label="GST Number (Optional)"
              placeholder="e.g. 22AAAAA0000A1Z5"
              value={formData.gstNumber}
              onChange={(e) => updateForm('gstNumber', e.target.value)}
            />
          </div>
        )}

        {/* Step 2: Documents */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Document Uploads</h2>
            <p className="text-sm text-slate mb-4">
              Upload your documents for verification. (For demo purposes, just provide text URLs or leave default)
            </p>
            <div className="space-y-4">
              <Input
                label="Aadhaar URL / Number"
                placeholder="Enter Aadhaar ID"
                value={formData.aadhaarUrl}
                onChange={(e) => updateForm('aadhaarUrl', e.target.value)}
              />
              <Input
                label="PAN URL / Number"
                placeholder="Enter PAN"
                value={formData.panUrl}
                onChange={(e) => updateForm('panUrl', e.target.value)}
              />
              <Input
                label="Shop License URL"
                placeholder="Enter License URL or ID"
                value={formData.shopLicenseUrl}
                onChange={(e) => updateForm('shopLicenseUrl', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment Settings */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Payment Information</h2>
            <Input
              label="Bank Account Number"
              placeholder="Enter your account number"
              value={formData.bankAccount}
              onChange={(e) => updateForm('bankAccount', e.target.value)}
            />
            <Input
              label="UPI ID"
              placeholder="e.g. yourname@upi"
              value={formData.upiId}
              onChange={(e) => updateForm('upiId', e.target.value)}
            />
          </div>
        )}

        {/* Step 4: Policies & Terms */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Policies & Terms</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Rental Policy</label>
              <textarea
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marigold/50 text-sm h-24"
                value={formData.rentalPolicy}
                onChange={(e) => updateForm('rentalPolicy', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Damage Policy</label>
              <textarea
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marigold/50 text-sm h-24"
                value={formData.damagePolicy}
                onChange={(e) => updateForm('damagePolicy', e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 text-marigold border-slate-300 rounded focus:ring-marigold"
                checked={formData.agreedToTerms}
                onChange={(e) => updateForm('agreedToTerms', e.target.checked)}
              />
              <span className="text-sm text-slate-700">
                I agree to the Borrow Hub Platform Terms and Conditions. I confirm that all information provided is accurate and true.
              </span>
            </label>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button variant="accent" onClick={nextStep}>
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!formData.agreedToTerms}
            >
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
